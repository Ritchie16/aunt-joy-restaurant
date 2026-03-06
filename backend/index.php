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

// Set the base directory for includes
$baseDir = __DIR__;

// Load required files with absolute paths
require_once $baseDir . '/utils/Response.php';
require_once $baseDir . '/utils/Logger.php';

$logger = new Logger();

try {
    $path = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];

    $logger->info("API Request: {$method} {$path}");

    // Remove query string for routing
    $path = parse_url($path, PHP_URL_PATH);

    $logger->debug("Path after parse_url: {$path}");

    // Serve uploaded files directly
    if (strpos($path, '/uploads/') === 0) {
        $filePath = __DIR__ . $path;
        if (is_file($filePath)) {
            $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
            header('Content-Type: ' . $mimeType);
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit();
        }

        http_response_code(404);
        echo 'File not found';
        exit();
    }

    // Simple routing
    if (strpos($path, '/api/auth/') === 0) {
        $logger->debug("Routing to auth.php");
        require_once $baseDir . '/api/auth.php';
    } elseif (strpos($path, '/api/users') === 0) {
        $logger->debug("Routing to users.php");
        require_once $baseDir . '/api/users.php';
    } elseif (strpos($path, '/api/meals') === 0) {
        $logger->debug("Routing to meals.php");
        require_once $baseDir . '/api/meals.php';
    } elseif (strpos($path, '/api/categories') === 0) {
        $logger->debug("Routing to categories.php");
        require_once $baseDir . '/api/categories.php';
    } elseif (strpos($path, '/api/orders') === 0) {
        $logger->debug("Routing to orders.php");
        require_once $baseDir . '/api/orders.php';
    } elseif (strpos($path, '/api/reports') === 0) {
        $logger->debug("Routing to reports.php");
        require_once $baseDir . '/api/reports.php';
    } elseif ($path === '/api/debug') {
        $logger->debug("Routing to debug.php");
        require_once $baseDir . '/api/debug.php';
    } elseif ($path === '/api/test') {
        $logger->debug("Routing to test endpoint");
        require_once $baseDir . '/api/test.php';
    } else {
        $logger->warning("Endpoint not found: {$path}");
        Response::error('Endpoint not found: ' . $path, [], 404);
    }
} catch (Exception $e) {
    $logger->error("API Error: " . $e->getMessage());
    $logger->error("Stack trace: " . $e->getTraceAsString());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
