<?php
// Test absolute paths
echo "Testing file paths...\n";

$files_to_test = [
    'config/Database.php',
    'utils/Logger.php',
    'models/User.php',
    'controllers/AuthController.php',
    'middleware/Validation.php',
    'config/Environment.php'
];

foreach ($files_to_test as $file) {
    $full_path = __DIR__ . '/' . $file;
    if (file_exists($full_path)) {
        echo "✓ Found: $file\n";
    } else {
        echo "✗ Missing: $file\n";
        echo "  Looking for: $full_path\n";
    }
}

// Test database connection
echo "\nTesting database connection...\n";
try {
    require_once __DIR__ . '/config/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    echo "✓ Database connection successful\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
}

// Test environment
echo "\nTesting environment...\n";
try {
    require_once __DIR__ . '/config/Environment.php';
    Environment::load();
    echo "✓ Environment loaded\n";
    echo "  DB_HOST: " . Environment::get('DB_HOST') . "\n";
    echo "  DB_NAME: " . Environment::get('DB_NAME') . "\n";
} catch (Exception $e) {
    echo "✗ Environment failed: " . $e->getMessage() . "\n";
}
