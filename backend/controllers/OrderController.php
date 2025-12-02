<?php
/**
 * Order Controller - Handles all order-related operations
 */
require_once '../models/Order.php';
require_once '../models/User.php';
require_once '../middleware/Validation.php';
require_once '../utils/Response.php';
require_once '../utils/Logger.php';

class OrderController {
    private $orderModel;
    private $userModel;
    private $validation;
    private $logger;

    public function __construct() {
        $this->orderModel = new Order();
        $this->userModel = new User();
        $this->validation = new Validation();
        $this->logger = new Logger();
    }

    /**
     * Create new order (customer)
     */
    public function createOrder() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Creating new order for customer");

            // Authenticate customer
            $customer = $this->authenticateCustomer();
            if (!$customer) return;

            // Validate order data
            $errors = $this->validation->validateOrderCreation($data);
            if (!empty($errors)) {
                Response::validationError($errors);
                return;
            }

            // Generate order number
            $orderNumber = 'AJ' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Prepare order data
            $orderData = [
                'customer_id' => $customer['user_id'],
                'order_number' => $orderNumber,
                'total_amount' => $data['total_amount'],
                'delivery_address' => $data['delivery_address'],
                'customer_phone' => $data['customer_phone'],
                'special_instructions' => $data['special_instructions'] ?? null
            ];

            // Create order
            $orderId = $this->orderModel->create($orderData, $data['items']);
            if (!$orderId) {
                Response::error('Failed to create order');
                return;
            }

            $this->logger->info("Order created successfully: {$orderNumber} (ID: {$orderId})");
            Response::success('Order created successfully', [
                'order_id' => $orderId,
                'order_number' => $orderNumber
            ], 201);

        } catch (Exception $e) {
            $this->logger->error("Error in createOrder: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get orders for customer
     */
    public function getCustomerOrders() {
        try {
            $this->logger->info("Fetching customer orders");

            // Authenticate customer
            $customer = $this->authenticateCustomer();
            if (!$customer) return;

            $orders = $this->orderModel->getByCustomerId($customer['user_id']);

            if ($orders === false) {
                Response::error('Failed to retrieve orders');
                return;
            }

            $this->logger->info("Retrieved " . count($orders) . " orders for customer ID: {$customer['user_id']}");
            Response::success('Orders retrieved successfully', $orders);

        } catch (Exception $e) {
            $this->logger->error("Error in getCustomerOrders: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get all orders (for admin/sales)
     */
    public function getAllOrders() {
        try {
            $this->logger->info("Fetching all orders");

            // Authenticate staff
            $staff = $this->authenticateStaff();
            if (!$staff) return;

            $orders = $this->orderModel->getAllWithDetails();

            if ($orders === false) {
                Response::error('Failed to retrieve orders');
                return;
            }

            $this->logger->info("Retrieved " . count($orders) . " orders");
            Response::success('Orders retrieved successfully', $orders);

        } catch (Exception $e) {
            $this->logger->error("Error in getAllOrders: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Update order status (sales personnel)
     */
    public function updateOrderStatus($orderId) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Updating order status for ID: {$orderId}");

            // Authenticate sales personnel
            $staff = $this->authenticateSales();
            if (!$staff) return;

            // Validate status
            $allowedStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
            if (!isset($data['status']) || !in_array($data['status'], $allowedStatuses)) {
                Response::error('Invalid status specified');
                return;
            }

            // Update order status
            $success = $this->orderModel->updateStatus($orderId, $data['status']);
            if (!$success) {
                Response::error('Failed to update order status');
                return;
            }

            $this->logger->info("Order status updated: ID {$orderId} -> {$data['status']}");
            Response::success('Order status updated successfully');

        } catch (Exception $e) {
            $this->logger->error("Error in updateOrderStatus: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get order details
     */
    public function getOrderDetails($orderId) {
        try {
            $this->logger->info("Fetching details for order ID: {$orderId}");

            // Authenticate user
            $user = $this->authenticateUser();
            if (!$user) return;

            $order = $this->orderModel->getByIdWithDetails($orderId);

            if (!$order) {
                Response::error('Order not found');
                return;
            }

            // Check if user has permission to view this order
            if ($user['role'] === 'customer' && $order['customer_id'] != $user['user_id']) {
                Response::error('Access denied', [], 403);
                return;
            }

            $this->logger->info("Order details retrieved: ID {$orderId}");
            Response::success('Order details retrieved successfully', $order);

        } catch (Exception $e) {
            $this->logger->error("Error in getOrderDetails: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Authenticate customer
     */
    private function authenticateCustomer() {
        return $this->authenticateUser(['customer']);
    }

    /**
     * Authenticate staff (admin, manager, sales)
     */
    private function authenticateStaff() {
        return $this->authenticateUser(['admin', 'manager', 'sales']);
    }

    /**
     * Authenticate sales personnel
     */
    private function authenticateSales() {
        return $this->authenticateUser(['admin', 'sales']);
    }

    /**
     * Authenticate user with specific roles
     */
    private function authenticateUser($allowedRoles = []) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::error('Authentication required', [], 401);
            return false;
        }

        $token = $matches[1];
        $payload = AuthController::verifyToken($token);

        if (!$payload) {
            Response::error('Invalid or expired token', [], 401);
            return false;
        }

        if (!empty($allowedRoles) && !in_array($payload['role'], $allowedRoles)) {
            Response::error('Access denied', [], 403);
            return false;
        }

        return $payload;
    }
}
?>