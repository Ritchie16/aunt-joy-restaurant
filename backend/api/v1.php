<?php
/**
 * Simple Unified API v1 - All endpoints in one file
 */

// Start output buffering immediately
ob_start();

// Set headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

// Define base path
define('BASE_DIR', dirname(__DIR__));

// Simple response function
function json_response($success, $message = '', $data = [], $code = 200) {
    ob_clean();
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ]);
    exit();
}

// Simple database connection
function get_db_connection() {
    static $conn = null;
    
    if ($conn === null) {
        try {
            // Load environment variables directly
            $envFile = BASE_DIR . '/.env';
            if (!file_exists($envFile)) {
                throw new Exception('.env file not found');
            }
            
            $env = parse_ini_file($envFile);
            $host = $env['DB_HOST'] ?? '127.0.0.1';
            $dbname = $env['DB_NAME'] ?? 'aunt_joy_restaurant';
            $username = $env['DB_USER'] ?? 'root';
            $password = $env['DB_PASS'] ?? 'Mysql@2005!';
            
            $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
            $conn = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            json_response(false, 'Database connection failed: ' . $e->getMessage(), [], 500);
        }
    }
    
    return $conn;
}

// Handle the request
try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Simple routing
    if (strpos($path, '/api/v1/meals') === 0) {
        $conn = get_db_connection();
        
        if (isset($_GET['categories']) && $_GET['categories'] === 'true') {
            // Get categories
            $stmt = $conn->query("SELECT * FROM categories ORDER BY name");
            $categories = $stmt->fetchAll();
            
            json_response(true, 'Categories retrieved', $categories);
        } else {
            // Get meals with categories
            $query = "SELECT 
                        m.*, 
                        c.name as category_name 
                      FROM meals m
                      LEFT JOIN categories c ON m.category_id = c.id
                      ORDER BY m.name";
            
            $stmt = $conn->query($query);
            $meals = $stmt->fetchAll();
            
            json_response(true, 'Meals retrieved', $meals);
        }
        
    } elseif (strpos($path, '/api/v1/users') === 0 && $method === 'GET') {
        // Get users
        $conn = get_db_connection();
        $stmt = $conn->query("SELECT * FROM users ORDER BY name");
        $users = $stmt->fetchAll();
        
        json_response(true, 'Users retrieved', $users);
        
    } else {
        json_response(false, 'Endpoint not found: ' . $path, [], 404);
    }
    
} catch (Exception $e) {
    json_response(false, 'Server error: ' . $e->getMessage(), [], 500);
}