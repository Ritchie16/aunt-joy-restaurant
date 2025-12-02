<?php

/**
 * Meal Controller - Handles all meal-related operations
 */

// Load required files with absolute paths
require_once __DIR__ . '/../models/Meal.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

class MealController
{
    private $mealModel;
    private $categoryModel;
    private $logger;

    public function __construct()
    {
        try {
            $this->logger = new Logger();
            $this->logger->info("Initializing MealController");

            // Initialize models
            $this->mealModel = new Meal();
            $this->categoryModel = new Category();

            $this->logger->info("MealController initialized successfully");
        } catch (Exception $e) {
            $this->logger = new Logger();
            $this->logger->error("Failed to initialize MealController: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all meals (public for customers, full for admin)
     */
    public function getAllMeals()
    {
        try {
            $this->logger->info("Fetching all meals");

            $meals = $this->mealModel->getAllWithCategories();

            if ($meals === false) {
                Response::error('Failed to retrieve meals', [], 500);
                return;
            }

            $this->logger->info("Retrieved " . count($meals) . " meals");
            Response::success('Meals retrieved successfully', $meals);
        } catch (Exception $e) {
            $this->logger->error("Error in getAllMeals: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get available meals for customers
     */
    public function getAvailableMeals()
    {
        try {
            $this->logger->info("Fetching available meals");

            $meals = $this->mealModel->getAvailable();

            if ($meals === false) {
                Response::error('Failed to retrieve meals', [], 500);
                return;
            }

            $this->logger->info("Retrieved " . count($meals) . " available meals");
            Response::success('Meals retrieved successfully', $meals);
        } catch (Exception $e) {
            $this->logger->error("Error in getAvailableMeals: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Create new meal (admin only)
     */
    public function createMeal()
    {
        try {
            $this->logger->info("Processing meal creation request");

            // Get request data
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                Response::error('Invalid request data', [], 400);
                return;
            }

            $this->logger->info("Creating new meal: " . ($data['name'] ?? 'Unknown'));

            // Check authentication and admin role (simplified for now)
            // $admin = $this->authenticateAdmin();
            // if (!$admin) return;

            // Validate required fields
            $required = ['name', 'price', 'category_id'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    Response::error("Field '{$field}' is required", [], 400);
                    return;
                }
            }

            // Handle image upload if present
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $imagePath = $this->handleImageUpload();
                if ($imagePath !== null) {
                    $data['image_path'] = $imagePath;
                }
            }

            // Set default values
            $data['is_available'] = $data['is_available'] ?? 1;
            $data['description'] = $data['description'] ?? '';

            // Create meal
            $mealId = $this->mealModel->create($data);

            if (!$mealId) {
                Response::error('Failed to create meal', [], 500);
                return;
            }

            $this->logger->info("Meal created successfully: {$data['name']} (ID: {$mealId})");
            Response::success('Meal created successfully', ['meal_id' => $mealId], 201);
        } catch (Exception $e) {
            $this->logger->error("Error in createMeal: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Update meal
     */
    public function updateMeal($id)
    {
        try {
            $this->logger->info("Processing meal update request for ID: {$id}");

            // Validate ID
            if (!is_numeric($id) || $id <= 0) {
                Response::error('Invalid meal ID', [], 400);
                return;
            }

            // Get request data
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                Response::error('Invalid request data', [], 400);
                return;
            }

            $this->logger->info("Updating meal ID: {$id}");

            // Check authentication and admin role (simplified for now)
            // $admin = $this->authenticateAdmin();
            // if (!$admin) return;

            // Check if meal exists
            $existingMeal = $this->mealModel->findById($id);
            if (!$existingMeal) {
                Response::error('Meal not found', [], 404);
                return;
            }

            // Handle image upload if present
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $imagePath = $this->handleImageUpload();
                if ($imagePath !== null) {
                    $data['image_path'] = $imagePath;
                }
            }

            // Update meal
            $success = $this->mealModel->update($id, $data);

            if (!$success) {
                Response::error('Failed to update meal', [], 500);
                return;
            }

            $this->logger->info("Meal updated successfully: ID {$id}");
            Response::success('Meal updated successfully');
        } catch (Exception $e) {
            $this->logger->error("Error in updateMeal: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Delete meal
     */
    public function deleteMeal($id)
    {
        try {
            $this->logger->info("Processing meal deletion request for ID: {$id}");

            // Validate ID
            if (!is_numeric($id) || $id <= 0) {
                Response::error('Invalid meal ID', [], 400);
                return;
            }

            $this->logger->info("Deleting meal ID: {$id}");

            // Check authentication and admin role (simplified for now)
            // $admin = $this->authenticateAdmin();
            // if (!$admin) return;

            // Check if meal exists
            $existingMeal = $this->mealModel->findById($id);
            if (!$existingMeal) {
                Response::error('Meal not found', [], 404);
                return;
            }

            // Delete meal
            $success = $this->mealModel->delete($id);

            if (!$success) {
                Response::error('Failed to delete meal', [], 500);
                return;
            }

            $this->logger->info("Meal deleted successfully: ID {$id}");
            Response::success('Meal deleted successfully');
        } catch (Exception $e) {
            $this->logger->error("Error in deleteMeal: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Handle image upload
     */
    private function handleImageUpload()
    {
        try {
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return null;
            }

            $this->logger->info("Processing image upload");

            // Validate file
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $fileType = $_FILES['image']['type'];

            if (!in_array($fileType, $allowedTypes)) {
                $this->logger->error("Invalid file type: {$fileType}");
                return null;
            }

            // Set upload directory
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
                $this->logger->info("Created upload directory: {$uploadDir}");
            }

            // Generate unique filename
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('meal_') . '.' . $fileExtension;
            $filePath = $uploadDir . $fileName;

            // Move uploaded file
            if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
                $relativePath = '/uploads/' . $fileName;
                $this->logger->info("Image uploaded successfully: {$relativePath}");
                return $relativePath;
            } else {
                $this->logger->error("Failed to move uploaded file");
                return null;
            }
        } catch (Exception $e) {
            $this->logger->error("Error in image upload: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Authenticate and check admin role (placeholder - implement properly)
     */
    private function authenticateAdmin()
    {
        // This is a simplified version. Implement proper JWT/Token authentication
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader)) {
            Response::error('Authentication required', [], 401);
            return false;
        }

        // For now, just return a dummy admin payload
        // In production, verify JWT token
        return [
            'id' => 1,
            'role' => 'admin',
            'email' => 'admin@example.com'
        ];
    }
}
