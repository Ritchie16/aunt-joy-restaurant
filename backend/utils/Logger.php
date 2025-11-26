<?php

/**
 * Logging utility for debugging and monitoring
 * Converted to a static utility so it can be called like Logger::info(...)
 */
class Logger
{
    private static $logFile;
    private static $maxFileSize = 10485760; // 10MB

    private static function init()
    {
        if (self::$logFile === null) {
            self::$logFile = __DIR__ . '/../logs/app.log';
            self::ensureLogDirectory();
        }
    }

    /**
     * Ensure log directory exists
     */
    private static function ensureLogDirectory()
    {
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    /**
     * Rotate log file if it becomes too large
     */
    private static function rotateLog()
    {
        if (file_exists(self::$logFile) && filesize(self::$logFile) > self::$maxFileSize) {
            $backupFile = self::$logFile . '.' . date('Y-m-d-His');
            rename(self::$logFile, $backupFile);
        }
    }

    /**
     * Write log message
     */
    private static function writeLog($level, $message, $context = [])
    {
        self::init();
        self::rotateLog();

        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        $logMessage = "[{$timestamp}] [{$level}] {$message}{$contextStr}" . PHP_EOL;

        file_put_contents(self::$logFile, $logMessage, FILE_APPEND | LOCK_EX);

        // Also output to console in development
        if (getenv('APP_ENV') === 'development') {
            error_log($logMessage);
        }
    }

    /**
     * Log an INFO level message
     */
    public static function info($message, $context = [])
    {
        self::writeLog('INFO', $message, $context);
    }

    /**
     * Log a WARNING level message
     */
    public static function warning($message, $context = [])
    {
        self::writeLog('WARNING', $message, $context);
    }

    /**
     * Log an ERROR level message
     */
    public static function error($message, $context = [])
    {
        self::writeLog('ERROR', $message, $context);
    }

    /**
     * Log a DEBUG level message
     */
    public static function debug($message, $context = [])
    {
        self::writeLog('DEBUG', $message, $context);
    }
}
