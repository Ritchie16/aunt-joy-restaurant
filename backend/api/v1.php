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

// Get request data
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$query = $_SERVER['QUERY_STRING'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Helper function for validation
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    return preg_match('/^[0-9\-\+\s\(\)]{10,20}$/', $phone);
}

// Authentication helper (simplified)
function verify_auth() {
    // For now, we'll use a simple session check
    session_start();
    if (!isset($_SESSION['user_id'])) {
        json_response(false, 'Unauthorized access', [], 401);
    }
    return $_SESSION['user_id'];
}

// Handle the request
try {
    $conn = get_db_connection();
    
    // Meals endpoints
    if (strpos($path, '/api/v1/meals') === 0) {
        if (isset($_GET['categories']) && $_GET['categories'] === 'true') {
            // Get categories
            $stmt = $conn->query("SELECT * FROM categories ORDER BY name");
            $categories = $stmt->fetchAll();
            
            json_response(true, 'Categories retrieved', $categories);
            
        } elseif (strpos($path, '/api/v1/meals/featured') === 0) {
            // Get featured meals (for landing page)
            $stmt = $conn->prepare("
                SELECT m.*, c.name as category_name 
                FROM meals m
                LEFT JOIN categories c ON m.category_id = c.id
                WHERE m.featured = TRUE AND m.is_available = TRUE
                ORDER BY m.created_at DESC
                LIMIT 6
            ");
            $stmt->execute();
            $meals = $stmt->fetchAll();
            
            json_response(true, 'Featured meals retrieved', $meals);
            
        } else {
            // Get all meals with optional filtering
            $category_id = $_GET['category_id'] ?? null;
            $featured = $_GET['featured'] ?? null;
            
            $query = "SELECT m.*, c.name as category_name FROM meals m LEFT JOIN categories c ON m.category_id = c.id WHERE 1=1";
            $params = [];
            
            if ($category_id) {
                $query .= " AND m.category_id = ?";
                $params[] = $category_id;
            }
            
            if ($featured !== null) {
                $query .= " AND m.featured = ?";
                $params[] = $featured;
            }
            
            $query .= " ORDER BY m.name";
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $meals = $stmt->fetchAll();
            
            json_response(true, 'Meals retrieved', $meals);
        }
        
    } elseif (strpos($path, '/api/v1/users') === 0) {
        if ($method === 'GET') {
            // Get users (admin only)
            $stmt = $conn->query("SELECT id, name, email, role, phone, address, is_active, created_at FROM users ORDER BY name");
            $users = $stmt->fetchAll();
            
            json_response(true, 'Users retrieved', $users);
            
        } elseif ($method === 'POST') {
            // Create new user (registration)
            if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
                json_response(false, 'Name, email, and password are required', [], 400);
            }
            
            if (!validate_email($input['email'])) {
                json_response(false, 'Invalid email format', [], 400);
            }
            
            // Check if user already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            if ($stmt->fetch()) {
                json_response(false, 'Email already registered', [], 400);
            }
            
            // Create user
            $hashed_password = password_hash($input['password'], PASSWORD_DEFAULT);
            $role = $input['role'] ?? 'customer';
            
            $stmt = $conn->prepare("
                INSERT INTO users (name, email, password, role, phone, address)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $input['name'],
                $input['email'],
                $hashed_password,
                $role,
                $input['phone'] ?? '',
                $input['address'] ?? ''
            ]);
            
            $user_id = $conn->lastInsertId();
            
            json_response(true, 'User created successfully', [
                'id' => $user_id,
                'name' => $input['name'],
                'email' => $input['email'],
                'role' => $role
            ], 201);
        }
        
    } elseif (strpos($path, '/api/v1/auth/login') === 0 && $method === 'POST') {
        // Login endpoint
        if (empty($input['email']) || empty($input['password'])) {
            json_response(false, 'Email and password are required', [], 400);
        }
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($input['password'], $user['password'])) {
            json_response(false, 'Invalid email or password', [], 401);
        }
        
        if (!$user['is_active']) {
            json_response(false, 'Account is deactivated', [], 401);
        }
        
        // Start session
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        
        json_response(true, 'Login successful', [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'phone' => $user['phone'],
            'address' => $user['address']
        ]);
        
    } elseif (strpos($path, '/api/v1/auth/logout') === 0 && $method === 'POST') {
        // Logout endpoint
        session_start();
        session_destroy();
        
        json_response(true, 'Logout successful');
        
    } elseif (strpos($path, '/api/v1/reservations') === 0) {
        if ($method === 'POST') {
            // Create reservation
            $required_fields = ['name', 'email', 'phone', 'date', 'time', 'guests'];
            
            foreach ($required_fields as $field) {
                if (empty($input[$field])) {
                    json_response(false, "Field $field is required", [], 400);
                }
            }
            
            if (!validate_email($input['email'])) {
                json_response(false, 'Invalid email format', [], 400);
            }
            
            if (!validate_phone($input['phone'])) {
                json_response(false, 'Invalid phone number', [], 400);
            }
            
            // Validate date is not in the past
            $reservation_date = strtotime($input['date']);
            $today = strtotime('today');
            if ($reservation_date < $today) {
                json_response(false, 'Reservation date cannot be in the past', [], 400);
            }
            
            // Validate guests count
            $guests = intval($input['guests']);
            if ($guests < 1 || $guests > 20) {
                json_response(false, 'Number of guests must be between 1 and 20', [], 400);
            }
            
            // Check for existing reservation at same time (optional)
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count 
                FROM reservations 
                WHERE date = ? AND time = ? AND status IN ('pending', 'confirmed')
            ");
            $stmt->execute([$input['date'], $input['time']]);
            $result = $stmt->fetch();
            
            if ($result['count'] >= 5) { // Limit to 5 reservations per time slot
                json_response(false, 'This time slot is fully booked. Please choose another time.', [], 400);
            }
            
            // Create reservation
            $stmt = $conn->prepare("
                INSERT INTO reservations (name, email, phone, date, time, guests, notes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            ");
            
            $stmt->execute([
                htmlspecialchars($input['name']),
                htmlspecialchars($input['email']),
                htmlspecialchars($input['phone']),
                $input['date'],
                $input['time'],
                $guests,
                htmlspecialchars($input['notes'] ?? '')
            ]);
            
            $reservation_id = $conn->lastInsertId();
            
            // Generate confirmation number
            $confirmation_number = 'RSV' . str_pad($reservation_id, 6, '0', STR_PAD_LEFT);
            
            $stmt = $conn->prepare("UPDATE reservations SET confirmation_number = ? WHERE id = ?");
            $stmt->execute([$confirmation_number, $reservation_id]);
            
            // Get the created reservation
            $stmt = $conn->prepare("SELECT * FROM reservations WHERE id = ?");
            $stmt->execute([$reservation_id]);
            $reservation = $stmt->fetch();
            
            json_response(true, 'Reservation created successfully', $reservation, 201);
            
        } elseif ($method === 'GET') {
            // Get reservations (admin/manager only)
            session_start();
            if (!isset($_SESSION['user_id'])) {
                json_response(false, 'Unauthorized access', [], 401);
            }
            
            $user_id = $_SESSION['user_id'];
            
            // Check if user has permission (admin or manager)
            $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
            
            if (!in_array($user['role'], ['admin', 'manager', 'sales'])) {
                json_response(false, 'Insufficient permissions', [], 403);
            }
            
            $status = $_GET['status'] ?? null;
            $date = $_GET['date'] ?? null;
            
            $query = "SELECT * FROM reservations WHERE 1=1";
            $params = [];
            
            if ($status) {
                $query .= " AND status = ?";
                $params[] = $status;
            }
            
            if ($date) {
                $query .= " AND date = ?";
                $params[] = $date;
            }
            
            $query .= " ORDER BY date DESC, time DESC";
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $reservations = $stmt->fetchAll();
            
            json_response(true, 'Reservations retrieved', $reservations);
        }
        
    } elseif (strpos($path, '/api/v1/orders') === 0) {
        if ($method === 'GET') {
            // Get orders
            session_start();
            if (!isset($_SESSION['user_id'])) {
                json_response(false, 'Unauthorized access', [], 401);
            }
            
            $user_id = $_SESSION['user_id'];
            $user_role = $_SESSION['user_role'];
            
            if ($user_role === 'customer') {
                // Customer can only see their own orders
                $stmt = $conn->prepare("
                    SELECT o.*, 
                           (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as total_items
                    FROM orders o
                    WHERE o.customer_id = ?
                    ORDER BY o.created_at DESC
                ");
                $stmt->execute([$user_id]);
            } else {
                // Admin/Manager/Sales can see all orders
                $stmt = $conn->prepare("
                    SELECT o.*, u.name as customer_name,
                           (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as total_items
                    FROM orders o
                    LEFT JOIN users u ON o.customer_id = u.id
                    ORDER BY o.created_at DESC
                ");
                $stmt->execute();
            }
            
            $orders = $stmt->fetchAll();
            
            json_response(true, 'Orders retrieved', $orders);
            
        } elseif ($method === 'POST') {
            // Create new order
            session_start();
            if (!isset($_SESSION['user_id'])) {
                json_response(false, 'Unauthorized access', [], 401);
            }
            
            $customer_id = $_SESSION['user_id'];
            
            // Validate input
            if (empty($input['items']) || !is_array($input['items'])) {
                json_response(false, 'Order items are required', [], 400);
            }
            
            if (empty($input['delivery_address'])) {
                json_response(false, 'Delivery address is required', [], 400);
            }
            
            if (empty($input['customer_phone'])) {
                json_response(false, 'Customer phone is required', [], 400);
            }
            
            // Begin transaction
            $conn->beginTransaction();
            
            try {
                // Calculate total amount
                $total_amount = 0;
                foreach ($input['items'] as $item) {
                    // Verify meal exists and is available
                    $stmt = $conn->prepare("SELECT price, is_available FROM meals WHERE id = ?");
                    $stmt->execute([$item['meal_id']]);
                    $meal = $stmt->fetch();
                    
                    if (!$meal) {
                        throw new Exception("Meal not found: {$item['meal_id']}");
                    }
                    
                    if (!$meal['is_available']) {
                        throw new Exception("Meal is not available: {$item['meal_id']}");
                    }
                    
                    $quantity = intval($item['quantity']);
                    $unit_price = floatval($meal['price']);
                    $total_amount += $quantity * $unit_price;
                }
                
                // Generate order number
                $order_number = 'ORD' . date('Ymd') . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
                
                // Create order
                $stmt = $conn->prepare("
                    INSERT INTO orders (customer_id, order_number, total_amount, delivery_address, customer_phone, special_instructions)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $customer_id,
                    $order_number,
                    $total_amount,
                    $input['delivery_address'],
                    $input['customer_phone'],
                    $input['special_instructions'] ?? ''
                ]);
                
                $order_id = $conn->lastInsertId();
                
                // Create order items
                foreach ($input['items'] as $item) {
                    $stmt = $conn->prepare("SELECT price FROM meals WHERE id = ?");
                    $stmt->execute([$item['meal_id']]);
                    $meal = $stmt->fetch();
                    
                    $stmt = $conn->prepare("
                        INSERT INTO order_items (order_id, meal_id, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?)
                    ");
                    
                    $quantity = intval($item['quantity']);
                    $unit_price = floatval($meal['price']);
                    $total_price = $quantity * $unit_price;
                    
                    $stmt->execute([
                        $order_id,
                        $item['meal_id'],
                        $quantity,
                        $unit_price,
                        $total_price
                    ]);
                }
                
                // Commit transaction
                $conn->commit();
                
                json_response(true, 'Order created successfully', [
                    'order_id' => $order_id,
                    'order_number' => $order_number,
                    'total_amount' => $total_amount
                ], 201);
                
            } catch (Exception $e) {
                $conn->rollBack();
                json_response(false, 'Order creation failed: ' . $e->getMessage(), [], 500);
            }
        }
        
    } else {
        json_response(false, 'Endpoint not found: ' . $path, [], 404);
    }
    
} catch (Exception $e) {
    json_response(false, 'Server error: ' . $e->getMessage(), [], 500);
}

