<?php

/**
 * Main entry point for Aunt Joy Restaurant API
 */

// Set CORS headers properly
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'utils/Response.php';
require_once 'utils/Logger.php';

$logger = new Logger();

try {
    $path = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];

    $logger->info("API Request: {$method} {$path}");

    // Simple routing
    if (strpos($path, '/api/auth/') === 0) {
        require_once 'api/auth.php';
    } elseif (strpos($path, '/api/users') === 0) {
        require_once 'api/users.php';
    } elseif (strpos($path, '/api/meals') === 0) {
        require_once 'api/meals.php';
    } elseif (strpos($path, '/api/orders') === 0) {
        require_once 'api/orders.php';
    } elseif (strpos($path, '/api/reports') === 0) {
        require_once 'api/reports.php';
    } else {
        Response::error('Endpoint not found: ' . $path, [], 404);
    }
} catch (Exception $e) {
    $logger->error("API Error: " . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
