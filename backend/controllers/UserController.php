<?php

/**
 * User Controller - Handles all user-related operations
 */
/**
 * User Controller - Handles all user-related operations
 */
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/EmailService.php';
require_once __DIR__ . '/../utils/PasswordGenerator.php';
require_once __DIR__ . '/../middleware/Validation.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/AuthController.php';

class UserController
{
    private $userModel;
    private $emailService;
    private $validation;
    private $logger;

    public function __construct()
    {
        $this->userModel = new User();
        $this->emailService = new EmailService();
        $this->validation = new Validation();
        $this->logger = new Logger();
    }

    /**
     * Get all users (for admin)
     */
    public function getAllUsers()
    {
        try {
            $this->logger->info("Fetching all users");

            // Check authentication and admin role
            $user = $this->authenticateAdmin();
            if (!$user) return;

            $users = $this->userModel->getAll();

            if ($users === false) {
                Response::error('Failed to retrieve users');
                return;
            }

            $this->logger->info("Retrieved " . count($users) . " users");
            Response::success('Users retrieved successfully', $users);
        } catch (Exception $e) {
            $this->logger->error("Error in getAllUsers: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Create new user (admin only)
     */
    public function createUser()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Creating new user: " . ($data['email'] ?? 'Unknown'));

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            // Validate input
            $errors = $this->validation->validateUserCreation($data);
            if (!empty($errors)) {
                Response::validationError($errors);
                return;
            }

            // Check if email already exists
            if ($this->userModel->findByEmail($data['email'])) {
                Response::error('Email already registered');
                return;
            }

            // Generate random password for staff roles
            $password = '';
            if (in_array($data['role'], ['admin', 'manager', 'sales'])) {
                $password = PasswordGenerator::generate(12);
            } else {
                $password = 'default123'; // Customers will reset their password
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Prepare user data
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $hashedPassword,
                'role' => $data['role'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null
            ];

            // Create user
            $userId = $this->userModel->create($userData);
            if (!$userId) {
                Response::error('Failed to create user');
                return;
            }

            // Send credentials email for staff roles (but don't fail if email fails)
            if (in_array($data['role'], ['admin', 'manager', 'sales'])) {
                $emailSent = $this->emailService->sendCredentials(
                    $data['email'],
                    $data['name'],
                    $password,
                    $data['role']
                );

                if (!$emailSent) {
                    $this->logger->warning("Email sending failed for: " . $data['email'] . " - but user was created successfully");
                    // Continue anyway - user creation should not depend on email
                }
            }

            // Just log the credentials instead:
            if (in_array($data['role'], ['admin', 'manager', 'sales'])) {
                $this->logger->info("STAFF USER CREATED - Email: {$data['email']}, Password: {$password}, Role: {$data['role']}");
            }

            $this->logger->info("User created successfully: {$data['email']} (ID: {$userId})");
            Response::success('User created successfully', ['user_id' => $userId], 201);
        } catch (Exception $e) {
            $this->logger->error("Error in createUser: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Update user
     */
    public function updateUser($id)
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Updating user ID: {$id}");

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            // Validate input
            $errors = $this->validation->validateUserUpdate($data);
            if (!empty($errors)) {
                Response::validationError($errors);
                return;
            }

            // Update user
            $success = $this->userModel->update($id, $data);
            if (!$success) {
                Response::error('Failed to update user');
                return;
            }

            $this->logger->info("User updated successfully: ID {$id}");
            Response::success('User updated successfully');
        } catch (Exception $e) {
            $this->logger->error("Error in updateUser: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Delete user (soft delete)
     */
    public function deleteUser($id)
    {
        try {
            $this->logger->info("Deleting user ID: {$id}");

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            // Prevent self-deletion
            if ($admin['user_id'] == $id) {
                Response::error('Cannot delete your own account');
                return;
            }

            $success = $this->userModel->delete($id);
            if (!$success) {
                Response::error('Failed to delete user');
                return;
            }

            $this->logger->info("User deleted successfully: ID {$id}");
            Response::success('User deleted successfully');
        } catch (Exception $e) {
            $this->logger->error("Error in deleteUser: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }


    /**
     * activate user
     */
    public function activateUser($id){
        try {
            $this->logger->info("Activating user ID: {$id}");

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            $success = $this->userModel->activate($id);
            if (!$success) {
                Response::error('Failed to activate user');
                return;
            }

            $this->logger->info("User activated successfully: ID {$id}");
            Response::success('User activated successfully');
        } catch (Exception $e) {
            $this->logger->error("Error in activateUser: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get users by role
     */
    public function getUsersByRole($role)
    {
        try {
            $this->logger->info("Fetching users with role: {$role}");

            // Check authentication and admin role
            $user = $this->authenticateAdmin();
            if (!$user) return;

            $allowedRoles = ['admin', 'manager', 'sales', 'customer'];
            if (!in_array($role, $allowedRoles)) {
                Response::error('Invalid role specified');
                return;
            }

            $users = $this->userModel->getByRole($role);

            if ($users === false) {
                Response::error('Failed to retrieve users');
                return;
            }

            $this->logger->info("Retrieved " . count($users) . " users with role: {$role}");
            Response::success('Users retrieved successfully', $users);
        } catch (Exception $e) {
            $this->logger->error("Error in getUsersByRole: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Authenticate and check admin role
     */
    private function authenticateAdmin()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::error('Authentication required', [], 401);
            return false;
        }

        $token = $matches[1];
        $payload = AuthController::verifyToken($token);

        if (!$payload) {
            Response::error('Invalid or expired token', [], 401);
            return false;
        }

        if ($payload['role'] !== 'admin') {
            Response::error('Admin access required', [], 403);
            return false;
        }

        return $payload;
    }
}
