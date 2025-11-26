<?php
/**
 * Meal Controller - Handles all meal-related operations
 */

// Attempt to include real model files (support different project layouts) without fatal errors.
@include_once __DIR__ . '/../models/Meal.php';
@include_once __DIR__ . '/../models/Category.php';
@include_once __DIR__ . '/Meal.php';
@include_once __DIR__ . '/Category.php';

require_once __DIR__ . '/../middleware/Validation.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

// Fallback lightweight stubs to avoid "Undefined type 'Meal'" or "Use of unknown class: 'Meal'"
// If your real model files exist, these stubs will not override them.
if (!class_exists('Meal')) {
    class Meal {
        public function getAllWithCategories() { return []; }
        public function getAvailable() { return []; }
        public function create($data) { return false; }
        public function update($id, $data) { return false; }
        public function delete($id) { return false; }
    }
}

if (!class_exists('Category')) {
    class Category {
        // Minimal stub; extend with real methods if needed.
    }
}

class MealController {
    private $mealModel;
    private $categoryModel;
    private $validation;
    private $logger;

    public function __construct() {
        $this->mealModel = new Meal();
        $this->categoryModel = new Category();
        $this->validation = new Validation();
        $this->logger = new Logger();
    }

    /**
     * Get all meals (public for customers, full for admin)
     */
    public function getAllMeals() {
        try {
            $this->logger->info("Fetching all meals");
            
            $meals = $this->mealModel->getAllWithCategories();
            
            if ($meals === false) {
                Response::error('Failed to retrieve meals');
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
    public function getAvailableMeals() {
        try {
            $this->logger->info("Fetching available meals");
            
            $meals = $this->mealModel->getAvailable();
            
            if ($meals === false) {
                Response::error('Failed to retrieve meals');
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
    public function createMeal() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $this->logger->info("Creating new meal: " . ($data['name'] ?? 'Unknown'));

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            // Validate input
            $errors = $this->validation->validateMealCreation($data);
            if (!empty($errors)) {
                Response::validationError($errors);
                return;
            }

            // Handle image upload
            $imagePath = $this->handleImageUpload();
            if ($imagePath !== null) {
                $data['image_path'] = $imagePath;
            }

            // Create meal
            $mealId = $this->mealModel->create($data);
            if (!$mealId) {
                Response::error('Failed to create meal');
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
    public function updateMeal($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $this->logger->info("Updating meal ID: {$id}");

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            // Validate input
            $errors = $this->validation->validateMealUpdate($data);
            if (!empty($errors)) {
                Response::validationError($errors);
                return;
            }

            // Handle image upload if provided
            $imagePath = $this->handleImageUpload();
            if ($imagePath !== null) {
                $data['image_path'] = $imagePath;
            }

            // Update meal
            $success = $this->mealModel->update($id, $data);
            if (!$success) {
                Response::error('Failed to update meal');
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
    public function deleteMeal($id) {
        try {
            $this->logger->info("Deleting meal ID: {$id}");

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            $success = $this->mealModel->delete($id);
            if (!$success) {
                Response::error('Failed to delete meal');
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
    private function handleImageUpload() {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        try {
            $uploadDir = getenv('UPLOAD_PATH') ?: './uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid() . '.' . $fileExtension;
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
                $this->logger->info("Image uploaded successfully: {$filePath}");
                return '/uploads/' . $fileName;
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
     * Authenticate and check admin role
     */
    private function authenticateAdmin() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::error('Authentication required', [], 401);
            return false;
        }

        $token = $matches[1];
        $payload = AuthController::verifyToken($token);
        
        if (!$payload) {
            Response::error('Invalid or expired token', [], 401);
            return false;
        }

        if ($payload['role'] !== 'admin') {
            Response::error('Admin access required', [], 403);
            return false;
        }

        return $payload;
    }
}
?>