<?php

/**
 * Authentication API Endpoints
 */

// Set CORS headers first
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Changed to 5173
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment FIRST
require_once __DIR__ . '/../config/Environment.php';

// Fix paths - use absolute paths from project root
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

$authController = new AuthController();
$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    $logger->info("Auth API Request: {$method} {$path}");

    // Extract endpoint from path
    $endpoint = ltrim(substr($path, strlen('/api/auth/')), '/');

    switch ($endpoint) {
        case 'login':
            if ($method === 'POST') {
                $authController->login();
            } else {
                Response::error('Method not allowed', [], 405);
            }
            break;

        case 'register':
            if ($method === 'POST') {
                $authController->register();
            } else {
                Response::error('Method not allowed', [], 405);
            }
            break;

        case 'verify':
            if ($method === 'GET') {
                // Verify token from Authorization header
                $headers = getallheaders();
                $authHeader = $headers['Authorization'] ?? '';

                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                    $payload = AuthController::verifyToken($token);

                    if ($payload) {
                        Response::success('Token is valid', ['user' => $payload]);
                    } else {
                        Response::error('Invalid or expired token', [], 401);
                    }
                } else {
                    Response::error('Authorization header missing', [], 401);
                }
            } else {
                Response::error('Method not allowed', [], 405);
            }
            break;

        default:
            Response::error('Auth endpoint not found: ' . $endpoint, [], 404);
            break;
    }
} catch (Exception $e) {
    $logger->error("Auth API Error: " . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}
