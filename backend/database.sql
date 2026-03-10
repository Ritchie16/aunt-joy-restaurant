-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS aunt_joy_restaurant;
USE aunt_joy_restaurant;

-- Aunt Joy Restaurant Database Schema
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS users, categories, meals, orders, order_items, password_resets, reservations;
SET FOREIGN_KEY_CHECKS=1;

-- Users table
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

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table (with featured column for landing page)
CREATE TABLE meals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_path VARCHAR(255),
    category_id INT,
    is_available BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE, -- New: for landing page featured dishes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_featured (featured),
    INDEX idx_available (is_available)
);

-- Orders table
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
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_customer (customer_id)
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    meal_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
);

-- Password resets table
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email)
);

-- Reservations table (for landing page)
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    confirmation_number VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INT NOT NULL CHECK (guests > 0 AND guests <= 20),
    notes TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_confirmation (confirmation_number)
);

-- Insert default admin user
-- Password: 'admin123' (hashed)
INSERT INTO users (name, email, password, role) VALUES 
('System Administrator', 'admin@auntjoy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Restaurant Manager', 'manager@auntjoy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
('Sales Staff', 'sales@auntjoy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales'),
('Regular Customer', 'customer@auntjoy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Appetizers', 'Start your meal with our delicious appetizers'),
('Main Course', 'Hearty main dishes for every taste'),
('Pasta', 'Authentic Italian pasta dishes'),
('Pizza', 'Wood-fired pizzas with fresh toppings'),
('Seafood', 'Fresh catches from the sea'),
('Desserts', 'Sweet treats to end your meal perfectly'),
('Drinks', 'Refreshing beverages and cocktails'),
('Breakfast', 'Delicious morning meals');

-- Insert sample meals with featured items
INSERT INTO meals (name, description, price, category_id, image_path, featured) VALUES 
('Spaghetti Carbonara', 'Classic Roman pasta with eggs, pancetta, and pecorino cheese', 16.99, 3, '/images/spaghetti-carbonara.jpg', TRUE),
('Margherita Pizza', 'Traditional pizza with fresh mozzarella, tomatoes, and basil', 14.99, 4, '/images/margherita-pizza.jpg', TRUE),
('Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', 8.99, 6, '/images/tiramisu.jpg', TRUE),
('Grilled Salmon', 'Atlantic salmon with lemon butter sauce and seasonal vegetables', 22.99, 5, '/images/grilled-salmon.jpg', FALSE),
('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan', 10.99, 1, '/images/caesar-salad.jpg', FALSE),
('Bruschetta', 'Toasted bread topped with tomatoes, garlic, and fresh basil', 7.99, 1, '/images/bruschetta.jpg', FALSE),
('Lasagna Bolognese', 'Layers of pasta with rich meat sauce and melted cheese', 18.99, 3, '/images/lasagna.jpg', TRUE),
('Seafood Risotto', 'Creamy risotto with mixed seafood and saffron', 19.99, 3, '/images/seafood-risotto.jpg', FALSE),
('Pepperoni Pizza', 'Classic pizza with pepperoni and mozzarella cheese', 15.99, 4, '/images/pepperoni-pizza.jpg', FALSE),
('Chocolate Lava Cake', 'Warm chocolate cake with a molten center, served with vanilla ice cream', 9.99, 6, '/images/chocolate-cake.jpg', TRUE),
('Mozzarella Sticks', 'Breaded mozzarella sticks with marinara sauce', 8.99, 1, '/images/mozzarella-sticks.jpg', FALSE),
('Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with balsamic glaze', 11.99, 1, '/images/caprese-salad.jpg', FALSE),
('Fettuccine Alfredo', 'Fettuccine pasta in a creamy parmesan sauce', 15.99, 3, '/images/fettuccine-alfredo.jpg', FALSE),
('Chicken Parmesan', 'Breaded chicken breast with marinara sauce and melted cheese', 17.99, 2, '/images/chicken-parmesan.jpg', FALSE),
('Garlic Bread', 'Toasted bread with garlic butter and herbs', 5.99, 1, '/images/garlic-bread.jpg', FALSE),
('Italian Soda', 'Sparkling soda with natural fruit syrup', 4.99, 7, '/images/italian-soda.jpg', FALSE),
('Red Wine (Glass)', 'Selection of fine Italian red wines', 8.99, 7, '/images/red-wine.jpg', FALSE),
('White Wine (Glass)', 'Selection of fine Italian white wines', 8.99, 7, '/images/white-wine.jpg', FALSE),
('Espresso', 'Strong Italian espresso coffee', 3.99, 7, '/images/espresso.jpg', FALSE),
('Cannoli', 'Crispy pastry tubes filled with sweet ricotta cream', 7.99, 6, '/images/cannoli.jpg', FALSE);

-- Insert sample reservations for testing
INSERT INTO reservations (confirmation_number, name, email, phone, date, time, guests, notes, status) VALUES 
('RSV000001', 'John Smith', 'john@example.com', '555-0101', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00', 4, 'Anniversary dinner', 'confirmed'),
('RSV000002', 'Maria Garcia', 'maria@example.com', '555-0102', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '19:30', 2, '', 'pending'),
('RSV000003', 'Robert Johnson', 'robert@example.com', '555-0103', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00', 6, 'Birthday party', 'confirmed');

-- Insert sample orders for testing
INSERT INTO orders (customer_id, order_number, total_amount, status, delivery_address, customer_phone) VALUES 
(4, 'ORD20240115001', 45.97, 'delivered', '123 Main St, City', '555-0201'),
(4, 'ORD20240116001', 32.98, 'preparing', '456 Oak Ave, City', '555-0201');

-- Insert sample order items
INSERT INTO order_items (order_id, meal_id, quantity, unit_price, total_price) VALUES 
(1, 1, 1, 16.99, 16.99),
(1, 3, 2, 8.99, 17.98),
(1, 10, 1, 9.99, 9.99),
(2, 2, 1, 14.99, 14.99),
(2, 7, 1, 18.99, 18.99);