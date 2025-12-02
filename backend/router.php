<?php

/**
 * Router for PHP Built-in Server
 * Handles all API routes and serves the appropriate files
 */

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Set CORS headers for all responses
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// API routes
if (strpos($path, '/api/') === 0) {
    // Remove /api prefix
    $api_path = substr($path, 4); // Removes "/api"

    // Route to appropriate API file
    switch (true) {
        case $api_path === '/auth/login' && $_SERVER['REQUEST_METHOD'] === 'POST':
            require __DIR__ . '/api/auth.php';
            break;

        case $api_path === '/auth/register' && $_SERVER['REQUEST_METHOD'] === 'POST':
            require __DIR__ . '/api/auth.php';
            break;

        case $api_path === '/auth/verify' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/auth.php';
            break;

        case $api_path === '/users' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/users.php';
            break;

        case $api_path === '/users' && $_SERVER['REQUEST_METHOD'] === 'POST':
            require __DIR__ . '/api/users.php';
            break;

        case preg_match('#^/users/(\d+)$#', $api_path) && $_SERVER['REQUEST_METHOD'] === 'PUT':
            require __DIR__ . '/api/users.php';
            break;

        case preg_match('#^/users/(\d+)$#', $api_path) && $_SERVER['REQUEST_METHOD'] === 'DELETE':
            require __DIR__ . '/api/users.php';
            break;

        case $api_path === '/meals' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/meals.php';
            break;

        case $api_path === '/meals-available' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/meals.php';
            break;

        case $api_path === '/categories' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/meals.php';
            break;

        case $api_path === '/orders' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/orders.php';
            break;

        case $api_path === '/orders' && $_SERVER['REQUEST_METHOD'] === 'POST':
            require __DIR__ . '/api/orders.php';
            break;

        case preg_match('#^/orders/(\d+)/status$#', $api_path) && $_SERVER['REQUEST_METHOD'] === 'PUT':
            require __DIR__ . '/api/orders.php';
            break;

        case $api_path === '/reports' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/reports.php';
            break;

        case $api_path === '/reports-export' && $_SERVER['REQUEST_METHOD'] === 'GET':
            require __DIR__ . '/api/reports.php';
            break;

        default:
            // API endpoint not found
            header('Content-Type: application/json');
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'API endpoint not found: ' . $api_path,
                'method' => $_SERVER['REQUEST_METHOD']
            ]);
            break;
    }
    exit();
}

// Default response for root
if ($path === '/') {
    echo "Aunt Joy Restaurant API Server is running!\n";
    echo "Available endpoints:\n";
    echo "- POST /api/auth/login\n";
    echo "- POST /api/auth/register\n";
    echo "- GET /api/auth/verify\n";
    echo "- GET /api/users\n";
    echo "- POST /api/users\n";
    echo "- GET /api/meals\n";
    echo "- GET /api/orders\n";
    echo "- GET /api/reports\n";
    exit();
}

// 404 for everything else
http_response_code(404);
echo "404 - Page not found: " . $path;
