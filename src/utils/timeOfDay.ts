import { TimeOfDay } from '../types';

/**
 * Determines the time of day based on a given date/time
 * @param date - The date to analyze (defaults to current time)
 * @returns TimeOfDay enum value
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  
  if (hour >= 4 && hour < 7) {
    return 'early-morning'; // 4:00 AM - 6:59 AM
  } else if (hour >= 7 && hour < 10) {
    return 'morning'; // 7:00 AM - 9:59 AM
  } else if (hour >= 10 && hour < 12) {
    return 'late-morning'; // 10:00 AM - 11:59 AM
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon'; // 12:00 PM - 5:59 PM
  } else if (hour >= 18 && hour < 22) {
    return 'evening'; // 6:00 PM - 9:59 PM
  } else if (hour >= 22 || hour < 2) {
    return 'night'; // 10:00 PM - 1:59 AM
  } else {
    return 'late-night'; // 2:00 AM - 3:59 AM
  }
}

/**
 * Gets a human-readable label for a time of day
 * @param timeOfDay - The TimeOfDay enum value
 * @returns Human-readable string
 */
export function getTimeOfDayLabel(timeOfDay: TimeOfDay): string {
  const labels: Record<TimeOfDay, string> = {
    'early-morning': 'Early Morning',
    'morning': 'Morning',
    'late-morning': 'Late Morning',
    'afternoon': 'Afternoon',
    'evening': 'Evening',
    'night': 'Night',
    'late-night': 'Late Night'
  };
  
  return labels[timeOfDay];
}

/**
 * Gets an icon for a time of day
 * @param timeOfDay - The TimeOfDay enum value
 * @returns Emoji icon
 */
export function getTimeOfDayIcon(timeOfDay: TimeOfDay): string {
  const icons: Record<TimeOfDay, string> = {
    'early-morning': '🌅',
    'morning': '☀️',
    'late-morning': '🌤️',
    'afternoon': '☀️',
    'evening': '🌇',
    'night': '🌙',
    'late-night': '🌃'
  };
  
  return icons[timeOfDay];
}

/**
 * Gets a color for a time of day (for UI styling)
 * @param timeOfDay - The TimeOfDay enum value
 * @returns CSS color string
 */
export function getTimeOfDayColor(timeOfDay: TimeOfDay): string {
  const colors: Record<TimeOfDay, string> = {
    'early-morning': '#FF6B6B', // Sunrise red
    'morning': '#FFE66D', // Sunny yellow
    'late-morning': '#FFA726', // Warm orange
    'afternoon': '#66BB6A', // Green
    'evening': '#FF7043', // Sunset orange
    'night': '#5C6BC0', // Night blue
    'late-night': '#7E57C2' // Deep purple
  };
  
  return colors[timeOfDay];
}