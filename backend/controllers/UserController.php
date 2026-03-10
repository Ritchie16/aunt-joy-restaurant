<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../middleware/Validation.php';
require_once __DIR__ . '/../config/EmailService.php';

class UserController
{
    private $userModel;
    private $authMiddleware;
    private $roleMiddleware;
    private $validation;
    private $logger;
    private $emailService;

    public function __construct()
    {
        $this->userModel = new User();
        $this->authMiddleware = new AuthMiddleware();
        $this->roleMiddleware = new RoleMiddleware();
        $this->validation = new Validation();
        $this->logger = new Logger();
        $this->emailService = new EmailService();
    }

    /**
     * Get all users (admin only)
     */
    public function getAllUsers()
    {
        // Verify authentication and admin role
        $user = $this->authMiddleware->authenticate();
        if (!$user) {
            Response::error('Unauthorized', [], 401);
            return;
        }

        if (!$this->roleMiddleware->adminOnly($user['role'])) {
            Response::error('Access denied', [], 403);
            return;
        }

        try {
            $users = $this->userModel->getAll();
            
            if ($users === false) {
                Response::error('Failed to fetch users', [], 500);
                return;
            }

            Response::success('Users retrieved successfully', $users);
        } catch (Exception $e) {
            $this->logger->error("Get all users error: " . $e->getMessage());
            Response::error('Server error', [], 500);
        }
    }

    /**
     * Create new user (admin only)
     */
    public function createUser()
    {
        // Verify authentication and admin role
        $adminUser = $this->authMiddleware->authenticate();
        if (!$adminUser) {
            Response::error('Unauthorized', [], 401);
            return;
        }

        if (!$this->roleMiddleware->adminOnly($adminUser['role'])) {
            Response::error('Access denied', [], 403);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Admin {$adminUser['email']} creating new user");

            // Validate input
            $errors = $this->validation->validateUserCreation($data);
            if (!empty($errors)) {
                Response::error('Validation failed', $errors, 400);
                return;
            }

            // Check if email already exists
            if ($this->userModel->findByEmail($data['email'])) {
                Response::error('Email already registered', [], 400);
                return;
            }

            // Generate random password
            $password = $this->generateRandomPassword();
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
                Response::error('Failed to create user', [], 500);
                return;
            }

            // Send welcome email with credentials
            $emailSent = $this->emailService->sendWelcomeEmail(
                $data['email'],
                $data['name'],
                $password,
                $data['role']
            );

            if (!$emailSent) {
                $this->logger->warning("User created but welcome email failed to send to: {$data['email']}");
            }

            $this->logger->info("User created successfully by admin: {$data['email']} (Role: {$data['role']})");

            Response::success('User created successfully. Credentials have been sent to their email.', [
                'user_id' => $userId,
                'email_sent' => $emailSent
            ], 201);

        } catch (Exception $e) {
            $this->logger->error("Create user error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Update user (admin only)
     */
    public function updateUser($id)
    {
        // Verify authentication and admin role
        $adminUser = $this->authMiddleware->authenticate();
        if (!$adminUser) {
            Response::error('Unauthorized', [], 401);
            return;
        }

        if (!$this->roleMiddleware->adminOnly($adminUser['role'])) {
            Response::error('Access denied', [], 403);
            return;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $this->logger->info("Admin {$adminUser['email']} updating user ID: {$id}");

            // Validate input
            $errors = $this->validation->validateUserUpdate($data);
            if (!empty($errors)) {
                Response::error('Validation failed', $errors, 400);
                return;
            }

            // Check if user exists
            $existingUser = $this->userModel->findById($id);
            if (!$existingUser) {
                Response::error('User not found', [], 404);
                return;
            }

            // Check if email is being changed and if it's already taken
            if (isset($data['email']) && $data['email'] !== $existingUser['email']) {
                $userWithEmail = $this->userModel->findByEmail($data['email']);
                if ($userWithEmail && $userWithEmail['id'] != $id) {
                    Response::error('Email already in use by another user', [], 400);
                    return;
                }
            }

            // Update user
            $updated = $this->userModel->update($id, $data);

            if (!$updated) {
                Response::error('Failed to update user', [], 500);
                return;
            }

            $this->logger->info("User updated successfully by admin: ID {$id}");
            Response::success('User updated successfully');

        } catch (Exception $e) {
            $this->logger->error("Update user error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Delete user (soft delete) - admin only
     */
    public function deleteUser($id)
    {
        // Verify authentication and admin role
        $adminUser = $this->authMiddleware->authenticate();
        if (!$adminUser) {
            Response::error('Unauthorized', [], 401);
            return;
        }

        if (!$this->roleMiddleware->adminOnly($adminUser['role'])) {
            Response::error('Access denied', [], 403);
            return;
        }

        try {
            $this->logger->info("Admin {$adminUser['email']} deleting user ID: {$id}");

            // Check if user exists
            $user = $this->userModel->findById($id);
            if (!$user) {
                Response::error('User not found', [], 404);
                return;
            }

            // Prevent deleting admin users
            if ($user['role'] === 'admin') {
                Response::error('Cannot delete admin users', [], 403);
                return;
            }

            // Soft delete
            $deleted = $this->userModel->delete($id);

            if (!$deleted) {
                Response::error('Failed to delete user', [], 500);
                return;
            }

            $this->logger->info("User deleted successfully by admin: ID {$id}");
            Response::success('User deactivated successfully');

        } catch (Exception $e) {
            $this->logger->error("Delete user error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Activate user - admin only
     */
    public function activateUser($id)
    {
        // Verify authentication and admin role
        $adminUser = $this->authMiddleware->authenticate();
        if (!$adminUser) {
            Response::error('Unauthorized', [], 401);
            return;
        }

        if (!$this->roleMiddleware->adminOnly($adminUser['role'])) {
            Response::error('Access denied', [], 403);
            return;
        }

        try {
            $this->logger->info("Admin {$adminUser['email']} activating user ID: {$id}");

            // Check if user exists
            $user = $this->userModel->findById($id);
            if (!$user) {
                Response::error('User not found', [], 404);
                return;
            }

            // Activate user
            $activated = $this->userModel->activate($id);

            if (!$activated) {
                Response::error('Failed to activate user', [], 500);
                return;
            }

            $this->logger->info("User activated successfully by admin: ID {$id}");
            Response::success('User activated successfully');

        } catch (Exception $e) {
            $this->logger->error("Activate user error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get users by role (admin only)
     */
    public function getUsersByRole($role)
    {
        // Verify authentication and admin role
        $user = $this->authMiddleware->authenticate();
        if (!$user) {
            Response::error('Unauthorized', [], 401);
            return;
        }

        if (!$this->roleMiddleware->staffOnly($user['role'])) {
            Response::error('Access denied', [], 403);
            return;
        }

        try {
            $users = $this->userModel->getByRole($role);
            
            if ($users === false) {
                Response::error('Failed to fetch users', [], 500);
                return;
            }

            Response::success('Users retrieved successfully', $users);
        } catch (Exception $e) {
            $this->logger->error("Get users by role error: " . $e->getMessage());
            Response::error('Server error', [], 500);
        }
    }

    /**
     * Generate random password
     */
    private function generateRandomPassword($length = 12)
    {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $password;
    }
}