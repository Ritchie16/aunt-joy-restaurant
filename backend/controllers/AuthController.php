<?php

/**
 * Authentication Controller
 * Handles user login, registration, and token management
 */
/**
 * Authentication Controller
 * Handles user login, registration, and token management
 */
require_once __DIR__ . '/../middleware/Validation.php'; // FIXED: Use __DIR__
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/User.php'; // FIXED: Use __DIR__

class AuthController
{
    private $userModel;
    private $validation;
    private $logger;

    public function __construct()
    {
        $this->userModel = new User();
        $this->validation = new Validation();
        $this->logger = new Logger();
    }

    /**
     * User login endpoint
     */
    public function login()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Login attempt: " . ($data['email'] ?? 'Unknown'));

            // Validate input
            $errors = $this->validation->validateLogin($data);
            if (!empty($errors)) {
                Response::error('Validation failed', $errors, 400);
                return;
            }

            $email = $data['email'];
            $password = $data['password'];

            // Find user by email
            $user = $this->userModel->findByEmail($email);
            if (!$user) {
                $this->logger->warning("Login failed: User not found - $email");
                Response::error('Invalid credentials', [], 401);
                return;
            }

            // Check if user is active
            if (!$user['is_active']) {
                $this->logger->warning("Login failed: Inactive account - $email");
                Response::error('Account is deactivated', [], 401);
                return;
            }

            // Verify password
            if (!password_verify($password, $user['password'])) {
                $this->logger->warning("Login failed: Invalid password - $email");
                Response::error('Invalid credentials', [], 401);
                return;
            }

            // Generate JWT token
            $token = $this->generateJWT($user);

            $this->logger->info("Login successful: {$user['email']} ({$user['role']})");

            // Return user data without password
            unset($user['password']);
            Response::success('Login successful', [
                'user' => $user,
                'token' => $token
            ]);
        } catch (Exception $e) {
            $this->logger->error("Login error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Customer registration endpoint
     */
    public function register()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Registration attempt: " . ($data['email'] ?? 'Unknown'));

            // Validate input
            $errors = $this->validation->validateRegistration($data);
            if (!empty($errors)) {
                Response::error('Validation failed', $errors, 400);
                return;
            }

            // Check if email already exists
            if ($this->userModel->findByEmail($data['email'])) {
                Response::error('Email already registered', [], 400);
                return;
            }

            // Create customer account
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                'role' => 'customer',
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null
            ];

            $userId = $this->userModel->create($userData);

            $this->logger->info("Customer registered successfully: {$data['email']}");

            Response::success('Registration successful', ['user_id' => $userId], 201);
        } catch (Exception $e) {
            $this->logger->error("Registration error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Generate JWT token
     */
    private function generateJWT($user)
    {

        $jwtSecret = getenv('JWT_SECRET') ?: "aunt_joy_restaurant_secret_key_2025";

        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);

        $base64Header = base64_encode($header);
        $base64Payload = base64_encode($payload);

        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $jwtSecret, true);
        $base64Signature = base64_encode($signature);

        return "$base64Header.$base64Payload.$base64Signature";
    }

    /**
     * Verify JWT token
     */
    public static function verifyToken($token)
    {
        try {
            $logger = new Logger(); // Create logger instance

            if (empty($token)) {
                $logger->warning("Token verification failed: Empty token");
                return false;
            }

            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                $logger->warning("Token verification failed: Invalid token format");
                return false;
            }

            list($base64Header, $base64Payload, $base64Signature) = $parts;

            // Get JWT secret from environment
            $jwtSecret = getenv('JWT_SECRET') ?: 'aunt_joy_restaurant_secret_key_2025';

            $signature = base64_decode($base64Signature);
            $expectedSignature = hash_hmac('sha256', "$base64Header.$base64Payload", $jwtSecret, true);

            if (!hash_equals($expectedSignature, $signature)) {
                $logger->warning("Token verification failed: Invalid signature");
                return false;
            }

            $payload = json_decode(base64_decode($base64Payload), true);

            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                $logger->warning("Token verification failed: Token expired");
                return false;
            }

            $logger->info("Token verified successfully for user: " . ($payload['email'] ?? 'Unknown'));
            return $payload;
        } catch (Exception $e) {
            $logger = new Logger();
            $logger->error("Token verification failed: " . $e->getMessage());
            return false;
        }
    }
}
