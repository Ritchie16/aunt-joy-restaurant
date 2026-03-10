<?php

/**
 * Forgot Password API Endpoints
 */

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment - FIXED PATHS (removed one level of ../)
require_once __DIR__ . '/../config/Environment.php';
require_once __DIR__ . '/../controllers/ForgotPasswordController.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

$forgotPasswordController = new ForgotPasswordController();
$logger = new Logger();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    $logger->info("Forgot Password API Request: {$method} {$path}");

    // Extract endpoint from path
    $basePath = '/api/forgot-password';
    
    // Get the part after /api/forgot-password
    $endpoint = substr($path, strlen($basePath));
    
    // Remove leading slash if present
    if (strpos($endpoint, '/') === 0) {
        $endpoint = substr($endpoint, 1);
    }
    
    $logger->debug("Processing forgot-password endpoint: '{$endpoint}'");

    // Handle case when no specific endpoint is provided (just /api/forgot-password)
    if ($endpoint === '' || $endpoint === false) {
        if ($method === 'POST') {
            $forgotPasswordController->requestReset();
        } else {
            Response::error('Method not allowed. Use POST to request password reset.', [], 405);
        }
        return;
    }

    switch ($endpoint) {
        case 'request':
            if ($method === 'POST') {
                $forgotPasswordController->requestReset();
            } else {
                Response::error('Method not allowed. Use POST for password reset requests.', [], 405);
            }
            break;

        case 'reset':
            if ($method === 'POST') {
                $forgotPasswordController->resetPassword();
            } else {
                Response::error('Method not allowed. Use POST to reset password.', [], 405);
            }
            break;

        case 'verify':
            if ($method === 'GET') {
                $forgotPasswordController->verifyToken();
            } else {
                Response::error('Method not allowed. Use GET to verify token.', [], 405);
            }
            break;

        default:
            Response::error('Endpoint not found: ' . $endpoint, [], 404);
            break;
    }
} catch (Exception $e) {
    $logger->error("Forgot Password API Error: " . $e->getMessage());
    $logger->error("Stack trace: " . $e->getTraceAsString());
    Response::error('Server error: ' . $e->getMessage(), [], 500);
}