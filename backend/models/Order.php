<?php
/**
 * Order Model - Handles order database operations
 */
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/Logger.php';

class Order
{
    private $conn;
    private $ordersTable = 'orders';
    private $itemsTable = 'order_items';
    private $logger;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->logger = new Logger();
    }

    /**
     * Create order and items in one transaction
     */
    public function create($orderData, $items)
    {
        try {
            $this->conn->beginTransaction();

            $orderQuery = "
                INSERT INTO {$this->ordersTable}
                (customer_id, order_number, total_amount, delivery_address, customer_phone, special_instructions)
                VALUES (:customer_id, :order_number, :total_amount, :delivery_address, :customer_phone, :special_instructions)
            ";

            $orderStmt = $this->conn->prepare($orderQuery);
            $orderStmt->execute([
                ':customer_id' => $orderData['customer_id'],
                ':order_number' => $orderData['order_number'],
                ':total_amount' => $orderData['total_amount'],
                ':delivery_address' => $orderData['delivery_address'],
                ':customer_phone' => $orderData['customer_phone'],
                ':special_instructions' => $orderData['special_instructions'] ?? null,
            ]);

            $orderId = (int)$this->conn->lastInsertId();

            $itemQuery = "
                INSERT INTO {$this->itemsTable}
                (order_id, meal_id, quantity, unit_price, total_price)
                VALUES (:order_id, :meal_id, :quantity, :unit_price, :total_price)
            ";
            $itemStmt = $this->conn->prepare($itemQuery);

            foreach ($items as $item) {
                $itemStmt->execute([
                    ':order_id' => $orderId,
                    ':meal_id' => $item['meal_id'],
                    ':quantity' => $item['quantity'],
                    ':unit_price' => $item['unit_price'],
                    ':total_price' => $item['total_price'],
                ]);
            }

            $this->conn->commit();
            $this->logger->info("Order created successfully: ID {$orderId}");

            return $orderId;
        } catch (PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            $this->logger->error('Error creating order: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all orders for customer
     */
    public function getByCustomerId($customerId)
    {
        try {
            $query = "
                SELECT
                    o.*,
                    u.name as customer_name,
                    COUNT(oi.id) as item_count,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity
                FROM {$this->ordersTable} o
                INNER JOIN users u ON u.id = o.customer_id
                LEFT JOIN {$this->itemsTable} oi ON oi.order_id = o.id
                WHERE o.customer_id = :customer_id
                GROUP BY o.id, u.name
                ORDER BY o.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([':customer_id' => $customerId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->error('Error fetching customer orders: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all orders with customer details (staff views)
     */
    public function getAllWithDetails()
    {
        try {
            $query = "
                SELECT
                    o.*,
                    u.name as customer_name,
                    u.email as customer_email,
                    COUNT(oi.id) as item_count,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity
                FROM {$this->ordersTable} o
                INNER JOIN users u ON u.id = o.customer_id
                LEFT JOIN {$this->itemsTable} oi ON oi.order_id = o.id
                GROUP BY o.id, u.name, u.email
                ORDER BY o.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->logger->error('Error fetching all orders: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get one order plus its line items
     */
    public function getByIdWithDetails($orderId)
    {
        try {
            $orderQuery = "
                SELECT
                    o.*,
                    u.name as customer_name,
                    u.email as customer_email
                FROM {$this->ordersTable} o
                INNER JOIN users u ON u.id = o.customer_id
                WHERE o.id = :order_id
                LIMIT 1
            ";

            $orderStmt = $this->conn->prepare($orderQuery);
            $orderStmt->execute([':order_id' => $orderId]);
            $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                return false;
            }

            $itemsQuery = "
                SELECT
                    oi.id,
                    oi.meal_id,
                    oi.quantity,
                    oi.unit_price,
                    oi.total_price,
                    m.name as meal_name,
                    m.image_path
                FROM {$this->itemsTable} oi
                INNER JOIN meals m ON m.id = oi.meal_id
                WHERE oi.order_id = :order_id
                ORDER BY oi.id ASC
            ";

            $itemsStmt = $this->conn->prepare($itemsQuery);
            $itemsStmt->execute([':order_id' => $orderId]);
            $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

            return $order;
        } catch (PDOException $e) {
            $this->logger->error('Error fetching order details: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update order status
     */
    public function updateStatus($orderId, $status)
    {
        try {
            $query = "UPDATE {$this->ordersTable} SET status = :status WHERE id = :order_id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':status' => $status,
                ':order_id' => $orderId,
            ]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            $this->logger->error('Error updating order status: ' . $e->getMessage());
            return false;
        }
    }
}
?>
