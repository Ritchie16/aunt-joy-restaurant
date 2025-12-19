<?php

/**
 * Authentication Middleware
 * Verifies JWT tokens and authenticates users
 */
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

class AuthMiddleware
{
    private $logger;

    public function __construct()
    {
        $this->logger = new Logger();
    }

    /**
     * Authenticate user - this method is called by MealController
     */
    public function authenticate()
    {
        try {
            $this->logger->debug("AuthMiddleware: Authenticating user");

            // Call the existing verifyToken method
            $payload = $this->verifyToken();

            if (!$payload) {
                $this->logger->error("AuthMiddleware: Authentication failed - No valid token");
                return null; // Return null instead of test user
            }

            // Get full user details from database
            $userModel = new User();
            $user = $userModel->findById($payload['user_id']);

            if (!$user) {
                $this->logger->error("AuthMiddleware: User not found in database - ID: {$payload['user_id']}");
                return null;
            }

            if (!$user['is_active']) {
                $this->logger->warning("AuthMiddleware: Inactive user - {$user['email']}");
                return null;
            }

            $this->logger->info("AuthMiddleware: User authenticated - {$user['email']} ({$user['role']})");
            return $user; // Return full user data from database

        } catch (Exception $e) {
            $this->logger->error("AuthMiddleware authenticate error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify JWT token from Authorization header
     */
    public function verifyToken()
    {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';

            $this->logger->debug("AuthMiddleware: Verifying token from header");

            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $this->logger->warning("AuthMiddleware: No Authorization header found");
                return null; // No token, return null
            }

            $token = $matches[1];

            // Use AuthController to verify token
            $payload = AuthController::verifyToken($token);

            if (!$payload) {
                $this->logger->warning("AuthMiddleware: Invalid or expired token");
                return null;
            }

            return $payload; // Return token payload

        } catch (Exception $e) {
            $this->logger->error("AuthMiddleware error: " . $e->getMessage());
            return null;
        }
    }


    /**
     * Middleware to require authentication
     */
    public function requireAuth()
    {
        $payload = $this->verifyToken();
        if (!$payload) {
            Response::error('Authentication required', [], 401);
            return false;
        }
        return $payload;
    }

    /**
     * Middleware to require specific roles
     */
    public function requireRoles($allowedRoles)
    {
        $payload = $this->verifyToken();
        if (!$payload) {
            Response::error('Authentication required', [], 401);
            return false;
        }

        if (!in_array($payload['role'], $allowedRoles)) {
            $this->logger->warning("AuthMiddleware: Access denied for role {$payload['role']}");
            Response::error('Access denied', [], 403);
            return false;
        }

        $this->logger->debug("AuthMiddleware: Role access granted - {$payload['role']}");
        return $payload;
    }

    /**
     * Require admin role
     */
    public function requireAdmin()
    {
        return $this->requireRoles(['admin']);
    }

    /**
     * Require staff roles (admin, manager, sales)
     */
    public function requireStaff()
    {
        return $this->requireRoles(['admin', 'manager', 'sales']);
    }

    /**
     * Require customer role
     */
    public function requireCustomer()
    {
        return $this->requireRoles(['customer']);
    }
}
