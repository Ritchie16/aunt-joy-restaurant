<?php

/**
 * Users API Endpoints
 */

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Changed to 5173
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

$userController = new UserController();
$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];

    $logger->info("Users API Request: {$method} {$path}");

    // Extract endpoint
    $endpoint = str_replace('/api/', '', $path);

    switch ($method) {
        case 'GET':
            if ($endpoint === 'users') {
                $userController->getAllUsers();
            } elseif (preg_match('/^users\/role\/([a-z]+)$/', $endpoint, $matches)) {
                $userController->getUsersByRole($matches[1]);
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'POST':
            if ($endpoint === 'users') {
                $userController->createUser();
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'PUT':
            if (preg_match('/^users\/(\d+)$/', $endpoint, $matches)) {
                $userController->updateUser($matches[1]);
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        case 'DELETE':
            if (preg_match('/^users\/(\d+)$/', $endpoint, $matches)) {
                $userController->deleteUser($matches[1]);
            } else {
                Response::error('Endpoint not found', [], 404);
            }
            break;

        default:
            Response::error('Method not allowed', [], 405);
            break;
    }
} catch (Exception $e) {
    $logger->error("Users API Error: " . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
