<?php
/**
 * Category Model - Handles category database operations
 */
require_once '../config/Database.php';
require_once '../utils/Logger.php';

class Category {
    private $conn;
    private $table = 'categories';
    private $logger;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->logger = new Logger();
    }

    /**
     * Get all categories
     */
    public function getAll() {
        try {
            $query = "SELECT * FROM {$this->table} ORDER BY name";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->logger->debug("Retrieved " . count($categories) . " categories");
            
            return $categories;

        } catch (PDOException $e) {
            $this->logger->error("Error retrieving categories: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get category by ID
     */
    public function findById($id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $category = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($category) {
                $this->logger->debug("Category found by ID: {$id}");
            } else {
                $this->logger->debug("Category not found by ID: {$id}");
            }

            return $category;

        } catch (PDOException $e) {
            $this->logger->error("Error finding category by ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new category
     */
    public function create($data) {
        try {
            $query = "INSERT INTO {$this->table} (name, description) VALUES (:name, :description)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);

            $stmt->execute();
            $categoryId = $this->conn->lastInsertId();

            $this->logger->info("Category created successfully: {$data['name']} (ID: {$categoryId})");
            return $categoryId;

        } catch (PDOException $e) {
            $this->logger->error("Error creating category {$data['name']}: " . $e->getMessage());
            return false;
        }
    }
}
?>