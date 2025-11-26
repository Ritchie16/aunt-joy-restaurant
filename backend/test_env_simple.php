<?php
// test_env_simple.php
require_once 'config/Environment.php';

echo "<h1>Environment Test</h1>";

echo "<h3>Checking Environment Variables:</h3>";
$vars = ['JWT_SECRET', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'DB_HOST', 'DB_NAME'];

foreach ($vars as $var) {
    $value = Environment::get($var);
    $status = $value ? "✅ SET" : "❌ NOT SET";
    echo "<p><strong>$var:</strong> $status";
    if ($value && $var === 'SMTP_PASS') {
        echo " (Value: " . substr($value, 0, 3) . "...)</p>";
    } elseif ($value) {
        echo " (Value: $value)</p>";
    } else {
        echo "</p>";
    }
}

echo "<h3>All Loaded Variables:</h3>";
echo "<pre>";
print_r(Environment::getAll());
echo "</pre>";
