<?php

/**
 * Categories API Endpoints
 */

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Suppress PHP warnings from output
error_reporting(0);
ini_set('display_errors', 0);

// Start output buffering to capture any stray output
ob_start();

try {
    // Load required files
    require_once __DIR__ . '/../config/Database.php';
    require_once __DIR__ . '/../models/Category.php';
    require_once __DIR__ . '/../controllers/CategoryController.php';
    require_once __DIR__ . '/../utils/Response.php';
    require_once __DIR__ . '/../utils/Logger.php';

    // Clean any output before starting
    ob_clean();

    $categoryController = new CategoryController();
    $logger = new Logger();

    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];

    $logger->info("Categories API Request: {$method} {$path}");

    // Route requests
    switch ($method) {
        case 'GET':
            // Get all categories
            $categoryController->getAllCategories();
            break;

        case 'POST':
            // Create new category
            $categoryController->createCategory();
            break;

        default:
            Response::error('Method not allowed', [], 405);
            break;
    }
} catch (Exception $e) {
    // Clean any output before sending error
    ob_clean();

    if (!class_exists('Logger')) {
        error_log("Categories API Error: " . $e->getMessage());
    } else {
        $logger = new Logger();
        $logger->error("Categories API Error: " . $e->getMessage());
    }

    if (!class_exists('Response')) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    } else {
        Response::error('Server error: ' . $e->getMessage(), [], 500);
    }
}

// Clean any remaining output buffer
ob_end_flush();
