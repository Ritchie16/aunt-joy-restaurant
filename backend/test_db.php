<?php
require_once 'config/Database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Test users table
    $stmt = $conn->query("SELECT COUNT(*) as user_count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "Database connected successfully!\n";
    echo "Users in database: " . $result['user_count'] . "\n";

    // Test admin user
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = 'admin@auntjoy.com'");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        echo "Admin user found: " . $admin['email'] . "\n";
        echo "Admin role: " . $admin['role'] . "\n";
    } else {
        echo "Admin user not found!\n";
    }

} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>