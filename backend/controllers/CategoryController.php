<?php

/**
 * Category Controller - Handles category operations
 */

require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Logger.php';

class CategoryController
{
    private $categoryModel;
    private $logger;

    public function __construct()
    {
        try {
            $this->logger = new Logger();
            $this->logger->info("Initializing CategoryController");

            $this->categoryModel = new Category();

            $this->logger->info("CategoryController initialized successfully");
        } catch (Exception $e) {
            $this->logger = new Logger();
            $this->logger->error("Failed to initialize CategoryController: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all categories
     */
    public function getAllCategories()
    {
        try {
            $this->logger->info("Fetching all categories");

            $categories = $this->categoryModel->getAll();

            if ($categories === false) {
                Response::error('Failed to retrieve categories', [], 500);
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
    public function getCategoryById($id)
    {
        try {
            $this->logger->info("Fetching category by ID: {$id}");

            // Validate ID
            if (!is_numeric($id) || $id <= 0) {
                Response::error('Invalid category ID', [], 400);
                return;
            }

            $category = $this->categoryModel->findById($id);

            if (!$category) {
                Response::error('Category not found', [], 404);
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
    public function createCategory()
    {
        try {
            $this->logger->info("Processing category creation request");

            // Get request data
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                Response::error('Invalid request data', [], 400);
                return;
            }

            $this->logger->info("Creating new category: " . ($data['name'] ?? 'Unknown'));

            // Check authentication and admin role (simplified for now)
            // $admin = $this->authenticateAdmin();
            // if (!$admin) return;

            // Validate required fields
            if (empty($data['name'])) {
                Response::error('Category name is required', [], 400);
                return;
            }

            // Create category
            $categoryId = $this->categoryModel->create($data);

            if (!$categoryId) {
                Response::error('Failed to create category', [], 500);
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
     * Authenticate and check admin role (placeholder)
     */
    private function authenticateAdmin()
    {
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
