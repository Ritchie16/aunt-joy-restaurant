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
     * Get all meals with categories (for backward compatibility)
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
     * Get meal by ID (for backward compatibility)
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
     * Get all meals with categories and creator/updater info
     */
    public function getAllWithDetails()
    {
        try {
            $this->logger->info("Getting all meals with details");

            $query = "
                SELECT 
                    m.*, 
                    c.name as category_name,
                    creator.name as creator_name,
                    creator.email as creator_email,
                    updater.name as updater_name,
                    updater.email as updater_email
                FROM {$this->table} m 
                LEFT JOIN categories c ON m.category_id = c.id 
                LEFT JOIN users creator ON m.created_by = creator.id
                LEFT JOIN users updater ON m.updated_by = updater.id
                ORDER BY m.created_at DESC
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $meals = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Retrieved " . count($meals) . " meals with details");

            return $meals;
        } catch (PDOException $e) {
            $this->logger->error("Error in getAllWithDetails: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get available meals with creator info
     */
    public function getAvailableWithDetails()
    {
        try {
            $this->logger->info("Getting available meals with details");

            $query = "
                SELECT 
                    m.*, 
                    c.name as category_name,
                    creator.name as creator_name
                FROM {$this->table} m 
                LEFT JOIN categories c ON m.category_id = c.id 
                LEFT JOIN users creator ON m.created_by = creator.id
                WHERE m.is_available = 1 
                ORDER BY m.name
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $meals = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->info("Retrieved " . count($meals) . " available meals");

            return $meals;
        } catch (PDOException $e) {
            $this->logger->error("Error in getAvailableWithDetails: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get meal by ID with creator/updater details
     */
    public function findByIdWithDetails($id)
    {
        try {
            $this->logger->info("Finding meal by ID with details: {$id}");

            $query = "
                SELECT 
                    m.*, 
                    c.name as category_name,
                    creator.name as creator_name,
                    creator.email as creator_email,
                    updater.name as updater_name,
                    updater.email as updater_email
                FROM {$this->table} m 
                LEFT JOIN categories c ON m.category_id = c.id 
                LEFT JOIN users creator ON m.created_by = creator.id
                LEFT JOIN users updater ON m.updated_by = updater.id
                WHERE m.id = :id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $meal = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($meal) {
                $this->logger->info("Meal found with details: {$meal['name']}");
            } else {
                $this->logger->info("Meal not found with ID: {$id}");
            }

            return $meal;
        } catch (PDOException $e) {
            $this->logger->error("Error in findByIdWithDetails: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new meal with creator info
     */
    public function create($data, $userId = null)
    {
        try {
            $this->logger->info("Creating new meal: " . ($data['name'] ?? 'Unknown'));

            $query = "
                INSERT INTO {$this->table} 
                (name, description, price, image_path, category_id, is_available, created_by, updated_by) 
                VALUES (:name, :description, :price, :image_path, :category_id, :is_available, :created_by, :updated_by)
            ";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description'] ?? '');
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':image_path', $data['image_path'] ?? '');
            $stmt->bindParam(':category_id', $data['category_id']);
            $stmt->bindParam(':is_available', $data['is_available'] ?? 1, PDO::PARAM_INT);
            
            // Use userId if provided, otherwise use default admin (for backward compatibility)
            $creatorId = $userId ?? 1;
            $stmt->bindParam(':created_by', $creatorId, PDO::PARAM_INT);
            $stmt->bindParam(':updated_by', $creatorId, PDO::PARAM_INT);

            $stmt->execute();

            $mealId = $this->conn->lastInsertId();

            $this->logger->info("Meal created successfully with ID: {$mealId} by user: {$creatorId}");

            return $mealId;
        } catch (PDOException $e) {
            $this->logger->error("Error creating meal: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update meal with updater info
     */
    public function update($id, $data, $userId = null)
    {
        try {
            $this->logger->info("Updating meal ID: {$id} by user: {$userId}");

            // Build dynamic update query
            $fields = ["updated_by = :updated_by"]; // Always update the updated_by field
            $params = [
                ':id' => $id,
                ':updated_by' => $userId ?? 1 // Use userId if provided, otherwise use default admin
            ];

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

            if (count($fields) <= 1) { // Only updated_by field
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
                $this->logger->info("Meal updated successfully: ID {$id} by user {$params[':updated_by']}");
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
?>