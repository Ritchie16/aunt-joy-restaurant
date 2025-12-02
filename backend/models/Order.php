<?php
/**
 * Order Model - Handles order database operations
 */
require_once '../config/Database.php';
require_once '../utils/Logger.php';

class Order {
    private $conn;
    private $table = 'orders';
    private $itemsTable = 'order_items';
    private $logger;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->logger = new Logger();
    }

    /**
     * Create new order with items
     */
    public function create($orderData, $items) {
        $this->conn->beginTransaction();

        try {
            // Insert order
            $query = "
                INSERT INTO {$this->table}
                (customer_id, order_number, total_amount, delivery_address, customer_phone, special_instructions)
                VALUES (:customer_id, :order_number, :total_amount, :delivery_address, :customer_phone, :special_instructions)
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute($orderData);
            $orderId = $this->conn->lastInsertId();

            // Insert order items
            foreach ($items as $item) {
                $itemQuery = "
                    INSERT INTO {$this->itemsTable}
                    (order_id, meal_id, quantity, unit_price, total_price)
                    VALUES (:order_id, :meal_id, :quantity, :unit_price, :total_price)
                ";

                $itemStmt = $this->conn->prepare($itemQuery);
                $itemStmt->execute([
                    'order_id' => $orderId,
                    'meal_id' => $item['meal_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price']
                ]);
            }

            $this->conn->commit();
            $this->logger->info("Order created successfully: {$orderData['order_number']}");
            return $orderId;

        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->logger->error("Error creating order: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get orders by customer ID
     */
    public function getByCustomerId($customerId) {
        try {
            $query = "
                SELECT o.*,
                       COUNT(oi.id) as item_count,
                       SUM(oi.quantity) as total_quantity
                FROM {$this->table} o
                LEFT JOIN {$this->itemsTable} oi ON o.id = oi.order_id
                WHERE o.customer_id = :customer_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':customer_id', $customerId);
            $stmt->execute();

            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->logger->debug("Retrieved " . count($orders) . " orders for customer ID: {$customerId}");

            return $orders;

        } catch (PDOException $e) {
            $this->logger->error("Error retrieving orders for customer {$customerId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all orders with customer details
     */
    public function getAllWithDetails() {
        try {
            $query = "
                SELECT o.*,
                       u.name as customer_name,
                       u.email as customer_email,
                       u.phone as customer_phone,
                       COUNT(oi.id) as item_count,
                       SUM(oi.quantity) as total_quantity
                FROM {$this->table} o
                LEFT JOIN users u ON o.customer_id = u.id
                LEFT JOIN {$this->itemsTable} oi ON o.id = oi.order_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->logger->debug("Retrieved " . count($orders) . " orders with details");

            return $orders;

        } catch (PDOException $e) {
            $this->logger->error("Error retrieving all orders: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get order by ID with full details
     */
    public function getByIdWithDetails($orderId) {
        try {
            // Get order basic info
            $orderQuery = "
                SELECT o.*, u.name as customer_name, u.email as customer_email
                FROM {$this->table} o
                LEFT JOIN users u ON o.customer_id = u.id
                WHERE o.id = :order_id
            ";

            $orderStmt = $this->conn->prepare($orderQuery);
            $orderStmt->bindParam(':order_id', $orderId);
            $orderStmt->execute();
            $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                return null;
            }

            // Get order items
            $itemsQuery = "
                SELECT oi.*, m.name as meal_name, m.image_path
                FROM {$this->itemsTable} oi
                LEFT JOIN meals m ON oi.meal_id = m.id
                WHERE oi.order_id = :order_id
            ";

            $itemsStmt = $this->conn->prepare($itemsQuery);
            $itemsStmt->bindParam(':order_id', $orderId);
            $itemsStmt->execute();
            $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

            $order['items'] = $items;
            $this->logger->debug("Retrieved full details for order ID: {$orderId}");

            return $order;

        } catch (PDOException $e) {
            $this->logger->error("Error retrieving order details for ID {$orderId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update order status
     */
    public function updateStatus($orderId, $status) {
        try {
            $query = "UPDATE {$this->table} SET status = :status WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $orderId);
            $stmt->execute();

            $this->logger->info("Order status updated: ID {$orderId} -> {$status}");
            return true;

        } catch (PDOException $e) {
            $this->logger->error("Error updating order status for ID {$orderId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get orders by status
     */
    public function getByStatus($status) {
        try {
            $query = "
                SELECT o.*, u.name as customer_name, u.phone as customer_phone
                FROM {$this->table} o
                LEFT JOIN users u ON o.customer_id = u.id
                WHERE o.status = :status
                ORDER BY o.created_at ASC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->execute();

            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->logger->debug("Retrieved " . count($orders) . " orders with status: {$status}");

            return $orders;

        } catch (PDOException $e) {
            $this->logger->error("Error retrieving orders by status {$status}: " . $e->getMessage());
            return false;
        }
    }
}
?>