-- Seed data for foods table
-- Common foods with nutritional information per 100g

INSERT INTO foods (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, glycemic_index) VALUES
-- Fruits
('Apple', 'Fruits', 52, 0.3, 14, 0.2, 2.4, 10.4, 1, 38),
('Banana', 'Fruits', 89, 1.1, 23, 0.3, 2.6, 12.2, 1, 51),
('Orange', 'Fruits', 47, 0.9, 12, 0.1, 2.4, 9.4, 0, 45),
('Strawberries', 'Fruits', 32, 0.7, 8, 0.3, 2.0, 4.9, 1, 40),
('Blueberries', 'Fruits', 57, 0.7, 14, 0.3, 2.4, 10.0, 1, 53),
('Avocado', 'Fruits', 160, 2.0, 9, 15, 7, 0.7, 7, 10),

-- Vegetables
('Broccoli', 'Vegetables', 34, 2.8, 7, 0.4, 2.6, 1.5, 33, 10),
('Spinach', 'Vegetables', 23, 2.9, 4, 0.4, 2.2, 0.4, 79, 15),
('Carrots', 'Vegetables', 41, 0.9, 10, 0.2, 2.8, 4.7, 69, 47),
('Bell Peppers', 'Vegetables', 31, 1.0, 7, 0.3, 2.5, 4.2, 4, 10),
('Tomatoes', 'Vegetables', 18, 0.9, 4, 0.2, 1.2, 2.6, 5, 10),
('Cauliflower', 'Vegetables', 25, 1.9, 5, 0.3, 2.0, 1.9, 30, 10),

-- Grains & Cereals
('Brown Rice', 'Grains', 123, 2.6, 25, 1.0, 1.6, 0.4, 5, 50),
('White Rice', 'Grains', 130, 2.7, 28, 0.3, 0.4, 0.1, 5, 73),
('Quinoa', 'Grains', 120, 4.4, 22, 1.9, 2.8, 0.9, 5, 53),
('Oats', 'Grains', 389, 16.9, 66, 6.9, 10.6, 0.6, 2, 55),
('Whole Wheat Bread', 'Grains', 247, 13, 41, 4.2, 6.0, 6.8, 443, 74),
('White Bread', 'Grains', 265, 9, 49, 3.2, 2.7, 5.7, 681, 75),

-- Proteins
('Chicken Breast', 'Proteins', 165, 31, 0, 3.6, 0, 0, 74, 0),
('Salmon', 'Proteins', 208, 20, 0, 12, 0, 0, 44, 0),
('Eggs', 'Proteins', 155, 13, 1.1, 11, 0, 0.7, 124, 0),
('Greek Yogurt', 'Dairy', 59, 10, 3.6, 0.4, 0, 3.6, 36, 11),
('Tofu', 'Proteins', 76, 8, 1.9, 4.8, 0.3, 0.6, 7, 15),
('Black Beans', 'Legumes', 132, 8.9, 24, 0.5, 8.7, 0.3, 2, 30),
('Lentils', 'Legumes', 116, 9, 20, 0.4, 7.9, 1.8, 2, 29),

-- Nuts & Seeds
('Almonds', 'Nuts', 579, 21, 22, 50, 12, 4.4, 1, 0),
('Walnuts', 'Nuts', 654, 15, 14, 65, 6.7, 2.6, 2, 0),
('Chia Seeds', 'Seeds', 486, 17, 42, 31, 34, 0, 16, 0),
('Peanut Butter', 'Nuts', 588, 25, 20, 50, 6, 9.2, 17, 14),

-- Dairy
('Milk (2%)', 'Dairy', 50, 3.3, 4.8, 2.0, 0, 4.8, 44, 39),
('Cheddar Cheese', 'Dairy', 403, 25, 1.3, 33, 0, 0.5, 621, 0),
('Cottage Cheese', 'Dairy', 98, 11, 3.4, 4.3, 0, 2.7, 364, 10),

-- Snacks
('Dark Chocolate (70%)', 'Snacks', 598, 7.9, 46, 43, 11, 24, 20, 23),
('Popcorn', 'Snacks', 387, 12, 78, 4.2, 15, 0.9, 8, 65),

-- Beverages (per 100ml)
('Orange Juice', 'Beverages', 45, 0.7, 10, 0.2, 0.2, 8.1, 1, 50),
('Coffee (black)', 'Beverages', 1, 0.1, 0, 0, 0, 0, 2, 0),
('Green Tea', 'Beverages', 1, 0, 0, 0, 0, 0, 1, 0);

-- Add some branded foods
INSERT INTO foods (name, brand, category, serving_size, serving_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g) VALUES
('Cheerios', 'General Mills', 'Cereals', 28, 'g', 375, 11, 74, 3.8, 10, 1.2, 590),
('Nature Valley Granola Bar', 'Nature Valley', 'Snacks', 42, 'g', 471, 10, 64, 18, 4, 29, 160),
('Clif Bar Chocolate Chip', 'Clif Bar', 'Energy Bars', 68, 'g', 412, 9, 67, 7, 5, 24, 180);

-- Create indexes for better search performance
-- Using standard B-tree indexes for text search to avoid function immutability issues
CREATE INDEX IF NOT EXISTS idx_foods_name_lower ON foods (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_foods_brand_lower ON foods (LOWER(brand));
CREATE INDEX IF NOT EXISTS idx_foods_category_lower ON foods (LOWER(category));