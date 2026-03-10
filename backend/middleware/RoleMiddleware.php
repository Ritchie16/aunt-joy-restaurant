<?php
/**
 * Role-Based Access Control Middleware
 * Handles authorization based on user roles
 */
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

class RoleMiddleware {
    private $logger;

    public function __construct() {
        $this->logger = new Logger();
    }

    /**
     * Check if user has required role
     */
    public function checkRole($userRole, $requiredRole) {
        $this->logger->debug("RoleMiddleware: Checking {$userRole} against {$requiredRole}");

        // Define role hierarchy
        $roleHierarchy = [
            'customer' => ['customer'],
            'sales' => ['sales', 'customer'],
            'manager' => ['manager', 'sales', 'customer'],
            'admin' => ['admin', 'manager', 'sales', 'customer']
        ];

        if (!isset($roleHierarchy[$requiredRole])) {
            $this->logger->error("RoleMiddleware: Invalid required role - {$requiredRole}");
            return false;
        }

        $hasAccess = in_array($userRole, $roleHierarchy[$requiredRole]);

        if (!$hasAccess) {
            $this->logger->warning("RoleMiddleware: Access denied - {$userRole} cannot access {$requiredRole} resources");
        } else {
            $this->logger->debug("RoleMiddleware: Access granted - {$userRole} can access {$requiredRole} resources");
        }

        return $hasAccess;
    }

    /**
     * Middleware for admin-only access
     */
    public function adminOnly($userRole) {
        return $this->checkRole($userRole, 'admin');
    }

    /**
     * Middleware for staff-only access (admin, manager, sales)
     */
    public function staffOnly($userRole) {
        return $this->checkRole($userRole, 'sales'); // sales is the lowest staff role
    }

    /**
     * Middleware for manager and admin access
     */
    public function managerAndAbove($userRole) {
        return $this->checkRole($userRole, 'manager');
    }

    /**
     * Middleware for sales personnel and above
     */
    public function salesAndAbove($userRole) {
        return $this->checkRole($userRole, 'sales');
    }

    /**
     * Validate user can access their own data or has higher privileges
     */
    public function canAccessUserData($currentUser, $targetUserId) {
        $this->logger->debug("RoleMiddleware: Checking access to user data - User {$currentUser['user_id']} accessing {$targetUserId}");

        // Users can always access their own data
        if ($currentUser['user_id'] == $targetUserId) {
            $this->logger->debug("RoleMiddleware: User accessing own data - allowed");
            return true;
        }

        // Admin can access any user data
        if ($currentUser['role'] === 'admin') {
            $this->logger->debug("RoleMiddleware: Admin accessing user data - allowed");
            return true;
        }

        // Managers can access customer and sales data
        if ($currentUser['role'] === 'manager') {
            // In a real app, we'd check the target user's role from database
            $this->logger->debug("RoleMiddleware: Manager accessing user data - checking permissions");
            // For now, allow access (in production, verify target user role)
            return true;
        }

        $this->logger->warning("RoleMiddleware: Access denied to user data");
        return false;
    }

    /**
     * Validate user can access order data
     */
    public function canAccessOrder($currentUser, $orderCustomerId) {
        $this->logger->debug("RoleMiddleware: Checking order access - User {$currentUser['user_id']}, Order Customer: {$orderCustomerId}");

        // Users can access their own orders
        if ($currentUser['user_id'] == $orderCustomerId) {
            $this->logger->debug("RoleMiddleware: User accessing own order - allowed");
            return true;
        }

        // Staff can access all orders
        if (in_array($currentUser['role'], ['admin', 'manager', 'sales'])) {
            $this->logger->debug("RoleMiddleware: Staff accessing order - allowed");
            return true;
        }

        $this->logger->warning("RoleMiddleware: Order access denied");
        return false;
    }
}
?>