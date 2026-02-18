import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const haptics = {
    // Light vibration for interactions like tapping a button
    light: async () => {
        if (isNative) {
            await Haptics.impact({ style: ImpactStyle.Light });
        }
    },

    // Medium vibration for more significant actions
    medium: async () => {
        if (isNative) {
            await Haptics.impact({ style: ImpactStyle.Medium });
        }
    },

    // Heavy vibration for critical actions
    heavy: async () => {
        if (isNative) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        }
    },

    // Success notification vibration
    success: async () => {
        if (isNative) {
            await Haptics.notification({ type: NotificationType.Success });
        }
    },

    // Warning notification vibration
    warning: async () => {
        if (isNative) {
            await Haptics.notification({ type: NotificationType.Warning });
        }
    },

    // Error notification vibration
    error: async () => {
        if (isNative) {
            await Haptics.notification({ type: NotificationType.Error });
        }
    },

    // Selection changed (like scrolling a picker)
    selection: async () => {
        if (isNative) {
            await Haptics.selectionStart();
            await Haptics.selectionChanged();
            await Haptics.selectionEnd();
        }
    }
};
