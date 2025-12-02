<?php

/**
 * Category Model - Handles category database operations
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/Logger.php';

class Category
{
    private $conn;
    private $table = 'categories';
    private $logger;

    public function __construct()
    {
        try {
            $database = new Database();
            $this->conn = $database->getConnection();
            $this->logger = new Logger();
            $this->logger->debug("Category model initialized");
        } catch (Exception $e) {
            $this->logger = new Logger();
            $this->logger->error("Failed to initialize Category model: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all categories
     */
    public function getAll()
    {
        try {
            $this->logger->info("Getting all categories");

            $query = "SELECT * FROM {$this->table} ORDER BY name";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Retrieved " . count($categories) . " categories");

            return $categories;
        } catch (PDOException $e) {
            $this->logger->error("Error retrieving categories: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get category by ID
     */
    public function findById($id)
    {
        try {
            $this->logger->info("Finding category by ID: {$id}");

            $query = "SELECT * FROM {$this->table} WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $category = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($category) {
                $this->logger->info("Category found: {$category['name']}");
            } else {
                $this->logger->info("Category not found with ID: {$id}");
            }

            return $category;
        } catch (PDOException $e) {
            $this->logger->error("Error finding category: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new category
     */
    public function create($data)
    {
        try {
            $this->logger->info("Creating new category: " . ($data['name'] ?? 'Unknown'));

            $query = "INSERT INTO {$this->table} (name, description) VALUES (:name, :description)";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description'] ?? '');

            $stmt->execute();

            $categoryId = $this->conn->lastInsertId();

            $this->logger->info("Category created successfully with ID: {$categoryId}");

            return $categoryId;
        } catch (PDOException $e) {
            $this->logger->error("Error creating category: " . $e->getMessage());
            return false;
        }
    }
}
