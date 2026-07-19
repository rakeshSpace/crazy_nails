-- Create database
CREATE DATABASE IF NOT EXISTS crazy_nails_db;
USE crazy_nails_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'user') DEFAULT 'user',
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Services table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('nails', 'lashes', 'facials', 'waxing', 'manicure', 'pedicure', 'addons') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('nail-care', 'lash-care', 'skincare', 'hair-removal', 'tools') NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    badge VARCHAR(50),
    rating DECIMAL(2,1) DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (is_featured)
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    service_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration INT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id),
    INDEX idx_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_email (customer_email)
);

-- Gallery table
CREATE TABLE gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('nails', 'extensions', 'lashes', 'manicure', 'pedicure', 'facials') NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- Cart items table
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('card', 'upi', 'cod') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_email (customer_email),
    INDEX idx_status (order_status)
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
);

-- Testimonials table
CREATE TABLE testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    comment TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_approved (is_approved)
);

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'json', 'boolean', 'number') DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table for JWT management
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_expires (expires_at)
);

-- Insert default admin user (password: Admin@123)
INSERT INTO users (name, email, phone, password_hash, role) VALUES 
('Admin User', 'admin@crazynails.com', '9999999999', '$2a$10$YourHashedPasswordHere', 'admin');

-- Insert sample services
INSERT INTO services (name, category, description, price, duration, display_order) VALUES
('Acrylic Extension', 'nails', 'Professional acrylic nail extensions', 1000, 120, 1),
('Gel Extension', 'nails', 'Natural looking gel nail extensions', 1200, 120, 2),
('Classic Eyelash Extension', 'lashes', 'Natural looking individual lash extensions', 2500, 120, 3),
('Volume Eyelash Extension', 'lashes', 'Full volume for a dramatic look', 4500, 150, 4),
('Fruit Facial', 'facials', 'Refreshing fruit facial for glowing skin', 2000, 60, 5),
('Full Face Waxing', 'waxing', 'Complete facial hair removal', 500, 30, 6),
('Premium Manicure', 'manicure', 'Luxury manicure with hand massage', 1400, 45, 7),
('Platinum Pedicure', 'pedicure', 'Premium pedicure with paraffin wax', 2000, 60, 8);

-- Insert sample products
INSERT INTO products (name, category, description, price, stock_quantity, is_featured, rating) VALUES
('Premium Nail Care Kit', 'nail-care', 'Complete nail care set with professional tools', 1200, 50, TRUE, 4.8),
('Lash Growth Serum', 'lash-care', 'Advanced eyelash growth serum with natural peptides', 1800, 30, TRUE, 4.5),
('Luxury Facial Cream', 'skincare', 'Premium facial cream with hyaluronic acid', 2500, 25, FALSE, 4.9);

-- Insert sample settings
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
('site_name', 'Crazy Nails & Lashes', 'text'),
('contact_phone', '8264304266', 'text'),
('contact_email', 'info@crazynails.com', 'text'),
('working_hours', '{"monday_friday":"9:00 AM - 8:00 PM","saturday":"9:00 AM - 8:00 PM","sunday":"10:00 AM - 6:00 PM"}', 'json'),
('theme_settings', '{"primary_color":"#d4a574","dark_mode":false}', 'json');