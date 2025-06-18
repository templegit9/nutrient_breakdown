-- Drop and recreate supplements table with comprehensive supplement database
DROP TABLE IF EXISTS supplements CASCADE;

CREATE TABLE supplements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    typical_dosage VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    benefits TEXT[],
    warnings TEXT[],
    interactions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to supplements" ON supplements FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert supplements" ON supplements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update supplements" ON supplements FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete supplements" ON supplements FOR DELETE USING (auth.role() = 'authenticated');

-- Insert comprehensive supplement database
INSERT INTO supplements (name, category, description, typical_dosage, unit, benefits, warnings, interactions) VALUES

-- Essential Vitamins
('Vitamin A (Retinol)', 'Vitamins', 'Fat-soluble vitamin essential for vision, immune function, and cell growth', '900 mcg', 'mcg', 
 ARRAY['Supports vision', 'Immune system health', 'Skin health', 'Cell growth and differentiation'], 
 ARRAY['High doses can be toxic', 'Avoid during pregnancy in high doses'], 
 ARRAY['May increase bleeding risk with anticoagulants']),

('Vitamin B1 (Thiamine)', 'Vitamins', 'Water-soluble vitamin essential for energy metabolism and nervous system function', '1.2 mg', 'mg', 
 ARRAY['Energy metabolism', 'Nervous system function', 'Muscle function', 'Cognitive function'], 
 ARRAY['Generally safe, excess is excreted'], 
 ARRAY['None known']),

('Vitamin B2 (Riboflavin)', 'Vitamins', 'Water-soluble vitamin important for energy production and cellular function', '1.3 mg', 'mg', 
 ARRAY['Energy production', 'Cellular function', 'Antioxidant activity', 'Red blood cell formation'], 
 ARRAY['Generally safe, excess is excreted'], 
 ARRAY['None known']),

('Vitamin B3 (Niacin)', 'Vitamins', 'Water-soluble vitamin essential for energy metabolism and cholesterol regulation', '16 mg', 'mg', 
 ARRAY['Energy metabolism', 'Cholesterol regulation', 'Skin health', 'Nervous system function'], 
 ARRAY['High doses can cause flushing', 'May cause liver damage in very high doses'], 
 ARRAY['May enhance effects of blood pressure medications']),

('Vitamin B5 (Pantothenic Acid)', 'Vitamins', 'Water-soluble vitamin essential for fat and carbohydrate metabolism', '5 mg', 'mg', 
 ARRAY['Fat metabolism', 'Carbohydrate metabolism', 'Hormone production', 'Wound healing'], 
 ARRAY['Generally safe, excess is excreted'], 
 ARRAY['None known']),

('Vitamin B6 (Pyridoxine)', 'Vitamins', 'Water-soluble vitamin important for protein metabolism and neurotransmitter synthesis', '1.7 mg', 'mg', 
 ARRAY['Protein metabolism', 'Neurotransmitter synthesis', 'Immune function', 'Hemoglobin formation'], 
 ARRAY['High doses can cause nerve damage'], 
 ARRAY['May reduce effectiveness of certain medications']),

('Vitamin B7 (Biotin)', 'Vitamins', 'Water-soluble vitamin essential for fat, carbohydrate, and protein metabolism', '30 mcg', 'mcg', 
 ARRAY['Metabolism support', 'Hair health', 'Nail health', 'Skin health'], 
 ARRAY['Generally safe, excess is excreted'], 
 ARRAY['None known']),

('Vitamin B9 (Folate/Folic Acid)', 'Vitamins', 'Water-soluble vitamin essential for DNA synthesis and cell division', '400 mcg', 'mcg', 
 ARRAY['DNA synthesis', 'Cell division', 'Red blood cell formation', 'Neural tube development'], 
 ARRAY['High doses may mask B12 deficiency'], 
 ARRAY['May interact with certain medications']),

('Vitamin B12 (Cobalamin)', 'Vitamins', 'Water-soluble vitamin essential for nervous system function and red blood cell formation', '2.4 mcg', 'mcg', 
 ARRAY['Nervous system function', 'Red blood cell formation', 'DNA synthesis', 'Energy metabolism'], 
 ARRAY['Generally safe, excess is excreted'], 
 ARRAY['May interact with certain medications']),

('Vitamin C (Ascorbic Acid)', 'Vitamins', 'Water-soluble antioxidant vitamin essential for immune function and collagen synthesis', '90 mg', 'mg', 
 ARRAY['Immune function', 'Antioxidant activity', 'Collagen synthesis', 'Iron absorption'], 
 ARRAY['High doses may cause digestive upset'], 
 ARRAY['May enhance iron absorption']),

('Vitamin D3 (Cholecalciferol)', 'Vitamins', 'Fat-soluble vitamin essential for calcium absorption and bone health', '1000 IU', 'IU', 
 ARRAY['Bone health', 'Calcium absorption', 'Immune function', 'Muscle function'], 
 ARRAY['High doses can cause hypercalcemia'], 
 ARRAY['May increase absorption of certain medications']),

('Vitamin E (Tocopherol)', 'Vitamins', 'Fat-soluble antioxidant vitamin that protects cell membranes', '15 mg', 'mg', 
 ARRAY['Antioxidant activity', 'Cell membrane protection', 'Immune function', 'Skin health'], 
 ARRAY['High doses may increase bleeding risk'], 
 ARRAY['May enhance effects of anticoagulants']),

('Vitamin K2 (Menaquinone)', 'Vitamins', 'Fat-soluble vitamin essential for blood clotting and bone metabolism', '120 mcg', 'mcg', 
 ARRAY['Blood clotting', 'Bone metabolism', 'Cardiovascular health', 'Calcium regulation'], 
 ARRAY['May interact with blood thinners'], 
 ARRAY['Contraindicated with warfarin']),

-- Essential Minerals
('Calcium Carbonate', 'Minerals', 'Essential mineral for bone health and muscle function', '1000 mg', 'mg', 
 ARRAY['Bone health', 'Muscle function', 'Nerve transmission', 'Blood clotting'], 
 ARRAY['May cause constipation', 'High doses may interfere with absorption of other minerals'], 
 ARRAY['May reduce absorption of certain medications']),

('Magnesium Glycinate', 'Minerals', 'Essential mineral for muscle function, energy production, and bone health', '400 mg', 'mg', 
 ARRAY['Muscle function', 'Energy production', 'Bone health', 'Nervous system function'], 
 ARRAY['High doses may cause diarrhea'], 
 ARRAY['May enhance effects of certain medications']),

('Iron Bisglycinate', 'Minerals', 'Essential mineral for oxygen transport and energy production', '18 mg', 'mg', 
 ARRAY['Oxygen transport', 'Energy production', 'Immune function', 'Cognitive function'], 
 ARRAY['May cause constipation', 'High doses can be toxic'], 
 ARRAY['May reduce absorption of certain medications']),

('Zinc Picolinate', 'Minerals', 'Essential mineral for immune function, wound healing, and protein synthesis', '11 mg', 'mg', 
 ARRAY['Immune function', 'Wound healing', 'Protein synthesis', 'Taste and smell'], 
 ARRAY['High doses may cause nausea', 'May interfere with copper absorption'], 
 ARRAY['May reduce absorption of certain medications']),

('Selenium Methionine', 'Minerals', 'Essential trace mineral with antioxidant properties', '55 mcg', 'mcg', 
 ARRAY['Antioxidant activity', 'Thyroid function', 'Immune function', 'Reproductive health'], 
 ARRAY['High doses can be toxic'], 
 ARRAY['None known']),

('Chromium Picolinate', 'Minerals', 'Trace mineral that may help with glucose metabolism', '35 mcg', 'mcg', 
 ARRAY['Glucose metabolism', 'Insulin sensitivity', 'Cholesterol regulation'], 
 ARRAY['High doses may cause liver damage'], 
 ARRAY['May enhance effects of diabetes medications']),

('Copper Bisglycinate', 'Minerals', 'Essential trace mineral for connective tissue and iron metabolism', '0.9 mg', 'mg', 
 ARRAY['Connective tissue formation', 'Iron metabolism', 'Antioxidant activity', 'Nervous system function'], 
 ARRAY['High doses can be toxic'], 
 ARRAY['May reduce zinc absorption']),

('Manganese Bisglycinate', 'Minerals', 'Essential trace mineral for bone formation and metabolism', '2.3 mg', 'mg', 
 ARRAY['Bone formation', 'Metabolism', 'Antioxidant activity', 'Wound healing'], 
 ARRAY['High doses may cause neurological problems'], 
 ARRAY['May reduce iron absorption']),

('Iodine (Potassium Iodide)', 'Minerals', 'Essential mineral for thyroid hormone production', '150 mcg', 'mcg', 
 ARRAY['Thyroid function', 'Metabolism regulation', 'Growth and development'], 
 ARRAY['High doses may cause thyroid dysfunction'], 
 ARRAY['May interact with thyroid medications']),

('Potassium Citrate', 'Minerals', 'Essential mineral for fluid balance and muscle function', '99 mg', 'mg', 
 ARRAY['Fluid balance', 'Muscle function', 'Nerve transmission', 'Blood pressure regulation'], 
 ARRAY['High doses may cause hyperkalemia'], 
 ARRAY['May interact with certain medications']),

-- Omega Fatty Acids
('Omega-3 EPA/DHA', 'Fatty Acids', 'Essential fatty acids for heart and brain health', '1000 mg', 'mg', 
 ARRAY['Heart health', 'Brain function', 'Anti-inflammatory effects', 'Eye health'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May enhance effects of anticoagulants']),

('Omega-6 GLA', 'Fatty Acids', 'Essential fatty acid for skin health and inflammation', '240 mg', 'mg', 
 ARRAY['Skin health', 'Inflammation regulation', 'Hormone balance'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May enhance effects of anticoagulants']),

('Omega-7 (Palmitoleic Acid)', 'Fatty Acids', 'Fatty acid for metabolic health and skin support', '210 mg', 'mg', 
 ARRAY['Metabolic health', 'Skin support', 'Cardiovascular health'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Amino Acids
('L-Arginine', 'Amino Acids', 'Semi-essential amino acid for nitric oxide production and circulation', '3000 mg', 'mg', 
 ARRAY['Circulation support', 'Nitric oxide production', 'Wound healing', 'Immune function'], 
 ARRAY['May lower blood pressure'], 
 ARRAY['May interact with blood pressure medications']),

('L-Carnitine', 'Amino Acids', 'Amino acid derivative for fat metabolism and energy production', '2000 mg', 'mg', 
 ARRAY['Fat metabolism', 'Energy production', 'Exercise performance', 'Heart health'], 
 ARRAY['May cause nausea in high doses'], 
 ARRAY['May interact with thyroid medications']),

('L-Glutamine', 'Amino Acids', 'Conditionally essential amino acid for gut health and immune function', '5000 mg', 'mg', 
 ARRAY['Gut health', 'Immune function', 'Muscle recovery', 'Wound healing'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

('L-Lysine', 'Amino Acids', 'Essential amino acid for protein synthesis and immune function', '1000 mg', 'mg', 
 ARRAY['Protein synthesis', 'Immune function', 'Collagen formation', 'Calcium absorption'], 
 ARRAY['High doses may cause stomach upset'], 
 ARRAY['None known']),

('L-Theanine', 'Amino Acids', 'Amino acid for relaxation and stress reduction', '200 mg', 'mg', 
 ARRAY['Relaxation', 'Stress reduction', 'Focus enhancement', 'Sleep quality'], 
 ARRAY['Generally safe'], 
 ARRAY['May enhance effects of sedatives']),

('L-Tryptophan', 'Amino Acids', 'Essential amino acid for serotonin production and sleep', '500 mg', 'mg', 
 ARRAY['Serotonin production', 'Sleep quality', 'Mood support', 'Appetite regulation'], 
 ARRAY['May cause drowsiness'], 
 ARRAY['May interact with antidepressants']),

('L-Tyrosine', 'Amino Acids', 'Non-essential amino acid for neurotransmitter production', '500 mg', 'mg', 
 ARRAY['Neurotransmitter production', 'Stress response', 'Cognitive function', 'Thyroid support'], 
 ARRAY['May increase blood pressure'], 
 ARRAY['May interact with thyroid medications']),

('Taurine', 'Amino Acids', 'Conditionally essential amino acid for heart and eye health', '1000 mg', 'mg', 
 ARRAY['Heart health', 'Eye health', 'Antioxidant activity', 'Electrolyte balance'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Probiotics
('Lactobacillus Acidophilus', 'Probiotics', 'Beneficial bacteria for digestive and immune health', '10 billion CFU', 'CFU', 
 ARRAY['Digestive health', 'Immune function', 'Nutrient absorption', 'Gut microbiome balance'], 
 ARRAY['May cause initial digestive upset'], 
 ARRAY['May interact with antibiotics']),

('Bifidobacterium Longum', 'Probiotics', 'Beneficial bacteria for gut health and immune function', '10 billion CFU', 'CFU', 
 ARRAY['Gut health', 'Immune function', 'Inflammation reduction', 'Mood support'], 
 ARRAY['May cause initial digestive upset'], 
 ARRAY['May interact with antibiotics']),

('Saccharomyces Boulardii', 'Probiotics', 'Beneficial yeast for digestive health and antibiotic-associated diarrhea prevention', '5 billion CFU', 'CFU', 
 ARRAY['Digestive health', 'Antibiotic-associated diarrhea prevention', 'Immune function'], 
 ARRAY['Generally safe'], 
 ARRAY['May interact with antifungal medications']),

-- Herbal Supplements
('Turmeric (Curcumin)', 'Herbal', 'Anti-inflammatory herb with antioxidant properties', '500 mg', 'mg', 
 ARRAY['Anti-inflammatory effects', 'Antioxidant activity', 'Joint health', 'Cognitive function'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May enhance effects of anticoagulants']),

('Ginkgo Biloba', 'Herbal', 'Herb for cognitive function and circulation support', '120 mg', 'mg', 
 ARRAY['Cognitive function', 'Circulation support', 'Memory enhancement', 'Antioxidant activity'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May interact with anticoagulants']),

('Ginseng (Panax)', 'Herbal', 'Adaptogenic herb for energy and stress management', '200 mg', 'mg', 
 ARRAY['Energy support', 'Stress management', 'Immune function', 'Cognitive function'], 
 ARRAY['May cause insomnia', 'May affect blood sugar'], 
 ARRAY['May interact with diabetes medications']),

('Echinacea', 'Herbal', 'Herb for immune system support', '400 mg', 'mg', 
 ARRAY['Immune system support', 'Cold and flu prevention', 'Anti-inflammatory effects'], 
 ARRAY['May cause allergic reactions'], 
 ARRAY['May interact with immunosuppressants']),

('Garlic Extract', 'Herbal', 'Herb for cardiovascular health and immune support', '600 mg', 'mg', 
 ARRAY['Cardiovascular health', 'Immune support', 'Cholesterol regulation', 'Antioxidant activity'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May interact with anticoagulants']),

('Green Tea Extract', 'Herbal', 'Antioxidant-rich extract for metabolism and weight management', '300 mg', 'mg', 
 ARRAY['Antioxidant activity', 'Metabolism support', 'Weight management', 'Cardiovascular health'], 
 ARRAY['May cause insomnia due to caffeine'], 
 ARRAY['May interact with stimulants']),

('Milk Thistle', 'Herbal', 'Herb for liver health and detoxification support', '200 mg', 'mg', 
 ARRAY['Liver health', 'Detoxification support', 'Antioxidant activity'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with certain medications']),

('Saw Palmetto', 'Herbal', 'Herb for prostate health and hormonal balance', '160 mg', 'mg', 
 ARRAY['Prostate health', 'Hormonal balance', 'Hair health'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with hormone medications']),

('Valerian Root', 'Herbal', 'Herb for sleep support and relaxation', '300 mg', 'mg', 
 ARRAY['Sleep support', 'Relaxation', 'Stress reduction', 'Anxiety relief'], 
 ARRAY['May cause drowsiness'], 
 ARRAY['May enhance effects of sedatives']),

('Ashwagandha', 'Herbal', 'Adaptogenic herb for stress management and energy', '300 mg', 'mg', 
 ARRAY['Stress management', 'Energy support', 'Immune function', 'Sleep quality'], 
 ARRAY['May cause drowsiness'], 
 ARRAY['May interact with immunosuppressants']),

('Rhodiola Rosea', 'Herbal', 'Adaptogenic herb for stress resilience and mental performance', '200 mg', 'mg', 
 ARRAY['Stress resilience', 'Mental performance', 'Fatigue reduction', 'Mood support'], 
 ARRAY['May cause insomnia'], 
 ARRAY['May interact with antidepressants']),

('Holy Basil (Tulsi)', 'Herbal', 'Adaptogenic herb for stress management and respiratory health', '300 mg', 'mg', 
 ARRAY['Stress management', 'Respiratory health', 'Immune support', 'Blood sugar regulation'], 
 ARRAY['May lower blood sugar'], 
 ARRAY['May interact with diabetes medications']),

-- Specialized Supplements
('Coenzyme Q10 (CoQ10)', 'Antioxidants', 'Antioxidant compound for heart health and cellular energy', '100 mg', 'mg', 
 ARRAY['Heart health', 'Cellular energy', 'Antioxidant activity', 'Exercise performance'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with blood thinners']),

('Alpha Lipoic Acid', 'Antioxidants', 'Antioxidant compound for blood sugar regulation and nerve health', '300 mg', 'mg', 
 ARRAY['Blood sugar regulation', 'Nerve health', 'Antioxidant activity', 'Liver health'], 
 ARRAY['May lower blood sugar'], 
 ARRAY['May interact with diabetes medications']),

('Resveratrol', 'Antioxidants', 'Antioxidant compound for cardiovascular health and longevity', '100 mg', 'mg', 
 ARRAY['Cardiovascular health', 'Antioxidant activity', 'Anti-aging effects', 'Brain health'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May interact with anticoagulants']),

('Quercetin', 'Antioxidants', 'Flavonoid antioxidant for immune support and inflammation reduction', '500 mg', 'mg', 
 ARRAY['Immune support', 'Anti-inflammatory effects', 'Antioxidant activity', 'Allergy relief'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with certain medications']),

('N-Acetyl Cysteine (NAC)', 'Antioxidants', 'Antioxidant compound for respiratory health and liver support', '600 mg', 'mg', 
 ARRAY['Respiratory health', 'Liver support', 'Antioxidant activity', 'Mucus reduction'], 
 ARRAY['May cause nausea'], 
 ARRAY['May interact with nitroglycerin']),

('Grape Seed Extract', 'Antioxidants', 'Antioxidant extract for cardiovascular health and circulation', '100 mg', 'mg', 
 ARRAY['Cardiovascular health', 'Circulation support', 'Antioxidant activity', 'Skin health'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May interact with anticoagulants']),

('Lutein', 'Antioxidants', 'Carotenoid antioxidant for eye health and macular protection', '10 mg', 'mg', 
 ARRAY['Eye health', 'Macular protection', 'Antioxidant activity', 'Blue light protection'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

('Zeaxanthin', 'Antioxidants', 'Carotenoid antioxidant for eye health and macular protection', '2 mg', 'mg', 
 ARRAY['Eye health', 'Macular protection', 'Antioxidant activity'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

('Lycopene', 'Antioxidants', 'Carotenoid antioxidant for prostate health and cardiovascular support', '10 mg', 'mg', 
 ARRAY['Prostate health', 'Cardiovascular support', 'Antioxidant activity', 'Skin health'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Digestive Support
('Digestive Enzymes', 'Digestive', 'Enzyme blend for digestive support and nutrient absorption', '1 capsule', 'capsule', 
 ARRAY['Digestive support', 'Nutrient absorption', 'Bloating reduction', 'Gas relief'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with certain medications']),

('Betaine HCl', 'Digestive', 'Stomach acid support for protein digestion', '650 mg', 'mg', 
 ARRAY['Protein digestion', 'Stomach acid support', 'Nutrient absorption'], 
 ARRAY['May cause stomach irritation'], 
 ARRAY['Contraindicated with peptic ulcers']),

('Apple Cider Vinegar', 'Digestive', 'Fermented vinegar for digestive health and blood sugar support', '500 mg', 'mg', 
 ARRAY['Digestive health', 'Blood sugar support', 'Weight management'], 
 ARRAY['May erode tooth enamel'], 
 ARRAY['May interact with diabetes medications']),

('Psyllium Husk', 'Digestive', 'Soluble fiber for digestive regularity and cholesterol support', '5 g', 'g', 
 ARRAY['Digestive regularity', 'Cholesterol support', 'Blood sugar regulation', 'Weight management'], 
 ARRAY['May cause choking if not taken with enough water'], 
 ARRAY['May reduce absorption of certain medications']),

-- Sports and Performance
('Creatine Monohydrate', 'Sports', 'Compound for muscle strength and power enhancement', '5 g', 'g', 
 ARRAY['Muscle strength', 'Power enhancement', 'Exercise performance', 'Muscle recovery'], 
 ARRAY['May cause water retention'], 
 ARRAY['None known']),

('Whey Protein', 'Sports', 'Complete protein for muscle building and recovery', '25 g', 'g', 
 ARRAY['Muscle building', 'Recovery support', 'Protein synthesis', 'Weight management'], 
 ARRAY['May cause digestive upset in lactose intolerant individuals'], 
 ARRAY['None known']),

('Casein Protein', 'Sports', 'Slow-digesting protein for sustained amino acid release', '25 g', 'g', 
 ARRAY['Sustained protein release', 'Muscle recovery', 'Satiety', 'Nighttime recovery'], 
 ARRAY['May cause digestive upset in lactose intolerant individuals'], 
 ARRAY['None known']),

('Beta-Alanine', 'Sports', 'Amino acid for muscular endurance and fatigue reduction', '3 g', 'g', 
 ARRAY['Muscular endurance', 'Fatigue reduction', 'Exercise performance'], 
 ARRAY['May cause tingling sensation'], 
 ARRAY['None known']),

('Citrulline Malate', 'Sports', 'Amino acid compound for pump and endurance enhancement', '6 g', 'g', 
 ARRAY['Pump enhancement', 'Endurance', 'Blood flow', 'Exercise performance'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Women's Health
('Evening Primrose Oil', 'Women''s Health', 'Oil rich in GLA for hormonal balance and skin health', '1000 mg', 'mg', 
 ARRAY['Hormonal balance', 'Skin health', 'PMS relief', 'Menopause support'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May interact with anticoagulants']),

('Chasteberry (Vitex)', 'Women''s Health', 'Herb for hormonal balance and PMS relief', '400 mg', 'mg', 
 ARRAY['Hormonal balance', 'PMS relief', 'Menstrual regularity', 'Fertility support'], 
 ARRAY['May interact with hormonal medications'], 
 ARRAY['May reduce effectiveness of birth control']),

('Red Clover', 'Women''s Health', 'Herb for menopause support and hormonal balance', '40 mg', 'mg', 
 ARRAY['Menopause support', 'Hormonal balance', 'Bone health', 'Cardiovascular health'], 
 ARRAY['May interact with estrogen medications'], 
 ARRAY['May interact with blood thinners']),

('Black Cohosh', 'Women''s Health', 'Herb for menopause symptom relief', '20 mg', 'mg', 
 ARRAY['Menopause symptom relief', 'Hot flash reduction', 'Mood support'], 
 ARRAY['May cause liver problems in rare cases'], 
 ARRAY['May interact with estrogen medications']),

-- Men's Health
('Tribulus Terrestris', 'Men''s Health', 'Herb for testosterone support and libido enhancement', '625 mg', 'mg', 
 ARRAY['Testosterone support', 'Libido enhancement', 'Athletic performance', 'Muscle building'], 
 ARRAY['May cause stomach upset'], 
 ARRAY['May interact with diabetes medications']),

('Fenugreek', 'Men''s Health', 'Herb for testosterone support and blood sugar regulation', '500 mg', 'mg', 
 ARRAY['Testosterone support', 'Blood sugar regulation', 'Libido enhancement', 'Digestive health'], 
 ARRAY['May lower blood sugar'], 
 ARRAY['May interact with diabetes medications']),

('D-Aspartic Acid', 'Men''s Health', 'Amino acid for testosterone support and fertility', '3 g', 'g', 
 ARRAY['Testosterone support', 'Fertility enhancement', 'Muscle building'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Sleep and Stress
('Melatonin', 'Sleep', 'Hormone for sleep regulation and circadian rhythm support', '3 mg', 'mg', 
 ARRAY['Sleep regulation', 'Circadian rhythm support', 'Jet lag relief', 'Antioxidant activity'], 
 ARRAY['May cause drowsiness', 'May affect hormone levels'], 
 ARRAY['May interact with blood thinners']),

('GABA', 'Sleep', 'Neurotransmitter for relaxation and sleep support', '500 mg', 'mg', 
 ARRAY['Relaxation', 'Sleep support', 'Stress reduction', 'Anxiety relief'], 
 ARRAY['May cause drowsiness'], 
 ARRAY['May enhance effects of sedatives']),

('5-HTP', 'Sleep', 'Serotonin precursor for mood and sleep support', '100 mg', 'mg', 
 ARRAY['Mood support', 'Sleep quality', 'Serotonin production', 'Appetite regulation'], 
 ARRAY['May cause nausea'], 
 ARRAY['May interact with antidepressants']),

('Magnesium Glycinate (Sleep)', 'Sleep', 'Highly absorbable magnesium for muscle relaxation and sleep', '200 mg', 'mg', 
 ARRAY['Muscle relaxation', 'Sleep quality', 'Stress reduction', 'Nervous system calm'], 
 ARRAY['May cause diarrhea in high doses'], 
 ARRAY['May enhance effects of muscle relaxants']),

-- Cognitive Enhancement
('Bacopa Monnieri', 'Cognitive', 'Herb for memory enhancement and cognitive function', '300 mg', 'mg', 
 ARRAY['Memory enhancement', 'Cognitive function', 'Stress reduction', 'Neuroprotection'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with thyroid medications']),

('Lion''s Mane Mushroom', 'Cognitive', 'Mushroom extract for cognitive function and nerve health', '500 mg', 'mg', 
 ARRAY['Cognitive function', 'Nerve health', 'Neuroprotection', 'Memory support'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

('Phosphatidylserine', 'Cognitive', 'Phospholipid for brain health and cognitive function', '100 mg', 'mg', 
 ARRAY['Brain health', 'Cognitive function', 'Memory support', 'Stress reduction'], 
 ARRAY['Generally safe'], 
 ARRAY['May interact with blood thinners']),

('Acetyl-L-Carnitine', 'Cognitive', 'Amino acid for brain energy and cognitive function', '500 mg', 'mg', 
 ARRAY['Brain energy', 'Cognitive function', 'Memory support', 'Neuroprotection'], 
 ARRAY['May cause insomnia'], 
 ARRAY['May interact with thyroid medications']),

-- Joint and Bone Health
('Glucosamine Sulfate', 'Joint Health', 'Compound for joint health and cartilage support', '1500 mg', 'mg', 
 ARRAY['Joint health', 'Cartilage support', 'Mobility enhancement', 'Joint comfort'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with blood thinners']),

('Chondroitin Sulfate', 'Joint Health', 'Compound for joint health and cartilage maintenance', '1200 mg', 'mg', 
 ARRAY['Joint health', 'Cartilage maintenance', 'Joint comfort', 'Mobility support'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with blood thinners']),

('MSM (Methylsulfonylmethane)', 'Joint Health', 'Sulfur compound for joint health and inflammation reduction', '1000 mg', 'mg', 
 ARRAY['Joint health', 'Inflammation reduction', 'Skin health', 'Hair health'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['None known']),

('Hyaluronic Acid', 'Joint Health', 'Compound for joint lubrication and skin hydration', '100 mg', 'mg', 
 ARRAY['Joint lubrication', 'Skin hydration', 'Eye health', 'Wound healing'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Heart Health
('Hawthorn Berry', 'Heart Health', 'Berry extract for cardiovascular health and blood pressure support', '300 mg', 'mg', 
 ARRAY['Cardiovascular health', 'Blood pressure support', 'Heart function', 'Circulation'], 
 ARRAY['May interact with heart medications'], 
 ARRAY['May enhance effects of heart medications']),

('Red Yeast Rice', 'Heart Health', 'Fermented rice for cholesterol management', '600 mg', 'mg', 
 ARRAY['Cholesterol management', 'Cardiovascular health', 'Heart protection'], 
 ARRAY['May cause muscle pain'], 
 ARRAY['May interact with statin medications']),

('Policosanol', 'Heart Health', 'Sugar cane extract for cholesterol support', '10 mg', 'mg', 
 ARRAY['Cholesterol support', 'Cardiovascular health', 'Platelet function'], 
 ARRAY['May increase bleeding risk'], 
 ARRAY['May interact with anticoagulants']),

-- Immune Support
('Elderberry', 'Immune', 'Berry extract for immune system support and antioxidant activity', '300 mg', 'mg', 
 ARRAY['Immune system support', 'Antioxidant activity', 'Cold and flu support', 'Respiratory health'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

('Astragalus', 'Immune', 'Herb for immune system support and energy enhancement', '500 mg', 'mg', 
 ARRAY['Immune system support', 'Energy enhancement', 'Stress adaptation', 'Longevity'], 
 ARRAY['May interact with immunosuppressants'], 
 ARRAY['May interact with immunosuppressive medications']),

('Reishi Mushroom', 'Immune', 'Mushroom extract for immune support and stress management', '400 mg', 'mg', 
 ARRAY['Immune support', 'Stress management', 'Sleep quality', 'Liver health'], 
 ARRAY['May cause dizziness'], 
 ARRAY['May interact with anticoagulants']),

('Shiitake Mushroom', 'Immune', 'Mushroom extract for immune function and cardiovascular health', '300 mg', 'mg', 
 ARRAY['Immune function', 'Cardiovascular health', 'Cholesterol support', 'Antioxidant activity'], 
 ARRAY['Generally safe'], 
 ARRAY['None known']),

-- Detox and Cleansing
('Chlorella', 'Detox', 'Green algae for detoxification and nutrient density', '1000 mg', 'mg', 
 ARRAY['Detoxification', 'Nutrient density', 'Heavy metal binding', 'Immune support'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with blood thinners']),

('Spirulina', 'Detox', 'Blue-green algae for detoxification and protein content', '1000 mg', 'mg', 
 ARRAY['Detoxification', 'Protein content', 'Antioxidant activity', 'Energy support'], 
 ARRAY['May cause digestive upset'], 
 ARRAY['May interact with immunosuppressants']),

('Dandelion Root', 'Detox', 'Herb for liver support and detoxification', '500 mg', 'mg', 
 ARRAY['Liver support', 'Detoxification', 'Digestive health', 'Diuretic effects'], 
 ARRAY['May cause allergic reactions'], 
 ARRAY['May interact with diuretic medications']),

('Burdock Root', 'Detox', 'Herb for blood purification and skin health', '400 mg', 'mg', 
 ARRAY['Blood purification', 'Skin health', 'Liver support', 'Anti-inflammatory effects'], 
 ARRAY['May cause allergic reactions'], 
 ARRAY['May interact with diabetes medications']);

-- Create indexes for better performance
CREATE INDEX idx_supplements_category ON supplements(category);
CREATE INDEX idx_supplements_name ON supplements(name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON supplements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON supplements TO authenticated;
GRANT ALL ON supplements TO anon;