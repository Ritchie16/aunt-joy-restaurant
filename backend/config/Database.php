<?php

/**
 * Database Configuration and Connection Class
 * Handles MySQL database connections using PDO
 */
require_once __DIR__ . '/../utils/Logger.php'; // FIXED: Use __DIR__

class Database
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    private $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    public function __construct()
    {
        require_once __DIR__ . '/../config/Environment.php'; // FIXED: Use __DIR__
        Environment::load();

        $this->host = Environment::get('DB_HOST') ?: 'localhost';
        $this->db_name = Environment::get('DB_NAME') ?: 'aunt_joy_restaurant';
        $this->username = Environment::get('DB_USER') ?: 'root';
        $this->password = Environment::get('DB_PASS') ?: '';

        Logger::info("Database configuration loaded: {$this->db_name}@{$this->host}");
    }

    public function getConnection()
    {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password, $this->options);

            Logger::info("Database connection established successfully");
        } catch (PDOException $exception) {
            Logger::error("Database connection error: " . $exception->getMessage());
            throw new Exception("Connection error: " . $exception->getMessage());
        }

        return $this->conn;
    }

    public function closeConnection()
    {
        $this->conn = null;
        Logger::info("Database connection closed");
    }
}
