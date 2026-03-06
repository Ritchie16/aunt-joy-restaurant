<?php
/**
 * Report Model - Handles report generation and data aggregation
 */
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/Logger.php';

class Report {
    private $conn;
    private $logger;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->logger = new Logger();
    }

    /**
     * Generate sales report for a specific month and year
     */
    public function generateSalesReport($month, $year) {
        try {
            $this->logger->info("Generating sales report for {$month}/{$year}");

            $report = [
                'total_revenue' => 0,
                'total_orders' => 0,
                'average_order_value' => 0,
                'active_customers' => 0,
                'top_selling_items' => [],
                'daily_sales' => [],
                'order_status_distribution' => [],
                'revenue_by_category' => []
            ];

            // Total Revenue and Orders
            $revenueQuery = "
                SELECT
                    COUNT(*) as total_orders,
                    COALESCE(SUM(total_amount), 0) as total_revenue,
                    COALESCE(AVG(total_amount), 0) as average_order_value
                FROM orders
                WHERE MONTH(created_at) = :month
                AND YEAR(created_at) = :year
                AND status != 'cancelled'
            ";

            $stmt = $this->conn->prepare($revenueQuery);
            $stmt->execute(['month' => $month, 'year' => $year]);
            $revenueData = $stmt->fetch(PDO::FETCH_ASSOC);

            $report['total_orders'] = (int)$revenueData['total_orders'];
            $report['total_revenue'] = (float)$revenueData['total_revenue'];
            $report['average_order_value'] = (float)$revenueData['average_order_value'];

            // Active Customers (customers who placed orders in the period)
            $customersQuery = "
                SELECT COUNT(DISTINCT customer_id) as active_customers
                FROM orders
                WHERE MONTH(created_at) = :month
                AND YEAR(created_at) = :year
            ";

            $stmt = $this->conn->prepare($customersQuery);
            $stmt->execute(['month' => $month, 'year' => $year]);
            $customersData = $stmt->fetch(PDO::FETCH_ASSOC);
            $report['active_customers'] = (int)$customersData['active_customers'];

            // Top Selling Items
            $topItemsQuery = "
                SELECT
                    m.id as meal_id,
                    m.name as meal_name,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.total_price) as total_revenue
                FROM order_items oi
                JOIN meals m ON oi.meal_id = m.id
                JOIN orders o ON oi.order_id = o.id
                WHERE MONTH(o.created_at) = :month
                AND YEAR(o.created_at) = :year
                AND o.status != 'cancelled'
                GROUP BY m.id, m.name
                ORDER BY total_quantity DESC
                LIMIT 10
            ";

            $stmt = $this->conn->prepare($topItemsQuery);
            $stmt->execute(['month' => $month, 'year' => $year]);
            $report['top_selling_items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Daily Sales
            $dailySalesQuery = "
                SELECT
                    DATE(created_at) as date,
                    COUNT(*) as order_count,
                    COALESCE(SUM(total_amount), 0) as revenue
                FROM orders
                WHERE MONTH(created_at) = :month
                AND YEAR(created_at) = :year
                AND status != 'cancelled'
                GROUP BY DATE(created_at)
                ORDER BY date
            ";

            $stmt = $this->conn->prepare($dailySalesQuery);
            $stmt->execute(['month' => $month, 'year' => $year]);
            $report['daily_sales'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Find max daily revenue for chart scaling
            $maxRevenue = 0;
            foreach ($report['daily_sales'] as $day) {
                if ($day['revenue'] > $maxRevenue) {
                    $maxRevenue = $day['revenue'];
                }
            }
            $report['max_daily_revenue'] = $maxRevenue;

            // Order Status Distribution
            $statusQuery = "
                SELECT
                    status,
                    COUNT(*) as count
                FROM orders
                WHERE MONTH(created_at) = :month
                AND YEAR(created_at) = :year
                GROUP BY status
            ";

            $stmt = $this->conn->prepare($statusQuery);
            $stmt->execute(['month' => $month, 'year' => $year]);
            $statusData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $statusDistribution = [];
            foreach ($statusData as $status) {
                $statusDistribution[$status['status']] = (int)$status['count'];
            }
            $report['order_status_distribution'] = $statusDistribution;

            // Revenue by Category
            $categoryRevenueQuery = "
                SELECT
                    c.id as category_id,
                    c.name as category_name,
                    COALESCE(SUM(oi.total_price), 0) as total_revenue
                FROM categories c
                LEFT JOIN meals m ON c.id = m.category_id
                LEFT JOIN order_items oi ON m.id = oi.meal_id
                LEFT JOIN orders o ON oi.order_id = o.id
                AND MONTH(o.created_at) = :month
                AND YEAR(o.created_at) = :year
                AND o.status != 'cancelled'
                GROUP BY c.id, c.name
                ORDER BY total_revenue DESC
            ";

            $stmt = $this->conn->prepare($categoryRevenueQuery);
            $stmt->execute(['month' => $month, 'year' => $year]);
            $report['revenue_by_category'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Sales report generated successfully for {$month}/{$year}");
            return $report;

        } catch (PDOException $e) {
            $this->logger->error("Error generating sales report: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate financial summary
     */
    public function generateFinancialSummary($startDate, $endDate) {
        try {
            $this->logger->info("Generating financial summary from {$startDate} to {$endDate}");

            $query = "
                SELECT
                    COUNT(*) as total_orders,
                    COALESCE(SUM(total_amount), 0) as total_revenue,
                    COALESCE(AVG(total_amount), 0) as average_order_value,
                    COUNT(DISTINCT customer_id) as unique_customers
                FROM orders
                WHERE created_at BETWEEN :start_date AND :end_date
                AND status != 'cancelled'
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);

            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->logger->info("Financial summary generated successfully");

            return $summary;

        } catch (PDOException $e) {
            $this->logger->error("Error generating financial summary: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get customer order history
     */
    public function getCustomerOrderHistory($customerId) {
        try {
            $this->logger->info("Generating order history for customer: {$customerId}");

            $query = "
                SELECT
                    o.*,
                    COUNT(oi.id) as item_count,
                    SUM(oi.quantity) as total_quantity
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.customer_id = :customer_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute(['customer_id' => $customerId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Order history generated for customer: {$customerId}");
            return $history;

        } catch (PDOException $e) {
            $this->logger->error("Error generating customer order history: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get popular meal categories
     */
    public function getPopularCategories($limit = 5) {
        try {
            $this->logger->info("Getting popular categories");

            $query = "
                SELECT
                    c.name as category_name,
                    COUNT(oi.id) as order_count,
                    SUM(oi.quantity) as total_quantity,
                    COALESCE(SUM(oi.total_price), 0) as total_revenue
                FROM categories c
                LEFT JOIN meals m ON c.id = m.category_id
                LEFT JOIN order_items oi ON m.id = oi.meal_id
                LEFT JOIN orders o ON oi.order_id = o.id
                AND o.status != 'cancelled'
                GROUP BY c.id, c.name
                ORDER BY total_revenue DESC
                LIMIT :limit
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Popular categories retrieved");
            return $categories;

        } catch (PDOException $e) {
            $this->logger->error("Error getting popular categories: " . $e->getMessage());
            return false;
        }
    }
}
?>
