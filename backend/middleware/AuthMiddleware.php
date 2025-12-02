<?php
/**
 * Authentication Middleware
 * Verifies JWT tokens and authenticates users
 */
require_once __DIR__ . '/../controllers/AuthController.php'; // FIXED: Use __DIR__
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

class AuthMiddleware {
    private $logger;

    public function __construct() {
        $this->logger = new Logger();
    }

    /**
     * Verify JWT token from Authorization header
     */
    public function verifyToken() {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';

            $this->logger->debug("AuthMiddleware: Verifying token from header");

            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $this->logger->warning("AuthMiddleware: No Authorization header found");
                Response::error('Authentication required', [], 401);
                return false;
            }

            $token = $matches[1];
            $payload = AuthController::verifyToken($token);

            if (!$payload) {
                $this->logger->warning("AuthMiddleware: Invalid or expired token");
                Response::error('Invalid or expired token', [], 401);
                return false;
            }

            $this->logger->info("AuthMiddleware: User authenticated - {$payload['email']} ({$payload['role']})");
            return $payload;

        } catch (Exception $e) {
            $this->logger->error("AuthMiddleware error: " . $e->getMessage());
            Response::error('Authentication error: ' . $e->getMessage(), [], 500);
            return false;
        }
    }

    /**
     * Middleware to require authentication
     */
    public function requireAuth() {
        $payload = $this->verifyToken();
        if (!$payload) {
            return false;
        }
        return $payload;
    }

    /**
     * Middleware to require specific roles
     */
    public function requireRoles($allowedRoles) {
        $payload = $this->verifyToken();
        if (!$payload) {
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
    public function requireAdmin() {
        return $this->requireRoles(['admin']);
    }

    /**
     * Require staff roles (admin, manager, sales)
     */
    public function requireStaff() {
        return $this->requireRoles(['admin', 'manager', 'sales']);
    }

    /**
     * Require customer role
     */
    public function requireCustomer() {
        return $this->requireRoles(['customer']);
    }
}
?>