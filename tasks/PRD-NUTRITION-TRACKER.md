# Product Requirements Document: Nutrition Tracker with Health Condition Support

## Introduction/Overview

The Nutrition Tracker is a comprehensive web application designed to help health-conscious individuals and people with medical conditions (such as PCOS, diabetes, etc.) track their food intake and analyze detailed nutritional components. The app provides in-depth nutritional breakdowns and helps users understand how their food choices impact their health metrics like blood sugar and insulin levels.

**Latest Enhancement (2025):** The application now features an integrated Small Language Model (SLM) that intelligently breaks down complex meal descriptions into individual food components. Using 60 curated training examples, the SLM can accurately parse meals like "jollof rice with chicken and plantain" into separate ingredients with appropriate quantities, making food logging significantly more intuitive and accurate.

## Goals

1. Enable users to log food items and receive detailed nutritional analysis
2. Provide comprehensive nutrient breakdowns including macronutrients, vitamins, minerals, and micronutrients
3. Help users with health conditions (PCOS, diabetes) track food impact on blood sugar and insulin levels
4. Deliver actionable insights through visual data representation
5. Support mobile-responsive design for on-the-go food logging

## User Stories

1. **As a PCOS patient**, I want to track my blood sugar and insulin level based on my food so that I can manage my condition better and make informed dietary choices.

2. **As a health-conscious individual**, I want to log my meals and see detailed nutritional breakdowns so that I can ensure I'm meeting my daily nutritional needs.

3. **As a person with dietary restrictions**, I want to analyze the nutrient content of foods so that I can avoid deficiencies and maintain optimal health.

4. **As a mobile user**, I want to quickly log foods on my phone so that I can track my intake throughout the day.

5. **As a data-driven user**, I want to see visual representations of my nutritional intake so that I can easily identify patterns and areas for improvement.

6. **As a busy user**, I want to type "I had 2 slices of bread and a cup of coffee" and have the app automatically understand and log my food intake so that I can log meals quickly without filling out forms.

7. **As a casual user**, I want to have natural conversations about my food intake so that logging feels intuitive and less like data entry.

8. **As someone who eats complex meals**, I want to describe my entire meal in one message (e.g., "chicken salad with tomatoes, cucumbers and olive oil dressing") and have the app parse each component accurately.

## Functional Requirements

1. **Food Logging System**
   - Users must be able to search and add food items to their daily log
   - System must support various measurement units (grams, ounces, cups, pieces, etc.)
   - Users must be able to specify quantity and portion sizes
   - System must categorize foods by type (fruits, vegetables, proteins, etc.)

1a. **Conversational Food Input with AI Enhancement**
   - System must provide toggle between traditional form input and conversational mode
   - System must parse natural language food descriptions (e.g., "2 slices of bread")
   - System must extract food names, quantities, units, and cooking methods from text
   - System must handle multiple foods in a single message
   - System must ask clarifying questions for ambiguous inputs
   - System must show parsed interpretation before final confirmation
   - System must maintain all existing functionality (cooking states, time tracking, etc.)

1b. **Small Language Model (SLM) Integration**
   - System must use training data with 60 meal examples (30 global + 30 Nigerian) for enhanced accuracy
   - System must intelligently break down complex meal descriptions into individual food components
   - System must provide confidence scoring for meal breakdown predictions
   - System must implement multi-tier parsing: SLM → Pattern matching → Basic fallback
   - System must handle meals like "jollof rice with chicken and plantain" by identifying rice, chicken, and plantain separately
   - System must predict appropriate quantities and units based on training patterns
   - System must gracefully fallback to pattern matching when SLM confidence is low

2. **Detailed Nutritional Analysis**
   - System must display comprehensive nutritional information including:
     - Macronutrients (protein, carbohydrates, fat, fiber)
     - Vitamins (A, C, D, E, K, B-complex)
     - Minerals (iron, calcium, magnesium, zinc, etc.)
     - Micronutrients and trace elements
     - Daily value percentages for each nutrient

3. **Health Condition Support**
   - System must calculate and display glycemic index/load for foods
   - System must estimate blood sugar impact based on carbohydrate content
   - System must provide insulin response indicators for foods
   - System must highlight foods suitable for specific conditions (PCOS, diabetes)

4. **Visual Data Representation**
   - System must display macronutrient breakdowns in pie charts
   - System must show daily progress bars for key nutrients
   - System must provide trend analysis for nutritional intake over time
   - System must use color-coding for nutrient adequacy levels

5. **Food History and Tracking**
   - System must maintain a history of all logged foods
   - Users must be able to view, edit, and delete previous entries
   - System must calculate running totals for daily, weekly, and monthly intake

6. **Mobile Responsiveness**
   - Application must be fully responsive and functional on mobile devices
   - Interface must be optimized for touch interactions
   - Application must work offline for basic food logging functionality

## Non-Goals (Out of Scope)

1. Social features (sharing, following, community aspects)
2. Meal delivery or restaurant integration
3. Workout or exercise tracking
4. Recipe creation and sharing
5. Barcode scanning functionality
6. Integration with wearable devices
7. Meal planning or scheduling features

## Design Considerations

- **UI Framework**: Material UI for consistent, professional appearance
- **Color Scheme**: Health-focused colors (greens for healthy choices, appropriate warning colors for nutrients)
- **Accessibility**: Must meet WCAG 2.1 AA standards
- **Mobile-First**: Design should prioritize mobile experience while maintaining desktop functionality
- **Loading States**: Clear indicators for data processing and analysis
- **Error Handling**: User-friendly error messages and recovery options

## Technical Considerations

- **Frontend**: React with TypeScript for type safety
- **Styling**: Material UI components with custom theming
- **Data Storage**: Local storage for user data with potential for cloud sync
- **Nutrition Database**: Integration with comprehensive nutrition API or database
- **Performance**: Efficient rendering for large datasets and smooth mobile experience
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Success Metrics

1. **User Engagement**: Users log food items at least 3 times per day
2. **Feature Adoption**: 80% of users utilize the detailed nutrient breakdown feature
3. **Mobile Usage**: 70% of interactions occur on mobile devices
4. **Health Condition Support**: Users with PCOS/diabetes report improved dietary awareness
5. **Data Accuracy**: Nutritional calculations are accurate within 5% of standard databases

## Open Questions

1. Should the app include pre-built food databases or rely on manual entry?
2. What level of customization should be available for daily nutritional targets?
3. Should the app support multiple users or profiles per account?
4. What specific blood sugar/insulin calculation methods should be implemented?
5. Should the app include educational content about nutrition and health conditions?