<?php
/**
 * Category Controller - Handles category operations
 */
require_once  '../models/Category.php';
require_once '../utils/Response.php';
require_once '../utils/Logger.php';

class CategoryController {
    private $categoryModel;
    private $logger;

    public function __construct() {
        $this->categoryModel = new Category();
        $this->logger = new Logger();
    }

    /**
     * Get all categories
     */
    public function getAllCategories() {
        try {
            $this->logger->info("Fetching all categories");
            
            $categories = $this->categoryModel->getAll();
            
            if ($categories === false) {
                Response::error('Failed to retrieve categories');
                return;
            }

            $this->logger->info("Retrieved " . count($categories) . " categories");
            Response::success('Categories retrieved successfully', $categories);

        } catch (Exception $e) {
            $this->logger->error("Error in getAllCategories: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Get category by ID
     */
    public function getCategoryById($id) {
        try {
            $this->logger->info("Fetching category by ID: {$id}");
            
            $category = $this->categoryModel->findById($id);
            
            if (!$category) {
                Response::error('Category not found');
                return;
            }

            $this->logger->info("Category retrieved: {$category['name']}");
            Response::success('Category retrieved successfully', $category);

        } catch (Exception $e) {
            $this->logger->error("Error in getCategoryById: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Create new category (admin only)
     */
    public function createCategory() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $this->logger->info("Creating new category: " . ($data['name'] ?? 'Unknown'));

            // Check authentication and admin role
            $admin = $this->authenticateAdmin();
            if (!$admin) return;

            // Validate input
            if (empty($data['name'])) {
                Response::error('Category name is required');
                return;
            }

            // Create category
            $categoryId = $this->categoryModel->create($data);
            if (!$categoryId) {
                Response::error('Failed to create category');
                return;
            }

            $this->logger->info("Category created successfully: {$data['name']} (ID: {$categoryId})");
            Response::success('Category created successfully', ['category_id' => $categoryId], 201);

        } catch (Exception $e) {
            $this->logger->error("Error in createCategory: " . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), [], 500);
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