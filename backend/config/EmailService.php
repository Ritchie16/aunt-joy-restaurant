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

            // Enable verbose debugging
            $this->mailer->SMTPDebug = SMTP::DEBUG_CONNECTION; // Full debug output
            $this->mailer->Debugoutput = function ($str, $level) {
                $this->logger->debug("SMTP [{$level}]: {$str}");
            };

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
            $this->logger->info("Email service configured successfully with Gmail");
        } catch (Exception $e) {
            $this->logger->error("Email setup failed: " . $e->getMessage());
            $this->isConfigured = false;
        }
    }

    public function sendCredentials($toEmail, $toName, $password, $role)
    {
        try {
            if (!$this->isConfigured) {
                $this->logger->info("Email service not configured. Would send credentials to: {$toEmail} with password: {$password}");
                return true;
            }

            $this->logger->debug("Attempting to send email to: {$toEmail}");

            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);
            $this->mailer->Subject = 'Your Aunt Joy Restaurant Account Credentials';
            $this->mailer->Body = $this->getCredentialsTemplate($toName, $toEmail, $password, $role);
            $this->mailer->AltBody = strip_tags($this->mailer->Body);

            // Test connection first
            if (!$this->mailer->smtpConnect()) {
                $this->logger->error("SMTP connection failed for: {$toEmail}");
                return false;
            }

            $this->mailer->smtpClose();

            // Now send the email
            if ($this->mailer->send()) {
                $this->logger->info("✅ Email sent successfully to: {$toEmail}");
                return true;
            } else {
                $this->logger->error("❌ Email sending failed for: {$toEmail}");
                return false;
            }
        } catch (Exception $e) {
            $this->logger->error("Exception sending email to {$toEmail}: " . $e->getMessage());
            return false;
        }
    }

    private function getCredentialsTemplate($name, $email, $password, $role)
    {
        $appUrl = Environment::get('APP_URL') ?: 'http://localhost:5173';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                .credentials { background: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; border-radius: 5px; }
                .warning { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🍽️ Aunt Joy Restaurant</h1>
                    <h2>Your Account Credentials</h2>
                </div>
                <div class='content'>
                    <p>Hello <strong>{$name}</strong>,</p>
                    <p>Your {$role} account has been created successfully at Aunt Joy Restaurant.</p>

                    <div class='credentials'>
                        <p><strong>📧 Email:</strong> {$email}</p>
                        <p><strong>🔑 Password:</strong> {$password}</p>
                        <p><strong>👤 Role:</strong> " . ucfirst($role) . "</p>
                    </div>

                    <div class='warning'>
                        <p><strong>⚠️ Important:</strong> For security reasons, please change your password immediately after logging in.</p>
                    </div>

                    <p><strong>🔗 Login URL:</strong> <a href='{$appUrl}/login'>{$appUrl}/login</a></p>

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
