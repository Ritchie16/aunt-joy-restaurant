<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

/**
 * Email Service for sending credentials and notifications
 */
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../config/Environment.php';

class EmailService
{
    private $mailer;
    private $logger;
    private $isConfigured = false;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $this->logger = new Logger();
        $this->setup();
    }

    private function setup()
    {
        try {
            // Use Environment class directly
            $smtpHost = Environment::get('SMTP_HOST');
            $smtpUser = Environment::get('SMTP_USER');
            $smtpPass = Environment::get('SMTP_PASS');

            $this->logger->debug("Email config - Host: {$smtpHost}, User: {$smtpUser}, Pass: " . ($smtpPass ? 'SET' : 'NOT SET'));

            if (empty($smtpHost) || empty($smtpUser) || empty($smtpPass)) {
                $this->logger->warning("Email configuration incomplete. Email service will log but not send emails.");
                $this->isConfigured = false;
                return;
            }

            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->SMTPDebug = SMTP::DEBUG_OFF; // Turn off debug in production
            $this->mailer->Host = $smtpHost;
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $smtpUser;
            $this->mailer->Password = $smtpPass;
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = Environment::get('SMTP_PORT') ?: 587;

            // Gmail-specific settings
            if (strpos($smtpHost, 'gmail.com') !== false) {
                $this->mailer->SMTPOptions = array(
                    'ssl' => array(
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    )
                );
                $this->logger->debug("Gmail-specific settings applied");
            }

            // Timeout settings
            $this->mailer->Timeout = 30;
            $this->mailer->SMTPKeepAlive = true;

            // Recipients
            $this->mailer->setFrom(
                Environment::get('SMTP_FROM') ?: $smtpUser,
                Environment::get('SMTP_FROM_NAME') ?: 'Aunt Joy Restaurant'
            );
            $this->mailer->isHTML(true);

            $this->isConfigured = true;
            $this->logger->info("Email service configured successfully");
        } catch (Exception $e) {
            $this->logger->error("Email setup failed: " . $e->getMessage());
            $this->isConfigured = false;
        }
    }

    /**
     * Send credentials email (for backward compatibility)
     */
    public function sendCredentials($toEmail, $toName, $password, $role)
    {
        return $this->sendWelcomeEmail($toEmail, $toName, $password, $role);
    }

    /**
     * Send welcome email with credentials (for admin-created users)
     */
    public function sendWelcomeEmail($toEmail, $toName, $password, $role)
    {
        try {
            if (!$this->isConfigured) {
                $this->logger->info("Email service not configured. Welcome email for {$toEmail} with password: {$password}");
                return true;
            }

            $appUrl = Environment::get('APP_URL') ?: 'http://localhost:5173';
            $loginUrl = "{$appUrl}/login";

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->Subject = 'Welcome to Aunt Joy Restaurant - Your Account Details';
            $this->mailer->Body = $this->getWelcomeEmailTemplate($toName, $toEmail, $password, $role, $loginUrl);
            $this->mailer->AltBody = strip_tags($this->mailer->Body);

            if ($this->mailer->send()) {
                $this->logger->info("✅ Welcome email sent to: {$toEmail}");
                return true;
            } else {
                $this->logger->error("❌ Failed to send welcome email to: {$toEmail}");
                return false;
            }
        } catch (Exception $e) {
            $this->logger->error("Exception sending welcome email to {$toEmail}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($toEmail, $toName, $resetToken)
    {
        try {
            $appUrl = Environment::get('APP_URL') ?: 'http://localhost:5173';
            $resetLink = "{$appUrl}/reset-password?token={$resetToken}";
            
            if (!$this->isConfigured) {
                $this->logger->info("Email service not configured. Reset link for {$toEmail}: {$resetLink}");
                return true;
            }

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->Subject = 'Reset Your Password - Aunt Joy Restaurant';
            $this->mailer->Body = $this->getPasswordResetTemplate($toName, $resetLink);
            $this->mailer->AltBody = strip_tags($this->mailer->Body);

            if ($this->mailer->send()) {
                $this->logger->info("✅ Password reset email sent to: {$toEmail}");
                return true;
            } else {
                $this->logger->error("❌ Failed to send password reset email to: {$toEmail}");
                return false;
            }
        } catch (Exception $e) {
            $this->logger->error("Exception sending password reset email to {$toEmail}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Password reset email template
     */
    private function getPasswordResetTemplate($name, $resetLink)
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0f766e; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #0f766e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🍽️ Aunt Joy Restaurant</h1>
                    <h2>Password Reset Request</h2>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$name}</strong>,</p>
                    <p>We received a request to reset your password for your Aunt Joy Restaurant account.</p>
                    
                    <div style='text-align: center;'>
                        <a href='{$resetLink}' class='button'>Reset Password</a>
                    </div>
                    
                    <div class='warning'>
                        <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
                    </div>
                    
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                    
                    <div class='footer'>
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; " . date('Y') . " Aunt Joy Restaurant. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Welcome email template for new users
     */
    private function getWelcomeEmailTemplate($name, $email, $password, $role, $loginUrl)
    {
        $roleDisplay = ucfirst($role);
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0f766e; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .credentials { background: #fff; padding: 20px; border-left: 4px solid #0f766e; margin: 20px 0; border-radius: 5px; }
                .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: #0f766e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🍽️ Welcome to Aunt Joy Restaurant!</h1>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$name}</strong>,</p>
                    <p>Your account has been created successfully as a <strong>{$roleDisplay}</strong>.</p>
                    
                    <div class='credentials'>
                        <h3 style='margin-top: 0; color: #0f766e;'>Your Login Credentials:</h3>
                        <p><strong>📧 Email:</strong> {$email}</p>
                        <p><strong>🔑 Password:</strong> <span style='font-family: monospace; background: #f0f0f0; padding: 3px 6px; border-radius: 3px;'>{$password}</span></p>
                        <p><strong>👤 Role:</strong> {$roleDisplay}</p>
                    </div>
                    
                    <div style='text-align: center;'>
                        <a href='{$loginUrl}' class='button'>Login to Your Account</a>
                    </div>
                    
                    <div class='warning'>
                        <p><strong>⚠️ Important Security Tips:</strong></p>
                        <ul style='margin: 5px 0; padding-left: 20px;'>
                            <li>Change your password immediately after first login</li>
                            <li>Never share your password with anyone</li>
                            <li>Use a strong, unique password</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br>The Aunt Joy Restaurant Team</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Test email configuration
     */
    public function testEmail($toEmail = null)
    {
        try {
            if (!$this->isConfigured) {
                return ['success' => false, 'message' => 'Email service not configured'];
            }

            $testEmail = $toEmail ?: Environment::get('SMTP_USER');
            $this->logger->debug("Testing email to: {$testEmail}");

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($testEmail);
            $this->mailer->Subject = 'Test Email from Aunt Joy Restaurant';
            $this->mailer->Body = '<h1>Test Email</h1><p>This is a test email from Aunt Joy Restaurant system.</p><p>Time: ' . date('Y-m-d H:i:s') . '</p>';
            $this->mailer->AltBody = 'This is a test email from Aunt Joy Restaurant system. Time: ' . date('Y-m-d H:i:s');

            if ($this->mailer->send()) {
                $this->logger->info("✅ Test email sent successfully to: {$testEmail}");
                return ['success' => true, 'message' => 'Test email sent successfully'];
            } else {
                $this->logger->error("❌ Test email failed to send");
                return ['success' => false, 'message' => 'Failed to send test email'];
            }
        } catch (Exception $e) {
            $error = "Test email failed: " . $e->getMessage();
            $this->logger->error($error);
            return ['success' => false, 'message' => $error];
        }
    }
}