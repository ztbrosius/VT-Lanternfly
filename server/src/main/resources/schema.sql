-- schema.sql
-- VT Lanternfly Database Schema

CREATE DATABASE IF NOT EXISTS vtlanternfly_db;
USE vtlanternfly_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    major VARCHAR(100),
    anonymous BOOLEAN DEFAULT FALSE,
    share_with_researchers BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    photo_hash VARCHAR(64) UNIQUE NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11,8),
    captured_at TIMESTAMP,
    location_source VARCHAR(50),
    life_stage_claimed VARCHAR(50),
    life_stage_verified VARCHAR(50),
    detection_status varchar(50),
    model_confidence DECIMAL(5, 4),
    bbox JSON,
    review_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Point Events Table
CREATE TABLE IF NOT EXISTS point_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_id INT,
    lesson_id INT,
    points INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

-- User Badges Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_badges (
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- Quiz Passes Table
CREATE TABLE IF NOT EXISTS quiz_passes (
    user_id INT NOT NULL,
    lesson_index INT NOT NULL,
    passed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_index),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teams Table

-- Team Members Table

-- Friendships Table

-- Personal Goals Table
