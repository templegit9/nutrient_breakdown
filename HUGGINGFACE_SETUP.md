# Hugging Face LLM Integration Setup

## Overview

The nutrition tracker now uses Hugging Face hosted language models for enhanced food breakdown capabilities. This provides much more accurate parsing of complex meal descriptions.

## Setup Instructions

### 1. Get a Hugging Face API Token

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with **Read** permissions
5. Copy the token (starts with `hf_`)

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

2. Add your Hugging Face token:
```
VITE_HUGGING_FACE_TOKEN=hf_your_actual_token_here
```

### 3. Models Used

**Primary Model**: `microsoft/DialoGPT-large`
- Conversational AI model optimized for dialogue
- Better understanding of natural language food descriptions

**Backup Model**: `facebook/blenderbot-400M-distill` 
- Fallback model if primary model fails
- Smaller but still capable for food parsing

## Features

### Enhanced Food Parsing
- **Complex Meals**: "I had jollof rice with chicken and plantain" → Individual components
- **Quantities**: Automatic quantity estimation based on context
- **Units**: Smart unit assignment (cups, grams, pieces, etc.)
- **Validation**: Prevents "unknown" foods from being logged

### Fallback System
1. **Hugging Face LLM** (primary)
2. **Training Data Matching** (60 meal examples)
3. **Pattern Matching** (regex-based)
4. **Basic Food Detection** (common foods list)

### Food Name Cleaning
- Removes common prefixes ("I had", "ate", etc.)
- Maps variations to standard names:
  - "scrambled eggs" → "eggs"
  - "jollof rice" → "rice"
  - "grilled chicken" → "chicken"
- Filters out invalid food names

## Usage

Once configured, the enhanced LLM will automatically be used in:

1. **Conversational Input Mode**: Chat-based food logging
2. **Smart Food Parser**: Backend food extraction
3. **Food Matching**: Database food matching with synonyms

## Testing

You can test the LLM integration in the browser console:
```javascript
// In browser dev tools
await testSLM();
```

This will test various meal descriptions and show:
- SLM extraction results
- Smart parser integration
- Processing methods used
- Confidence scores

## Troubleshooting

### No API Token
- Application falls back to pattern matching
- Warning logged in console
- Still functional but less accurate

### API Rate Limits
- Hugging Face free tier has rate limits
- Automatic fallback to training data matching
- Consider upgrading for production use

### Network Issues
- Automatic fallback to offline parsing
- Graceful degradation ensures app remains functional

## Cost Considerations

- **Free Tier**: 30,000 characters/month
- **Pro Tier**: $9/month for higher limits
- **Enterprise**: Custom pricing for high volume

For typical personal use, the free tier should be sufficient.