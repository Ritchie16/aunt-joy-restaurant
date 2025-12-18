<?php
/**
 * Meal Controller - Handles all meal-related operations
 */

// Load required files with absolute paths
require_once __DIR__ . '/../models/Meal.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class MealController
{
    private $mealModel;
    private $categoryModel;
    private $authMiddleware;
    private $logger;

    public function __construct()
    {
        try {
            $this->logger = new Logger();
            $this->logger->info("Initializing MealController");

            // Initialize models
            $this->mealModel = new Meal();
            $this->categoryModel = new Category();
            $this->authMiddleware = new AuthMiddleware(); // Initialize auth middleware

            $this->logger->info("MealController initialized successfully");
        } catch (Exception $e) {
            $this->logger->error("Failed to initialize MealController: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all meals with creator/updater info
     */
    public function getAllMeals()
    {
        try {
            $this->logger->info("Fetching all meals with details");

            // Authenticate user
            $currentUser = $this->authMiddleware->authenticate();
            if (!$currentUser) {
                // For development, use test user
                $currentUser = [
                    'id' => 1,
                    'name' => 'System Administrator',
                    'email' => 'admin@auntjoy.com',
                    'role' => 'admin',
                    'is_active' => true
                ];
            }

            // Check if user is admin/staff
            if (!in_array($currentUser['role'], ['admin', 'manager', 'sales'])) {
                // For non-staff, return meals without creator/updater details
                $meals = $this->mealModel->getAvailable();
            } else {
                // For staff, return meals with full details
                $meals = $this->mealModel->getAllWithDetails();
            }

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
     * Get available meals (for customers)
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

            // Authenticate and get current user
            $currentUser = $this->authMiddleware->authenticate();
            if (!$currentUser) {
                // For development, use test user
                $currentUser = [
                    'id' => 1,
                    'name' => 'System Administrator',
                    'email' => 'admin@auntjoy.com',
                    'role' => 'admin',
                    'is_active' => true
                ];
            }

            // Check if user has permission to create meals (admin/manager)
            if (!in_array($currentUser['role'], ['admin', 'manager'])) {
                Response::error('Permission denied. Only admins and managers can create meals.', [], 403);
                return;
            }

            // Get request data - Handle both JSON and FormData
            $data = [];
            
            // Check if it's FormData (multipart/form-data)
            if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
                // Handle FormData
                $data = $_POST;
                
                // Handle image upload if present
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $imagePath = $this->handleImageUpload();
                    if ($imagePath !== null) {
                        $data['image_path'] = $imagePath;
                    }
                }
            } else {
                // Handle JSON data
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                
                if (!$data) {
                    Response::error('Invalid request data', [], 400);
                    return;
                }
            }

            $this->logger->info("Creating new meal: " . ($data['name'] ?? 'Unknown') . " by user: {$currentUser['id']}");

            // Validate required fields
            $required = ['name', 'price', 'category_id'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    Response::error("Field '{$field}' is required", [], 400);
                    return;
                }
            }

            // Set default values
            $data['is_available'] = $data['is_available'] ?? 1;
            $data['description'] = $data['description'] ?? '';

            // Convert string values to appropriate types
            if (isset($data['price'])) {
                $data['price'] = floatval($data['price']);
            }
            if (isset($data['category_id'])) {
                $data['category_id'] = intval($data['category_id']);
            }
            if (isset($data['is_available'])) {
                $data['is_available'] = intval($data['is_available']);
            }

            // Create meal with user ID
            $mealId = $this->mealModel->create($data, $currentUser['id']);

            if (!$mealId) {
                Response::error('Failed to create meal', [], 500);
                return;
            }

            $this->logger->info("Meal created successfully: {$data['name']} (ID: {$mealId}) by user: {$currentUser['email']}");
            Response::success('Meal created successfully', [
                'meal_id' => $mealId,
                'created_by' => [
                    'id' => $currentUser['id'],
                    'name' => $currentUser['name'],
                    'email' => $currentUser['email']
                ]
            ], 201);
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

            // Authenticate and get current user
            $currentUser = $this->authMiddleware->authenticate();
            if (!$currentUser) {
                // For development, use test user
                $currentUser = [
                    'id' => 1,
                    'name' => 'System Administrator',
                    'email' => 'admin@auntjoy.com',
                    'role' => 'admin',
                    'is_active' => true
                ];
            }

            // Check if user has permission to update meals (admin/manager)
            if (!in_array($currentUser['role'], ['admin', 'manager'])) {
                Response::error('Permission denied. Only admins and managers can update meals.', [], 403);
                return;
            }

            // Validate ID
            if (!is_numeric($id) || $id <= 0) {
                Response::error('Invalid meal ID', [], 400);
                return;
            }

            // Get request data - Handle both JSON and FormData
            $data = [];
            
            // Check if it's FormData (multipart/form-data)
            if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
                // Handle FormData
                $data = $_POST;
                
                // Handle image upload if present
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $imagePath = $this->handleImageUpload();
                    if ($imagePath !== null) {
                        $data['image_path'] = $imagePath;
                    }
                }
            } else {
                // Handle JSON data
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);
                
                if (!$data) {
                    Response::error('Invalid request data', [], 400);
                    return;
                }
            }

            $this->logger->info("Updating meal ID: {$id} by user: {$currentUser['id']}");

            // Check if meal exists
            $existingMeal = $this->mealModel->findById($id);
            if (!$existingMeal) {
                Response::error('Meal not found', [], 404);
                return;
            }

            // Convert string values to appropriate types
            if (isset($data['price'])) {
                $data['price'] = floatval($data['price']);
            }
            if (isset($data['category_id'])) {
                $data['category_id'] = intval($data['category_id']);
            }
            if (isset($data['is_available'])) {
                $data['is_available'] = intval($data['is_available']);
            }

            // Update meal with user ID
            $success = $this->mealModel->update($id, $data, $currentUser['id']);

            if (!$success) {
                Response::error('Failed to update meal', [], 500);
                return;
            }

            $this->logger->info("Meal updated successfully: ID {$id} by user: {$currentUser['email']}");
            Response::success('Meal updated successfully', [
                'updated_by' => [
                    'id' => $currentUser['id'],
                    'name' => $currentUser['name'],
                    'email' => $currentUser['email']
                ]
            ]);
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

            // Check authentication
            $currentUser = $this->authMiddleware->authenticate();
            if (!$currentUser) {
                // For development, use test user
                $currentUser = [
                    'id' => 1,
                    'name' => 'System Administrator',
                    'email' => 'admin@auntjoy.com',
                    'role' => 'admin',
                    'is_active' => true
                ];
            }

            // Check if user has permission to delete meals (admin/manager)
            if (!in_array($currentUser['role'], ['admin', 'manager'])) {
                Response::error('Permission denied. Only admins and managers can delete meals.', [], 403);
                return;
            }

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
     * Authenticate and check admin role (placeholder - for backward compatibility)
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
        return [
            'id' => 1,
            'role' => 'admin',
            'email' => 'admin@example.com'
        ];
    }
}
?>