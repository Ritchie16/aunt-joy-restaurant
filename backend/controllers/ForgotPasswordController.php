<?php

/**
 * Forgot Password Controller
 * Handles password reset requests
 */
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/EmailService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../middleware/Validation.php';

class ForgotPasswordController
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
     * Request password reset
     */
    public function requestReset()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $email = $data['email'] ?? '';

            $this->logger->info("Password reset requested for: {$email}");

            // Validate email
            $errors = $this->validation->validateEmail($email);
            if (!empty($errors)) {
                Response::error('Validation failed', $errors, 400);
                return;
            }

            // Check if user exists
            $user = $this->userModel->findByEmail($email);
            if (!$user) {
                // Don't reveal that email doesn't exist for security
                $this->logger->info("Password reset requested for non-existent email: {$email}");
                Response::success('If your email exists in our system, you will receive a password reset link.');
                return;
            }

            // Check if user is active
            if (!$user['is_active']) {
                $this->logger->warning("Password reset requested for inactive account: {$email}");
                Response::error('Account is deactivated. Please contact support.', [], 403);
                return;
            }

            // Generate reset token
            $token = bin2hex(random_bytes(32));
            
            // Save token to database
            $saved = $this->userModel->saveResetToken($email, $token);
            
            if (!$saved) {
                $this->logger->error("Failed to save reset token for: {$email}");
                Response::error('Unable to process request. Please try again later.', [], 500);
                return;
            }

            // Send reset email
            $sent = $this->emailService->sendPasswordResetEmail($email, $user['name'], $token);
            
            if ($sent) {
                $this->logger->info("Password reset email sent to: {$email}");
                Response::success('Password reset link has been sent to your email.');
            } else {
                $this->logger->error("Failed to send password reset email to: {$email}");
                Response::error('Failed to send email. Please try again later.', [], 500);
            }

        } catch (Exception $e) {
            $this->logger->error("Password reset request error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Reset password with token
     */
    public function resetPassword()
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $token = $data['token'] ?? '';
            $newPassword = $data['password'] ?? '';

            $this->logger->info("Password reset attempt with token");

            // Validate input
            $errors = $this->validation->validatePasswordReset($data);
            if (!empty($errors)) {
                Response::error('Validation failed', $errors, 400);
                return;
            }

            // Find user by token
            $user = $this->userModel->findByResetToken($token);
            
            if (!$user) {
                $this->logger->warning("Invalid or expired reset token used");
                Response::error('Invalid or expired reset token', [], 400);
                return;
            }

            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // Update password and clear token
            $updated = $this->userModel->updatePassword($user['id'], $hashedPassword);
            
            if ($updated) {
                $this->logger->info("Password reset successful for user: {$user['email']}");
                Response::success('Password has been reset successfully. You can now login with your new password.');
            } else {
                $this->logger->error("Failed to update password for user: {$user['email']}");
                Response::error('Failed to reset password. Please try again.', [], 500);
            }

        } catch (Exception $e) {
            $this->logger->error("Password reset error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Verify reset token
     */
    public function verifyToken()
    {
        try {
            $token = $_GET['token'] ?? '';

            if (empty($token)) {
                Response::error('Token is required', [], 400);
                return;
            }

            $user = $this->userModel->findByResetToken($token);
            
            if ($user) {
                $this->logger->debug("Reset token is valid");
                Response::success('Token is valid', ['valid' => true]);
            } else {
                $this->logger->debug("Reset token is invalid or expired");
                Response::error('Invalid or expired token', [], 400);
            }

        } catch (Exception $e) {
            $this->logger->error("Token verification error: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }
}