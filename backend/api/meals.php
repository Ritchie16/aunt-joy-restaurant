<?php

/**
 * Meals API Endpoints - Simplified version
 */

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set base directory
$baseDir = dirname(__DIR__);

// Load required files
require_once $baseDir . '/utils/Response.php';
require_once $baseDir . '/utils/Logger.php';

try {
    // Initialize logger
    $logger = new Logger();
    $logger->info("Meals API Request: {$_SERVER['REQUEST_METHOD']} {$_SERVER['REQUEST_URI']}");

    // Load controllers
    require_once $baseDir . '/controllers/MealController.php';
    require_once $baseDir . '/controllers/CategoryController.php';

    $mealController = new MealController();
    $categoryController = new CategoryController();

    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Extract endpoint
    $endpoint = ltrim(substr($path, strlen('/api/')), '/');

    // Remove trailing slash
    $endpoint = rtrim($endpoint, '/');

    $logger->debug("Endpoint: {$endpoint}");

    // Route the request
    switch ($method) {
        case 'GET':
            if ($endpoint === 'meals') {
                $mealController->getAllMeals();
            } elseif ($endpoint === 'meals-available') {
                $mealController->getAvailableMeals();
            } elseif ($endpoint === 'categories') {
                $categoryController->getAllCategories();
            } elseif (preg_match('/^categories\/(\d+)$/', $endpoint, $matches)) {
                $categoryController->getCategoryById($matches[1]);
            } else {
                Response::error('Endpoint not found: ' . $endpoint, [], 404);
            }
            break;

        case 'POST':
            if ($endpoint === 'meals') {
                $mealController->createMeal();
            } elseif (preg_match('/^meals\/(\d+)$/', $endpoint, $matches)) {
                // Support multipart/form-data updates via POST for file uploads.
                $mealController->updateMeal($matches[1]);
            } elseif ($endpoint === 'categories') {
                $categoryController->createCategory();
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'PUT':
            if (preg_match('/^meals\/(\d+)$/', $endpoint, $matches)) {
                $mealController->updateMeal($matches[1]);
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'DELETE':
            if (preg_match('/^meals\/(\d+)$/', $endpoint, $matches)) {
                $mealController->deleteMeal($matches[1]);
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        default:
            Response::error('Method not allowed', [], 405);
            break;
    }
} catch (Exception $e) {
    // Create logger if not already created
    if (!isset($logger)) {
        require_once $baseDir . '/utils/Logger.php';
        $logger = new Logger();
    }

    $logger->error("Meals API Error: " . $e->getMessage());
    $logger->error("Stack trace: " . $e->getTraceAsString());

    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
