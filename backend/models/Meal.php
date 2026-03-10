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
    private $hasAuditColumns = false; // flag to indicate presence of created_by/updated_by

    public function __construct()
    {
        try {
            $database = new Database();
            $this->conn = $database->getConnection();
            $this->logger = new Logger();
            $this->logger->debug("Meal model initialized");

            // determine whether audit columns exist so queries can adapt
            $this->hasAuditColumns = $this->checkAuditColumns();
            if ($this->hasAuditColumns) {
                $this->logger->debug("Audit columns detected on meals table");
            } else {
                $this->logger->warning("Audit columns missing on meals table, using simplified queries");
            }
        } catch (Exception $e) {
            $this->logger = new Logger();
            $this->logger->error("Failed to initialize Meal model: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Check for the existence of audit columns in the meals table
     *
     * @return bool
     */
    private function checkAuditColumns()
    {
        try {
            $stmt = $this->conn->prepare("SHOW COLUMNS FROM {$this->table} LIKE 'created_by'");
            $stmt->execute();
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            $this->logger->error("Error checking audit columns: " . $e->getMessage());
            return false;
        }
    }


    /**
     * Get all meals with categories (and optionally creator/updater info)
     */
    public function getAllWithDetails()
    {
        try {
            $this->logger->info("Getting all meals with details");

            if ($this->hasAuditColumns) {
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
            } else {
                // fallback to simple query when audit columns are not available
                $query = "
                    SELECT m.*, c.name as category_name
                    FROM {$this->table} m
                    LEFT JOIN categories c ON m.category_id = c.id
                    ORDER BY m.created_at DESC
                ";
            }

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
     * Get available meals with creator info (if audit columns exist)
     */
    public function getAvailableWithDetails()
    {
        try {
            $this->logger->info("Getting available meals with details");

            if ($this->hasAuditColumns) {
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
            } else {
                $query = "
                    SELECT m.*, c.name as category_name 
                    FROM {$this->table} m 
                    LEFT JOIN categories c ON m.category_id = c.id 
                    WHERE m.is_available = 1 
                    ORDER BY m.name
                ";
            }

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
     * Get available meals for customers (simple version without creator details)
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
     * Get meal by ID with creator/updater details (when available)
     */
    public function findByIdWithDetails($id)
    {
        try {
            $this->logger->info("Finding meal by ID with details: {$id}");

            if ($this->hasAuditColumns) {
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
            } else {
                $query = "
                    SELECT m.*, c.name as category_name
                    FROM {$this->table} m
                    LEFT JOIN categories c ON m.category_id = c.id
                    WHERE m.id = :id
                ";
            }

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
     * Get meal by ID (simple version without creator details)
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
     * Create new meal with creator info
     */
    public function create($data, $userId = null)
    {
        try {
            $this->logger->info("Creating new meal: " . ($data['name'] ?? 'Unknown'));

            $creatorId = $userId ?? 1; // default admin if not provided

            if ($this->hasAuditColumns) {
                $query = "
                    INSERT INTO {$this->table} 
                    (name, description, price, image_path, category_id, is_available, created_by, updated_by) 
                    VALUES (:name, :description, :price, :image_path, :category_id, :is_available, :created_by, :updated_by)
                ";
            } else {
                // fallback to minimal insert
                $query = "
                    INSERT INTO {$this->table} 
                    (name, description, price, image_path, category_id, is_available) 
                    VALUES (:name, :description, :price, :image_path, :category_id, :is_available)
                ";
            }

            $stmt = $this->conn->prepare($query);

            // Common values
            $name = $data['name'];
            $description = $data['description'] ?? '';
            $price = floatval($data['price']);
            $image_path = $data['image_path'] ?? '';
            $category_id = intval($data['category_id']);
            $is_available = isset($data['is_available']) ? intval($data['is_available']) : 1;

            $stmt->bindValue(':name', $name);
            $stmt->bindValue(':description', $description);
            $stmt->bindValue(':price', $price);
            $stmt->bindValue(':image_path', $image_path);
            $stmt->bindValue(':category_id', $category_id, PDO::PARAM_INT);
            $stmt->bindValue(':is_available', $is_available, PDO::PARAM_INT);

            if ($this->hasAuditColumns) {
                $stmt->bindValue(':created_by', $creatorId, PDO::PARAM_INT);
                $stmt->bindValue(':updated_by', $creatorId, PDO::PARAM_INT);
            }

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
            $fields = [];
            $params = [
                ':id' => $id
            ];

            // update audit column if available
            if ($this->hasAuditColumns) {
                $fields[] = "updated_by = :updated_by";
                $params[':updated_by'] = $userId ?? 1;
            }

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
                $params[':price'] = floatval($data['price']);
            }
            if (isset($data['image_path'])) {
                $fields[] = "image_path = :image_path";
                $params[':image_path'] = $data['image_path'];
            }
            if (isset($data['category_id'])) {
                $fields[] = "category_id = :category_id";
                $params[':category_id'] = intval($data['category_id']);
            }
            if (isset($data['is_available'])) {
                $fields[] = "is_available = :is_available";
                $params[':is_available'] = intval($data['is_available']);
            }

            if (empty($fields)) {
                $this->logger->warning("No fields to update for meal ID: {$id}");
                return false;
            }

            $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Bind all parameters using bindValue
            foreach ($params as $key => $value) {
                // Determine parameter type
                $paramType = PDO::PARAM_STR; // Default to string
                if (in_array($key, [':id', ':updated_by', ':category_id', ':is_available'])) {
                    $paramType = PDO::PARAM_INT;
                } elseif ($key === ':price') {
                    // Price is a decimal, keep as string for PDO
                    $paramType = PDO::PARAM_STR;
                }
                $stmt->bindValue($key, $value, $paramType);
            }

            $success = $stmt->execute();

            if ($success && $stmt->rowCount() > 0) {
                $this->logger->info("Meal updated successfully: ID {$id} by user " . ($params[':updated_by'] ?? 'n/a'));
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