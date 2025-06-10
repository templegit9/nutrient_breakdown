-- Complete foods database seeding with international and Nigerian foods
-- Run this after setting up the database schema

-- International/Common Foods
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

-- Nigerian Foods
INSERT INTO foods (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, glycemic_index) VALUES

-- GRAINS AND CEREALS
('Rice (Brown Nigerian)', 'Grains', 370, 7.9, 77.2, 2.9, 3.5, 1.2, 5, 50),
('Pearl Millet (Dawa)', 'Grains', 378, 11.0, 73.0, 4.2, 8.5, 1.7, 5, 55),
('Sorghum (Dawa)', 'Grains', 329, 10.6, 72.1, 3.5, 6.7, 1.5, 4, 52),
('Maize (Agbado)', 'Grains', 365, 9.4, 74.3, 4.7, 7.3, 2.1, 35, 48),
('Ofada Rice', 'Grains', 380, 8.2, 78.5, 3.1, 4.2, 1.0, 3, 45),

-- STARCHES AND ROOT CROPS
('Yam (Ji)', 'Starches', 118, 1.5, 27.9, 0.2, 4.1, 0.5, 9, 54),
('Cassava (Akpu)', 'Starches', 160, 1.4, 38.1, 0.3, 1.8, 1.7, 14, 46),
('Sweet Potato (Anama)', 'Starches', 86, 1.6, 20.1, 0.1, 3.0, 4.2, 6, 44),
('Plantain (Ogede)', 'Starches', 122, 1.3, 31.9, 0.4, 2.3, 12.2, 4, 39),
('Cocoyam (Ede)', 'Starches', 112, 1.5, 26.5, 0.2, 4.1, 0.9, 11, 48),
('Irish Potato (Anara)', 'Starches', 77, 2.0, 17.5, 0.1, 2.2, 0.8, 6, 56),

-- LEGUMES
('Cowpeas (Wake)', 'Legumes', 336, 23.5, 60.0, 1.3, 10.6, 3.2, 6, 33),
('Black-eyed Peas (Ewa)', 'Legumes', 336, 23.5, 60.0, 1.3, 10.6, 3.2, 6, 33),
('Soybeans', 'Legumes', 446, 36.5, 30.2, 19.9, 9.3, 7.3, 2, 25),
('Groundnuts (Epa)', 'Legumes', 567, 25.8, 16.1, 49.2, 8.5, 4.7, 18, 14),
('Bambara Nuts (Okpa)', 'Legumes', 367, 19.0, 57.9, 6.5, 15.0, 3.8, 8, 30),
('Lima Beans', 'Legumes', 338, 21.5, 63.4, 0.7, 19.0, 2.9, 2, 32),

-- VEGETABLES AND LEAFY GREENS
('Fluted Pumpkin (Ugu)', 'Vegetables', 35, 4.8, 5.8, 0.8, 3.0, 1.2, 15, 10),
('Waterleaf (Gbure)', 'Vegetables', 28, 2.8, 4.0, 0.5, 1.2, 0.8, 20, 10),
('Bitter Leaf (Onugbu)', 'Vegetables', 33, 3.1, 6.3, 0.6, 2.1, 1.0, 25, 10),
('Scent Leaf (Nchanwu)', 'Vegetables', 43, 4.5, 8.2, 1.1, 2.1, 1.5, 30, 10),
('Spinach (Nigerian)', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 15),
('Okra (Okwuru)', 'Vegetables', 33, 1.9, 7.5, 0.2, 3.2, 1.5, 7, 20),
('Pumpkin Leaves', 'Vegetables', 19, 3.0, 2.9, 0.3, 2.1, 0.5, 6, 10),
('Amaranth (Tete)', 'Vegetables', 23, 2.5, 4.0, 0.3, 2.3, 0.8, 20, 15),

-- FRUITS
('African Star Apple (Agbalumo)', 'Fruits', 67, 1.0, 15.2, 0.3, 3.2, 11.8, 2, 35),
('Baobab Fruit (Kuka)', 'Fruits', 162, 2.9, 76.8, 0.4, 8.0, 38.4, 5, 30),
('African Pear (Ube)', 'Fruits', 165, 7.0, 7.6, 11.0, 5.8, 3.2, 8, 25),
('Tiger Nut (Aya)', 'Fruits', 425, 4.5, 64.0, 27.0, 10.0, 32.0, 5, 35),
('Palm Fruit (Banga)', 'Fruits', 55, 1.5, 8.0, 2.0, 2.5, 4.5, 3, 25),
('African Breadfruit (Ukwa)', 'Fruits', 191, 7.4, 37.4, 2.3, 5.2, 2.8, 6, 40),
('Bush Mango (Ogbono)', 'Fruits', 697, 8.9, 15.7, 68.2, 13.6, 3.2, 10, 15),
('Monkey Kola', 'Fruits', 394, 3.2, 81.8, 3.8, 8.5, 15.2, 12, 45),

-- FISH AND SEAFOOD
('Tilapia', 'Proteins', 128, 26.2, 0, 2.6, 0, 0, 52, 0),
('Catfish (Azu Asa)', 'Proteins', 105, 18.5, 0, 2.9, 0, 0, 43, 0),
('Mackerel (Titus)', 'Proteins', 262, 23.9, 0, 17.8, 0, 0, 59, 0),
('Sardines (Shawa)', 'Proteins', 208, 25.0, 0, 11.5, 0, 0, 307, 0),
('Dried Fish (General)', 'Proteins', 374, 62.8, 0, 12.4, 0, 0, 6500, 0),
('Stockfish (Okporoko)', 'Proteins', 290, 68.5, 0, 2.4, 0, 0, 8200, 0),
('Crayfish (Oporo)', 'Proteins', 325, 46.8, 2.4, 13.2, 0, 0, 1200, 0),

-- MEAT AND POULTRY
('Goat Meat (Ewa)', 'Proteins', 122, 22.6, 0, 2.6, 0, 0, 82, 0),
('Beef (Eran Malu)', 'Proteins', 250, 26.0, 0, 15.0, 0, 0, 66, 0),
('Chicken (Adiye)', 'Proteins', 165, 31.0, 0, 3.6, 0, 0, 74, 0),
('Turkey', 'Proteins', 135, 30.1, 0, 1.2, 0, 0, 70, 0),
('Guinea Fowl', 'Proteins', 110, 23.4, 0, 2.5, 0, 0, 68, 0),
('Bush Meat (Venison)', 'Proteins', 120, 22.5, 0, 2.4, 0, 0, 65, 0),

-- NUTS AND SEEDS
('Melon Seeds (Egusi)', 'Nuts', 557, 28.3, 20.6, 47.4, 18.4, 2.8, 12, 10),
('Locust Beans (Iru)', 'Nuts', 429, 28.1, 38.0, 29.5, 15.2, 4.5, 25, 18),
('African Walnut (Ukpa)', 'Nuts', 618, 16.7, 11.2, 59.3, 6.8, 2.4, 8, 10),
('Oil Bean (Ugba)', 'Nuts', 407, 21.3, 50.4, 10.2, 8.9, 3.2, 18, 25),
('Sesame Seeds (Ridi)', 'Nuts', 573, 17.7, 23.5, 49.7, 11.8, 0.3, 11, 15),

-- SPICES AND CONDIMENTS
('Ginger (Chita)', 'Spices', 80, 1.8, 18.0, 0.8, 2.0, 1.7, 13, 15),
('Garlic (Ayo)', 'Spices', 149, 6.4, 33.1, 0.5, 2.1, 1.0, 17, 10),
('Turmeric (Gangamau)', 'Spices', 354, 7.8, 65.0, 9.9, 21.1, 3.2, 38, 10),
('Pepper (Ose)', 'Spices', 40, 2.0, 8.8, 0.2, 1.5, 5.1, 7, 10),
('Curry Leaves', 'Spices', 108, 6.1, 18.7, 1.0, 6.4, 0.0, 57, 10),

-- BEVERAGES AND DRINKS
('Palm Wine', 'Beverages', 43, 0.2, 10.4, 0, 0, 10.4, 4, 35),
('Kunu (Millet Drink)', 'Beverages', 72, 1.8, 16.2, 0.4, 1.2, 14.8, 8, 45),
('Zobo (Hibiscus Drink)', 'Beverages', 15, 0.3, 3.8, 0.1, 0.8, 3.2, 3, 25),
('Tiger Nut Milk', 'Beverages', 85, 1.2, 18.5, 2.1, 2.8, 16.2, 6, 30),

-- FERMENTED FOODS
('Garri (White)', 'Grains', 357, 1.2, 84.2, 0.5, 1.9, 1.5, 18, 56),
('Garri (Yellow)', 'Grains', 360, 1.0, 85.0, 0.6, 2.1, 1.8, 20, 54),
('Akamu (Pap)', 'Grains', 61, 1.5, 13.8, 0.2, 0.8, 0.5, 25, 65),
('Fufu (Cassava)', 'Starches', 267, 0.3, 67.0, 0.1, 0.9, 2.4, 6, 67),
('Ogi (Fermented Maize)', 'Grains', 62, 1.7, 13.2, 0.3, 1.1, 0.8, 30, 55);

-- Success message
SELECT 'Foods database populated with international and Nigerian foods!' as status;