<?php

/**
 * Orders API Endpoints
 */

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Changed to 5173
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment FIRST
require_once __DIR__ . '/../config/Environment.php';


// Fix paths
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

$orderController = new OrderController();
$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];

    $logger->info("Orders API Request: {$method} {$path}");

    // Extract endpoint
    $endpoint = str_replace('/api/', '', $path);

    switch ($method) {
        case 'GET':
            if ($endpoint === 'orders') {
                $orderController->getAllOrders();
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'POST':
            if ($endpoint === 'orders') {
                $orderController->createOrder();
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'PUT':
            if (preg_match('/^orders\/(\d+)\/status$/', $endpoint, $matches)) {
                $orderController->updateOrderStatus($matches[1]);
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        default:
            Response::error('Method not allowed', [], 405);
            break;
    }
} catch (Exception $e) {
    $logger->error("Orders API Error: " . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
