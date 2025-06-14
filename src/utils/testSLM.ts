import { slmTrainer } from './slmTrainer';
import { parseSmartFood } from './smartFoodParser';

export async function testSLMIntegration() {
  console.log('=== Testing SLM Integration ===');
  
  // Wait for training data to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Training data size: ${slmTrainer.getTrainingDataSize()}`);
  
  const testInputs = [
    "I had jollof rice with chicken and plantain",
    "I ate bread and eggs for breakfast", 
    "I had a Big Mac with fries and Coke",
    "I ate beans and fried fish",
    "I had spaghetti carbonara with Caesar salad"
  ];

  for (const input of testInputs) {
    console.log(`\n--- Testing: "${input}" ---`);
    
    // Test SLM directly
    try {
      const slmResult = await slmTrainer.predict(input);
      console.log('SLM Result:', slmResult);
    } catch (error) {
      console.error('SLM Error:', error);
    }
    
    // Test integrated smart parser
    try {
      const smartResult = await parseSmartFood(input);
      console.log('Smart Parser Result:', smartResult);
      console.log('Processing method:', smartResult.processingMethod);
    } catch (error) {
      console.error('Smart Parser Error:', error);
    }
  }
  
  // Test a few training examples
  console.log('\n=== Sample Training Examples ===');
  for (let i = 0; i < Math.min(3, slmTrainer.getTrainingDataSize()); i++) {
    const example = slmTrainer.getTrainingExample(i);
    if (example) {
      console.log(`Example ${i + 1}:`);
      console.log('Input:', example.input);
      console.log('Components:', example.output.components);
    }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testSLM = testSLMIntegration;
}