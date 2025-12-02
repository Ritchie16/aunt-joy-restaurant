<?php

/**
 * Meal Model - Handles meal database operations
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/Logger.php';

class Meal
{
    private $conn;
    private $table = 'meals';
    private $logger;

    public function __construct()
    {
        try {
            $database = new Database();
            $this->conn = $database->getConnection();
            $this->logger = new Logger();
            $this->logger->debug("Meal model initialized");
        } catch (Exception $e) {
            $this->logger = new Logger();
            $this->logger->error("Failed to initialize Meal model: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all meals with categories
     */
    public function getAllWithCategories()
    {
        try {
            $this->logger->info("Getting all meals with categories");

            $query = "
                SELECT m.*, c.name as category_name 
                FROM {$this->table} m 
                LEFT JOIN categories c ON m.category_id = c.id 
                ORDER BY m.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $meals = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Retrieved " . count($meals) . " meals");

            return $meals;
        } catch (PDOException $e) {
            $this->logger->error("Error in getAllWithCategories: " . $e->getMessage());
            $this->logger->error("Query: " . $query);
            return false;
        }
    }

    /**
     * Get available meals for customers
     */
    public function getAvailable()
    {
        try {
            $this->logger->info("Getting available meals");

            $query = "
                SELECT m.*, c.name as category_name 
                FROM {$this->table} m 
                LEFT JOIN categories c ON m.category_id = c.id 
                WHERE m.is_available = 1 
                ORDER BY m.name
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $meals = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Retrieved " . count($meals) . " available meals");

            return $meals;
        } catch (PDOException $e) {
            $this->logger->error("Error in getAvailable: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get meal by ID
     */
    public function findById($id)
    {
        try {
            $this->logger->info("Finding meal by ID: {$id}");

            $query = "
                SELECT m.*, c.name as category_name 
                FROM {$this->table} m 
                LEFT JOIN categories c ON m.category_id = c.id 
                WHERE m.id = :id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $meal = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($meal) {
                $this->logger->info("Meal found: {$meal['name']}");
            } else {
                $this->logger->info("Meal not found with ID: {$id}");
            }

            return $meal;
        } catch (PDOException $e) {
            $this->logger->error("Error in findById: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new meal
     */
    public function create($data)
    {
        try {
            $this->logger->info("Creating new meal: " . ($data['name'] ?? 'Unknown'));

            $query = "
                INSERT INTO {$this->table} 
                (name, description, price, image_path, category_id, is_available) 
                VALUES (:name, :description, :price, :image_path, :category_id, :is_available)
            ";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description'] ?? '');
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':image_path', $data['image_path'] ?? '');
            $stmt->bindParam(':category_id', $data['category_id']);
            $stmt->bindParam(':is_available', $data['is_available'] ?? 1, PDO::PARAM_INT);

            $stmt->execute();

            $mealId = $this->conn->lastInsertId();

            $this->logger->info("Meal created successfully with ID: {$mealId}");

            return $mealId;
        } catch (PDOException $e) {
            $this->logger->error("Error creating meal: " . $e->getMessage());
            $this->logger->error("Data: " . json_encode($data));
            return false;
        }
    }

    /**
     * Update meal
     */
    public function update($id, $data)
    {
        try {
            $this->logger->info("Updating meal ID: {$id}");

            // Build dynamic update query
            $fields = [];
            $params = [':id' => $id];

            if (isset($data['name'])) {
                $fields[] = "name = :name";
                $params[':name'] = $data['name'];
            }
            if (isset($data['description'])) {
                $fields[] = "description = :description";
                $params[':description'] = $data['description'];
            }
            if (isset($data['price'])) {
                $fields[] = "price = :price";
                $params[':price'] = $data['price'];
            }
            if (isset($data['image_path'])) {
                $fields[] = "image_path = :image_path";
                $params[':image_path'] = $data['image_path'];
            }
            if (isset($data['category_id'])) {
                $fields[] = "category_id = :category_id";
                $params[':category_id'] = $data['category_id'];
            }
            if (isset($data['is_available'])) {
                $fields[] = "is_available = :is_available";
                $params[':is_available'] = $data['is_available'];
            }

            if (empty($fields)) {
                $this->logger->warning("No fields to update for meal ID: {$id}");
                return false;
            }

            $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Bind all parameters
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $success = $stmt->execute();

            if ($success && $stmt->rowCount() > 0) {
                $this->logger->info("Meal updated successfully: ID {$id}");
                return true;
            } else {
                $this->logger->warning("No rows affected when updating meal ID: {$id}");
                return false;
            }
        } catch (PDOException $e) {
            $this->logger->error("Error updating meal: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete meal
     */
    public function delete($id)
    {
        try {
            $this->logger->info("Deleting meal ID: {$id}");

            $query = "DELETE FROM {$this->table} WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);

            $success = $stmt->execute();

            if ($success && $stmt->rowCount() > 0) {
                $this->logger->info("Meal deleted successfully: ID {$id}");
                return true;
            } else {
                $this->logger->warning("No meal found to delete with ID: {$id}");
                return false;
            }
        } catch (PDOException $e) {
            $this->logger->error("Error deleting meal: " . $e->getMessage());
            return false;
        }
    }
}
