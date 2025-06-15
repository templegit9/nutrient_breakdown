/**
 * Test script for Google Gemini API integration
 * Run with: node test_gemini_integration.js
 */

async function testGeminiAPI() {
  const API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with actual key
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  
  if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('❌ Please replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key');
    return;
  }

  const testPrompt = `You are a precise nutrition calculator. Always respond with valid JSON only.

INPUT: "I ate 2 slices of bread and 1 banana"

TASK: Break down into individual food items with complete nutrition data per item.

REQUIRED JSON FORMAT:
{
  "combinedName": "Short descriptive name for the meal",
  "individualItems": [
    {
      "name": "food_name",
      "quantity": number,
      "unit": "unit",
      "calories": number,
      "protein": number,
      "carbohydrates": number, 
      "fat": number,
      "fiber": number,
      "sugar": number,
      "sodium": number,
      "calcium": number,
      "iron": number,
      "vitamin_c": number,
      "vitamin_d": number,
      "potassium": number
    }
  ]
}

RESPOND WITH JSON ONLY:`;

  try {
    console.log('🧪 Testing Gemini API integration...');
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: testPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 10
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API Error:', response.status, response.statusText);
      console.log('Error details:', errorData);
      return;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('✅ Gemini API Response:');
      console.log(responseText);
      
      // Try to parse JSON
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('\n✅ Successfully parsed JSON:');
          console.log(JSON.stringify(parsed, null, 2));
          
          if (parsed.individualItems && Array.isArray(parsed.individualItems)) {
            console.log(`\n✅ Found ${parsed.individualItems.length} food items`);
            parsed.individualItems.forEach((item, index) => {
              console.log(`${index + 1}. ${item.name}: ${item.calories} calories`);
            });
          }
        } else {
          console.log('❌ No valid JSON found in response');
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON:', parseError.message);
      }
    } else {
      console.log('❌ Unexpected response format');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testGeminiAPI();