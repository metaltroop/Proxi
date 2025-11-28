/** 
 * iOS-Style Animation Utilities
 * Smooth, natural animations inspired by iOS design
 */

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
    fast: 200,
    normal: 300,
    slow: 400,
    verySlow: 600
} as const;

// Easing functions matching iOS animations
export const EASING = {
    // iOS default easing
    ios: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // Smooth deceleration
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    // Smooth acceleration
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    // Spring-like bounce
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // Gentle ease
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

// Tailwind animation classes
export const ANIMATION_CLASSES = {
    // Fade animations
    fadeIn: 'animate-in fade-in',
    fadeOut: 'animate-out fade-out',

    // Slide animations
    slideInFromRight: 'animate-in slide-in-from-right',
    slideInFromLeft: 'animate-in slide-in-from-left',
    slideInFromTop: 'animate-in slide-in-from-top',
    slideInFromBottom: 'animate-in slide-in-from-bottom',

    slideOutToRight: 'animate-out slide-out-to-right',
    slideOutToLeft: 'animate-out slide-out-to-left',
    slideOutToTop: 'animate-out slide-out-to-top',
    slideOutToBottom: 'animate-out slide-out-to-bottom',

    // Scale animations
    scaleIn: 'animate-in zoom-in',
    scaleOut: 'animate-out zoom-out',

    // Combined animations
    fadeSlideIn: 'animate-in fade-in slide-in-from-bottom',
    fadeSlideOut: 'animate-out fade-out slide-out-to-bottom',
} as const;

// Duration classes
export const DURATION_CLASSES = {
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-400',
    verySlow: 'duration-600',
} as const;

// Helper function to combine animation classes
export const combineAnimations = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

// Preset animation combinations
export const PRESET_ANIMATIONS = {
    // Modal/Dialog animations
    modalEnter: combineAnimations(
        ANIMATION_CLASSES.fadeSlideIn,
        DURATION_CLASSES.normal
    ),
    modalExit: combineAnimations(
        ANIMATION_CLASSES.fadeSlideOut,
        DURATION_CLASSES.fast
    ),

    // Page transition animations
    pageEnter: combineAnimations(
        ANIMATION_CLASSES.fadeIn,
        ANIMATION_CLASSES.slideInFromRight,
        DURATION_CLASSES.normal
    ),
    pageExit: combineAnimations(
        ANIMATION_CLASSES.fadeOut,
        ANIMATION_CLASSES.slideOutToLeft,
        DURATION_CLASSES.fast
    ),

    // Card animations
    cardEnter: combineAnimations(
        ANIMATION_CLASSES.fadeIn,
        ANIMATION_CLASSES.scaleIn,
        DURATION_CLASSES.normal
    ),

    // Bottom sheet animations
    bottomSheetEnter: combineAnimations(
        ANIMATION_CLASSES.slideInFromBottom,
        DURATION_CLASSES.normal
    ),
    bottomSheetExit: combineAnimations(
        ANIMATION_CLASSES.slideOutToBottom,
        DURATION_CLASSES.fast
    ),
} as const;

// React component animation hook
export const useAnimationClass = (isVisible: boolean, enterClass: string, exitClass: string) => {
    return isVisible ? enterClass : exitClass;
};
