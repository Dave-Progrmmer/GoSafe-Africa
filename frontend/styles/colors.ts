export const Colors = {
  light: {
    primary: '#10B981', // Emerald green
    secondary: '#059669',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    surfaceVariant: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarActive: '#10B981',
    tabBarInactive: '#9CA3AF',
    inputBackground: '#F9FAFB',
    placeholder: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#34D399', // Lighter emerald for dark mode
    secondary: '#10B981',
    background: '#0F172A', // Dark slate
    surface: '#1E293B',
    surfaceVariant: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    card: '#1E293B',
    tabBar: '#1E293B',
    tabBarActive: '#34D399',
    tabBarInactive: '#64748B',
    inputBackground: '#1E293B',
    placeholder: '#64748B',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export type ThemeColors = typeof Colors.light;
