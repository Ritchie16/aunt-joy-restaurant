<?php

/**
 * Reports API Endpoints
 */

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Changed to 5173
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

$reportController = new ReportController();
$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    $logger->info("Reports API Request: {$method} {$path}");

    // Extract endpoint
    $endpoint = ltrim(substr($path, strlen('/api/')), '/');

    switch ($method) {
        case 'GET':
            if ($endpoint === 'reports') {
                $reportController->generateSalesReport();
            } elseif ($endpoint === 'reports/export' || $endpoint === 'reports-export') {
                $reportController->exportReport();
            } elseif ($endpoint === 'reports/financial' || $endpoint === 'reports-financial') {
                $reportController->getFinancialSummary();
            } elseif ($endpoint === 'reports/categories' || $endpoint === 'reports-categories') {
                $reportController->getPopularCategories();
            } elseif ($endpoint === 'reports/customer-insights' || $endpoint === 'reports-customer-insights') {
                $reportController->getCustomerInsights();
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        default:
            Response::error('Method not allowed', [], 405);
            break;
    }
} catch (Exception $e) {
    $logger->error("Reports API Error: " . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
