<?php
// test_meals.php
echo "Testing Meal API System\n";
echo "======================\n\n";

// Test database connection
echo "1. Testing database connection...\n";
try {
    require_once __DIR__ . '/config/Database.php';
    $database = new Database();
    $conn = $database->getConnection();
    echo "✅ Database connection successful\n\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test models
echo "2. Testing Meal model...\n";
try {
    require_once __DIR__ . '/models/Meal.php';
    $mealModel = new Meal();
    echo "✅ Meal model initialized\n\n";
} catch (Exception $e) {
    echo "❌ Meal model failed: " . $e->getMessage() . "\n\n";
}

echo "3. Testing Category model...\n";
try {
    require_once __DIR__ . '/models/Category.php';
    $categoryModel = new Category();
    echo "✅ Category model initialized\n\n";
} catch (Exception $e) {
    echo "❌ Category model failed: " . $e->getMessage() . "\n\n";
}

// Test controllers
echo "4. Testing MealController...\n";
try {
    require_once __DIR__ . '/controllers/MealController.php';
    $mealController = new MealController();
    echo "✅ MealController initialized\n\n";
} catch (Exception $e) {
    echo "❌ MealController failed: " . $e->getMessage() . "\n\n";
}

echo "5. Testing CategoryController...\n";
try {
    require_once __DIR__ . '/controllers/CategoryController.php';
    $categoryController = new CategoryController();
    echo "✅ CategoryController initialized\n\n";
} catch (Exception $e) {
    echo "❌ CategoryController failed: " . $e->getMessage() . "\n\n";
}

echo "6. Testing database queries...\n";
try {
    // Test categories query
    $categories = $categoryModel->getAll();
    if ($categories !== false) {
        echo "✅ Categories query successful (" . count($categories) . " categories found)\n";
    } else {
        echo "⚠️ Categories query returned false\n";
    }

    // Test meals query
    $meals = $mealModel->getAllWithCategories();
    if ($meals !== false) {
        echo "✅ Meals query successful (" . count($meals) . " meals found)\n";
    } else {
        echo "⚠️ Meals query returned false\n";
    }
} catch (Exception $e) {
    echo "❌ Query test failed: " . $e->getMessage() . "\n";
}

echo "\n✅ All tests completed!\n";
