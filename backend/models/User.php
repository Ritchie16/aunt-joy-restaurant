<?php

/**
 * User Model - Handles all user-related database operations
 */
require_once __DIR__ . '/../config/Database.php'; // FIXED: Use __DIR__
require_once __DIR__ . '/../utils/Logger.php';

class User
{
    private $conn;
    private $table = 'users';
    private $logger;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->logger = new Logger();
    }


    /**
     * Find user by email
     */
    public function findByEmail($email)
    {
        try {
            $query = "SELECT * FROM {$this->table} WHERE email = :email AND is_active = TRUE";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $this->logger->debug("User found by email: {$email}");
            } else {
                $this->logger->debug("User not found by email: {$email}");
            }

            return $user;
        } catch (PDOException $e) {
            $this->logger->error("Error finding user by email {$email}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Find user by ID
     */
    public function findById($id)
    {
        try {
            $query = "SELECT id, name, email, role, phone, address, is_active, created_at
                      FROM {$this->table} WHERE id = :id AND is_active = TRUE";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $this->logger->debug("User found by ID: {$id}");
            } else {
                $this->logger->debug("User not found by ID: {$id}");
            }

            return $user;
        } catch (PDOException $e) {
            $this->logger->error("Error finding user by ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create new user
     */
    public function create($data)
    {
        try {
            $query = "INSERT INTO {$this->table}
                     (name, email, password, role, phone, address)
                     VALUES (:name, :email, :password, :role, :phone, :address)";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':password', $data['password']);
            $stmt->bindParam(':role', $data['role']);
            $stmt->bindParam(':phone', $data['phone']);
            $stmt->bindParam(':address', $data['address']);

            $stmt->execute();
            $userId = $this->conn->lastInsertId();

            $this->logger->info("User created successfully: {$data['email']} (ID: {$userId})");
            return $userId;
        } catch (PDOException $e) {
            $this->logger->error("Error creating user {$data['email']}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all users (for admin)
     */
    public function getAll($role = null)
    {
        try {
            $query = "SELECT id, name, email, role, phone, address, is_active, created_at
                      FROM {$this->table} WHERE 1=1";

            if ($role) {
                $query .= " AND role = :role";
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);

            if ($role) {
                $stmt->bindParam(':role', $role);
            }

            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->logger->debug("Retrieved " . count($users) . " users" . ($role ? " with role: {$role}" : ""));
            return $users;
        } catch (PDOException $e) {
            $this->logger->error("Error retrieving users: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update user
     */
    public function update($id, $data)
    {
        try {
            $allowedFields = ['name', 'email', 'phone', 'address', 'is_active'];
            $updates = [];
            $params = ['id' => $id];

            foreach ($data as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $updates[] = "{$key} = :{$key}";
                    $params[$key] = $value;
                }
            }

            if (empty($updates)) {
                $this->logger->warning("No valid fields to update for user ID: {$id}");
                return false;
            }

            $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);

            $this->logger->info("User updated successfully: ID {$id}");
            return true;
        } catch (PDOException $e) {
            $this->logger->error("Error updating user ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete user (soft delete)
     */
    public function delete($id)
    {
        try {
            $query = "UPDATE {$this->table} SET is_active = FALSE WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $this->logger->info("User soft-deleted: ID {$id}");
            return true;
        } catch (PDOException $e) {
            $this->logger->error("Error deleting user ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * activate user
     */
    public function activate($id){
        try {
            $query = "UPDATE {$this->table} SET is_active = TRUE WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $this->logger->info("User activated: ID {$id}");
            return true;
        } catch (PDOException $e) {
            $this->logger->error("Error activating user ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get users by role
     */
    public function getByRole($role)
    {
        try {
            $query = "SELECT id, name, email, phone, address, created_at
                      FROM {$this->table}
                      WHERE role = :role AND is_active = TRUE
                      ORDER BY name";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':role', $role);
            $stmt->execute();

            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->logger->debug("Retrieved " . count($users) . " users with role: {$role}");

            return $users;
        } catch (PDOException $e) {
            $this->logger->error("Error retrieving users by role {$role}: " . $e->getMessage());
            return false;
        }
    }
}
