-- Create database if it doesn't exist
--This is database.sql file at root dir in backend
CREATE DATABASE IF NOT EXISTS aunt_joy_restaurant;
USE aunt_joy_restaurant;

-- Aunt Joy Restaurant Database Schema
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS users, categories, meals, orders, order_items, password_resets;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin', 'manager', 'sales') DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE meals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_path VARCHAR(255),
    category_id INT,
    is_available BOOLEAN DEFAULT TRUE,
    created_by INT,  -- NEW: who created the meal
    updated_by INT,  -- NEW: who last updated the meal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,  -- NEW
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL   -- NEW
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    meal_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user with correct password hash for 'app@1234'
INSERT INTO users (name, email, password, role) VALUES 
('System Administrator', 'admin@auntjoy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Breakfast', 'Start your day with our delicious breakfast options'),
('Lunch', 'Hearty meals for your midday break'),
('Dinner', 'Perfect meals to end your day'),
('Drinks', 'Refreshing beverages and drinks'),
('Desserts', 'Sweet treats to satisfy your cravings');

-- Insert sample meals
INSERT INTO meals (name, description, price, category_id, image_path) VALUES 
('Full English Breakfast', 'Eggs, bacon, sausages, beans, toast and mushrooms', 12.99, 1, '/images/breakfast1.jpg'),
('Pancake Stack', 'Fluffy pancakes with maple syrup and butter', 8.99, 1, '/images/breakfast2.jpg'),
('Grilled Chicken Salad', 'Fresh greens with grilled chicken and dressing', 10.99, 2, '/images/lunch1.jpg'),
('Beef Burger', 'Juicy beef patty with cheese and vegetables', 11.99, 2, '/images/lunch2.jpg'),
('Spaghetti Carbonara', 'Creamy pasta with bacon and parmesan', 13.99, 3, '/images/dinner1.jpg'),
('Grilled Salmon', 'Fresh salmon with vegetables and lemon butter', 16.99, 3, '/images/dinner2.jpg'),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, 4, '/images/drink1.jpg'),
('Chocolate Cake', 'Rich chocolate cake with cream frosting', 5.99, 5, '/images/dessert1.jpg');