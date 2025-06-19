# medGemma/Medical LLM Migration Plan

## Current State Analysis
- **Model**: Gemini 1.5 Flash Latest
- **API**: Google Generative AI REST API
- **Use Case**: Natural language food → structured nutrition JSON
- **Performance**: Working well for general nutrition tasks

## Migration Options

### Option 1: Vertex AI medLM (If Available)
**Implementation Steps:**
1. Set up Google Cloud Project with Vertex AI API enabled
2. Update environment variables and authentication
3. Modify `llmFoodBrain.ts` to use Vertex AI SDK
4. Update prompts for medical context
5. Test medical nutrition accuracy

**Code Changes Required:**
```typescript
// New dependencies
npm install @google-cloud/vertexai

// Environment variables
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

// Service modification
class MedicalLLMFoodBrain {
  private vertexAI: VertexAI;
  
  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1'
    });
  }
  
  async processFoodInput(input: string): Promise<LLMResponse> {
    const model = this.vertexAI.getGenerativeModel({
      model: 'medlm-medium'
    });
    
    // Enhanced medical nutrition prompt
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: this.createMedicalPrompt(input) }] }]
    });
    
    return this.parseMedicalResponse(result.response);
  }
}
```

**Pros:**
- Medical domain expertise
- Better accuracy for health conditions
- HIPAA compliance
- Clinical nutrition knowledge

**Cons:**
- Higher cost ($$ vs $)
- Complex setup
- Requires Google Cloud account
- May be overkill for general nutrition

---

### Option 2: Enhanced Gemini 1.5 (Recommended)
**Implementation Steps:**
1. Update prompts with medical context
2. Add health condition-specific instructions
3. Include medical nutrition guidelines
4. Test accuracy improvements

**Code Changes Required:**
```typescript
// Update existing llmFoodBrain.ts
private createMedicalNutritionPrompt(input: string, healthConditions?: string[]): string {
  const medicalContext = healthConditions ? 
    `PATIENT HEALTH CONDITIONS: ${healthConditions.join(', ')}
     MEDICAL CONSIDERATIONS:
     - PCOS: Focus on anti-inflammatory foods, low glycemic index
     - Diabetes: Precise carbohydrate counting, glycemic load
     - Hypertension: Sodium restriction, DASH diet principles
     ` : '';

  return `You are a board-certified nutritionist with clinical experience in medical nutrition therapy.
  
  ${medicalContext}
  
  MEDICAL ACCURACY REQUIREMENTS:
  - Use USDA Food Data Central values (gold standard)
  - Account for food preparation effects on nutrition
  - Include bioavailable forms of nutrients
  - Flag potential food-drug interactions
  - Consider portion size accuracy for medical tracking
  
  ${this.getStandardPrompt(input)}`;
}

// Add health condition integration
async processFoodInput(
  input: string, 
  timeOfDay?: string, 
  healthConditions?: string[]
): Promise<LLMResponse> {
  const prompt = this.createMedicalNutritionPrompt(input, healthConditions);
  // ... rest of implementation
}
```

**Pros:**
- ✅ No additional cost
- ✅ Simple implementation
- ✅ Keep existing infrastructure
- ✅ Immediate deployment

**Cons:**
- ❌ Not medical-specialized model
- ❌ General domain knowledge
- ❌ No HIPAA guarantees

---

### Option 3: Hybrid Multi-Model Approach
**Implementation Steps:**
1. Keep Gemini 1.5 for general nutrition
2. Add Claude/GPT-4 for medical cases
3. Route based on health conditions
4. Implement fallback logic

**Code Changes Required:**
```typescript
class HybridMedicalLLM {
  private geminiLLM: LLMFoodBrain;
  private medicalLLM: ClaudeMedicalLLM; // or GPT-4
  
  async processFoodInput(
    input: string, 
    healthConditions?: string[]
  ): Promise<LLMResponse> {
    // Route to medical model for complex health conditions
    if (this.requiresMedicalExpertise(healthConditions)) {
      return this.medicalLLM.processWithHealthContext(input, healthConditions);
    }
    
    // Use Gemini for general nutrition
    return this.geminiLLM.processFoodInput(input);
  }
  
  private requiresMedicalExpertise(conditions?: string[]): boolean {
    const criticalConditions = ['diabetes', 'pcos', 'kidney_disease', 'heart_disease'];
    return conditions?.some(c => criticalConditions.includes(c)) || false;
  }
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Cost optimization
- ✅ Medical accuracy when needed
- ✅ Graceful fallbacks

**Cons:**
- ❌ Complex implementation
- ❌ Multiple API keys needed
- ❌ Increased latency for medical cases

---

## Implementation Recommendations

### For Your Nutrition App: Option 2 (Enhanced Gemini 1.5)

**Why This is Best:**
1. **Cost Effective**: No additional API costs
2. **Proven Performance**: Gemini 1.5 already works well
3. **Quick Implementation**: Prompt engineering only
4. **Medical Enhancement**: Add health condition context

**Immediate Actions:**
1. Update prompts with medical nutrition context
2. Add health condition integration
3. Test accuracy with medical scenarios
4. Add micronutrient focus for PCOS/diabetes

**Future Migration Path:**
- Monitor medGemma/medLM public availability
- Benchmark against enhanced Gemini
- Migrate if significant accuracy improvement

### Medical Prompt Enhancement Strategy
```typescript
const MEDICAL_NUTRITION_GUIDELINES = {
  pcos: {
    focus: ['anti-inflammatory', 'low-glycemic', 'omega-3', 'fiber'],
    avoid: ['refined-sugar', 'processed-foods', 'trans-fats'],
    micronutrients: ['inositol', 'vitamin-d', 'chromium']
  },
  diabetes: {
    focus: ['carbohydrate-counting', 'glycemic-load', 'fiber'],
    avoid: ['simple-sugars', 'refined-carbs'],
    micronutrients: ['chromium', 'magnesium', 'alpha-lipoic-acid']
  }
  // ... other conditions
};

// Integrate into prompt generation
private createHealthConditionPrompt(conditions: string[]): string {
  return conditions.map(condition => {
    const guidelines = MEDICAL_NUTRITION_GUIDELINES[condition];
    return `For ${condition}: Focus on ${guidelines.focus.join(', ')}. 
            Critical nutrients: ${guidelines.micronutrients.join(', ')}.`;
  }).join('\n');
}
```

## Testing Strategy
1. **Accuracy Benchmark**: Test against USDA database
2. **Medical Scenarios**: PCOS/diabetes meal analysis
3. **Edge Cases**: Complex recipes, portion sizes
4. **Performance**: Response time and consistency
5. **Cost Analysis**: Token usage vs accuracy gain

## Rollback Plan
- Keep original Gemini implementation as fallback
- Feature flag for medical enhancement
- Monitor error rates and user feedback
- Quick rollback if issues detected

## Success Metrics
- **Accuracy**: ±5% nutrition values vs USDA
- **Medical Relevance**: Proper health condition considerations
- **Performance**: <3 second response time
- **User Satisfaction**: Improved health condition scores