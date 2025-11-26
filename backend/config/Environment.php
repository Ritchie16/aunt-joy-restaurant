<?php

/**
 * Environment Configuration
 * Loads and manages environment variables
 */
class Environment
{
    private static $loaded = false;
    private static $variables = [];

    /**
     * Load environment variables from .env file
     */
    public static function load($path = null)
    {
        if (self::$loaded) {
            return;
        }

        $envFile = $path ?: __DIR__ . '/../.env';

        if (!file_exists($envFile)) {
            throw new Exception("Environment file not found: {$envFile}");
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse name=value pairs
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);

                // Remove quotes if present
                if (preg_match('/^"(.+)"$/', $value, $matches)) {
                    $value = $matches[1];
                } elseif (preg_match('/^' . "'(.+)" . '$/', $value, $matches)) {
                    $value = $matches[1];
                }

                self::$variables[$name] = $value;

                // Also set in $_ENV and $_SERVER for compatibility
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }

        self::$loaded = true;
    }

    /**
     * Get environment variable
     */
    public static function get($key, $default = null)
    {
        if (!self::$loaded) {
            self::load();
        }

        // Check in order: .env variables, $_ENV, $_SERVER, getenv()
        if (isset(self::$variables[$key])) {
            return self::$variables[$key];
        } elseif (isset($_ENV[$key])) {
            return $_ENV[$key];
        } elseif (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        } else {
            $value = getenv($key);
            return $value !== false ? $value : $default;
        }
    }

    /**
     * Set environment variable (for testing)
     */
    public static function set($key, $value)
    {
        self::$variables[$key] = $value;
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv("{$key}={$value}");
    }

    /**
     * Check if environment is development
     */
    public static function isDevelopment()
    {
        return self::get('APP_ENV', 'production') === 'development';
    }

    /**
     * Check if environment is production
     */
    public static function isProduction()
    {
        return self::get('APP_ENV', 'production') === 'production';
    }

    /**
     * Get database configuration
     */
    public static function getDatabaseConfig()
    {
        return [
            'host' => self::get('DB_HOST', 'localhost'),
            'name' => self::get('DB_NAME', 'aunt_joy_restaurant'),
            'user' => self::get('DB_USER', 'root'),
            'pass' => self::get('DB_PASS', ''),
            'charset' => 'utf8mb4'
        ];
    }

    /**
     * Get email configuration
     */
    public static function getEmailConfig()
    {
        return [
            'host' => self::get('SMTP_HOST', 'smtp.gmail.com'),
            'port' => self::get('SMTP_PORT', 587),
            'user' => self::get('SMTP_USER'),
            'pass' => self::get('SMTP_PASS'),
            'from' => self::get('SMTP_FROM'),
            'from_name' => self::get('SMTP_FROM_NAME', 'Aunt Joy Restaurant')
        ];
    }

    /**
     * Get JWT secret
     */
    public static function getJWTSecret()
    {
        return self::get('JWT_SECRET', 'default_secret_key_change_in_production');
    }

    /**
     * Get application URL
     */
    public static function getAppUrl()
    {
        return self::get('APP_URL', 'http://localhost:5173');
    }

    /**
     * Get API URL
     */
    public static function getApiUrl()
    {
        return self::get('API_URL', 'http://localhost:8000');
    }

    /**
     * Get upload path
     */
    public static function getUploadPath()
    {
        return self::get('UPLOAD_PATH', './uploads/');
    }

    /**
     * Get all environment variables
     */
    public static function getAll()
    {
        if (!self::$loaded) {
            self::load();
        }
        return self::$variables;
    }
}

// Auto-load environment variables when this file is included
Environment::load();
