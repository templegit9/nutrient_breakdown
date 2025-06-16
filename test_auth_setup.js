#!/usr/bin/env node

/**
 * Authentication Setup and Testing Script
 * This script tests Supabase authentication and creates test users for comprehensive testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgvchtzuzwitgojrughi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndmNodHp1endpdGdvanJ1Z2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTQ2MDMsImV4cCI6MjA2NTA5MDYwM30.CaCqHqEPRmdWKV5J8r6guFqraIM6z5cJTSe0s7dXR6E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user accounts for comprehensive testing
const testUsers = [
  {
    email: 'test.user1@example.com',
    password: 'TestPassword123!',
    profile: {
      name: 'Test User One',
      age: 30,
      gender: 'female',
      height_cm: 165,
      weight_kg: 65,
      activity_level: 'moderate',
      health_conditions: ['pcos'],
      target_calories: 2000,
      target_protein_g: 100,
      target_carbs_g: 250,
      target_fat_g: 67,
      target_fiber_g: 25
    }
  },
  {
    email: 'test.user2@example.com',
    password: 'TestPassword123!',
    profile: {
      name: 'Test User Two',
      age: 45,
      gender: 'male',
      height_cm: 180,
      weight_kg: 80,
      activity_level: 'active',
      health_conditions: ['diabetes_type_2'],
      target_calories: 2200,
      target_protein_g: 110,
      target_carbs_g: 200,
      target_fat_g: 80,
      target_fiber_g: 30
    }
  }
];

async function testDatabaseConnection() {
  console.log('🔗 Testing database connection...');
  
  try {
    const { data, error } = await supabase.from('foods').select('name').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');
    console.log('📊 Sample food found:', data[0]?.name || 'No foods in database');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
}

async function signUpTestUser(userInfo) {
  console.log(`👤 Creating test user: ${userInfo.email}`);
  
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userInfo.email,
      password: userInfo.password,
      options: {
        emailRedirectTo: 'http://localhost:5176'
      }
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log(`ℹ️  User ${userInfo.email} already exists, signing in...`);
        
        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userInfo.email,
          password: userInfo.password
        });

        if (signInError) {
          console.error(`❌ Sign in failed for ${userInfo.email}:`, signInError.message);
          return false;
        }

        console.log(`✅ Successfully signed in ${userInfo.email}`);
        return signInData.user;
      } else {
        console.error(`❌ Sign up failed for ${userInfo.email}:`, authError.message);
        return false;
      }
    }

    console.log(`✅ Successfully created user ${userInfo.email}`);
    console.log(`📧 User ID: ${authData.user?.id}`);
    
    if (authData.user?.email_confirmed_at) {
      console.log('✅ Email confirmed automatically');
    } else {
      console.log('⏳ Email confirmation may be required');
    }

    return authData.user;
  } catch (err) {
    console.error(`❌ Error creating user ${userInfo.email}:`, err.message);
    return false;
  }
}

async function createUserProfile(user, profileData) {
  console.log(`📝 Creating profile for user ${user.email}...`);
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{
        user_id: user.id,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error(`❌ Profile creation failed for ${user.email}:`, error.message);
      return false;
    }

    console.log(`✅ Profile created successfully for ${user.email}`);
    return data[0];
  } catch (err) {
    console.error(`❌ Error creating profile for ${user.email}:`, err.message);
    return false;
  }
}

async function addSampleFoodEntries(user) {
  console.log(`🍽️ Adding sample food entries for ${user.email}...`);
  
  const sampleEntries = [
    {
      user_id: user.id,
      custom_food_name: 'Test Breakfast',
      serving_amount: 1,
      serving_unit: 'serving',
      calories: 350,
      protein_g: 15,
      carbs_g: 45,
      fat_g: 12,
      fiber_g: 8,
      meal_type: 'breakfast',
      consumed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      user_id: user.id,
      custom_food_name: 'Test Lunch',
      serving_amount: 1,
      serving_unit: 'serving',
      calories: 520,
      protein_g: 25,
      carbs_g: 60,
      fat_g: 18,
      fiber_g: 12,
      meal_type: 'lunch',
      consumed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('food_entries')
      .insert(sampleEntries)
      .select();

    if (error) {
      console.error(`❌ Sample food entries creation failed:`, error.message);
      return false;
    }

    console.log(`✅ Added ${data.length} sample food entries for ${user.email}`);
    return data;
  } catch (err) {
    console.error(`❌ Error adding sample food entries:`, err.message);
    return false;
  }
}

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...');
  
  try {
    // Test sign in with first user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUsers[0].email,
      password: testUsers[0].password
    });

    if (error) {
      console.error('❌ Authentication test failed:', error.message);
      return false;
    }

    console.log('✅ Authentication test successful');
    console.log('👤 Signed in as:', data.user?.email);
    
    // Test getting current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Get user test failed:', userError.message);
      return false;
    }

    console.log('✅ Get user test successful');
    
    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Sign out successful');
    
    return true;
  } catch (err) {
    console.error('❌ Authentication flow error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Authentication Setup and Testing\n');
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  console.log('\n📝 Setting up test users...\n');
  
  // Create test users and profiles
  for (const userInfo of testUsers) {
    const user = await signUpTestUser(userInfo);
    if (user) {
      const profile = await createUserProfile(user, userInfo.profile);
      if (profile) {
        await addSampleFoodEntries(user);
      }
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('🧪 Testing authentication flows...\n');
  
  // Test authentication flow
  const authTestPassed = await testAuthFlow();
  
  console.log('\n📊 Setup Summary:');
  console.log('================');
  console.log(`Database Connection: ${dbConnected ? '✅ Working' : '❌ Failed'}`);
  console.log(`Test Users Created: ${testUsers.length} users`);
  console.log(`Authentication Flow: ${authTestPassed ? '✅ Working' : '❌ Failed'}`);
  
  if (dbConnected && authTestPassed) {
    console.log('\n🎉 Authentication setup completed successfully!');
    console.log('\n📋 Test User Credentials:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Profile: ${user.profile.name} (${user.profile.health_conditions.join(', ')})`);
    });
    
    console.log('\n🔗 You can now test the webapp at: http://localhost:5176');
    console.log('🔑 Use the above credentials to log in and test all functionality');
  } else {
    console.log('\n❌ Setup failed - check the errors above');
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error);