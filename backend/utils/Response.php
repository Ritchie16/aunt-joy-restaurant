<?php

/**
 * Standardized API Response Helper with output buffering
 */
class Response
{
    /**
     * Clean all output buffers
     */
    private static function cleanOutput()
    {
        // Remove all output buffers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        // Start fresh output buffering
        ob_start();
    }

    /**
     * Send success response
     */
    public static function success($message, $data = [], $code = 200)
    {
        self::cleanOutput();

        http_response_code($code);
        header('Content-Type: application/json');

        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => time()
        ]);

        ob_end_flush();
        exit;
    }

    /**
     * Send error response
     */
    public static function error($message, $errors = [], $code = 400)
    {
        self::cleanOutput();

        http_response_code($code);
        header('Content-Type: application/json');

        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => time()
        ]);

        ob_end_flush();
        exit;
    }

    /**
     * Send validation error response
     */
    public static function validationError($errors)
    {
        self::error('Validation failed', $errors, 422);
    }

    /**
     * Send raw JSON (for custom responses)
     */
    public static function json($data, $code = 200)
    {
        self::cleanOutput();

        http_response_code($code);
        header('Content-Type: application/json');

        echo json_encode($data);

        ob_end_flush();
        exit;
    }
}
