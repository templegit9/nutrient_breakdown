/**
 * Standardized rounding utilities for nutrition calculations
 * Based on FDA requirements and industry standards
 */

/**
 * Round to integer (for calories, major nutrients)
 */
export const roundToInteger = (value: number): number => {
  return Math.round(value);
};

/**
 * Round to one decimal place (for precise nutrient amounts)
 */
export const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

/**
 * Round to two decimal places (for micronutrients)
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Round percentage values to one decimal place
 */
export const roundToPercentage = (value: number): number => {
  return Math.round(value * 10) / 10;
};

/**
 * Format nutrition values according to FDA labeling requirements
 */
export const formatNutritionValue = (value: number, nutrientType: 'calorie' | 'macro' | 'micro' | 'percentage'): number => {
  switch (nutrientType) {
    case 'calorie':
      return roundToInteger(value);
    case 'macro':
      return roundToOneDecimal(value);
    case 'micro':
      return roundToTwoDecimals(value);
    case 'percentage':
      return roundToPercentage(value);
    default:
      return roundToOneDecimal(value);
  }
};

/**
 * Safe division with fallback for zero denominators
 */
export const safeDivide = (numerator: number, denominator: number, fallback: number = 0): number => {
  if (denominator === 0) return fallback;
  return numerator / denominator;
};

/**
 * Calculate percentage with proper rounding and validation
 */
export const calculatePercentage = (value: number, total: number, fallback: number = 0): number => {
  if (total === 0) return fallback;
  return roundToPercentage((value / total) * 100);
};