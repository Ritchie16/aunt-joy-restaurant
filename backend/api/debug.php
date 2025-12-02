<?php
// api/debug.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../config/Database.php';

$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];

    $logger->info("Debug endpoint called: {$method} {$path}");

    $response = [
        'success' => true,
        'message' => 'Debug information',
        'data' => [
            'server' => [
                'method' => $method,
                'path' => $path,
                'query_string' => $_SERVER['QUERY_STRING'] ?? '',
                'php_version' => phpversion(),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
            ],
            'request' => [
                'get' => $_GET,
                'post' => $_POST,
                'files' => array_keys($_FILES),
                'headers' => getallheaders(),
            ],
            'database' => [
                'connected' => false,
                'tables' => [],
            ],
            'endpoints' => [
                '/api/meals' => 'Get all meals',
                '/api/meals-available' => 'Get available meals',
                '/api/categories' => 'Get all categories',
                '/api/debug' => 'This debug endpoint',
            ]
        ]
    ];

    // Test database connection
    try {
        $database = new Database();
        $conn = $database->getConnection();

        $response['data']['database']['connected'] = true;

        // Get table list
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $response['data']['database']['tables'] = $tables;

        // Get meal categories count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM categories");
        $categoriesCount = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['data']['database']['categories_count'] = $categoriesCount['count'];

        // Get meals count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM meals");
        $mealsCount = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['data']['database']['meals_count'] = $mealsCount['count'];
    } catch (PDOException $e) {
        $response['data']['database']['error'] = $e->getMessage();
        $logger->error("Database debug error: " . $e->getMessage());
    }

    echo json_encode($response, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    $logger->error("Debug endpoint error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Debug error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
