import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';


export default function ProfileScreen() {
  const { colors, theme, setTheme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      },
    ]);
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      notificationsEnabled ? 'Disable push notifications?' : 'Enable push notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setNotificationsEnabled(!notificationsEnabled);
            Alert.alert('Success', `Notifications ${notificationsEnabled ? 'disabled' : 'enabled'}`);
          }
        },
      ]
    );
  };

  const handleLocationSettings = () => {
    Alert.alert(
      'Location Settings',
      'Open device location settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        },
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'GoSafe Africa respects your privacy.\n\n• We only collect location data when you create reports\n• Your data is encrypted and secure\n• We never sell your personal information\n• You can delete your account anytime',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help with GoSafe Africa?\n\n📧 Email: support@gosafe.africa\n🌐 Website: gosafe.africa/help\n\nOr tap "Contact Support" to send us a message.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact Support', 
          onPress: () => Linking.openURL('mailto:support@gosafe.africa?subject=GoSafe%20App%20Support')
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About GoSafe Africa',
      `Version 1.0.0\n\nGoSafe Africa is a community-powered road safety app that helps drivers navigate safely across Africa.\n\n🛡️ Report hazards\n✓ Confirm community reports\n🗺️ Get real-time safety updates\n\n© 2024 GoSafe Africa`,
      [{ text: 'OK' }]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'What would you like to update?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change Name', 
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available in the next update!')
        },
        { 
          text: 'Change Password', 
          onPress: () => Alert.alert('Coming Soon', 'Password change will be available in the next update!')
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.error + '20' : colors.primary + '20' }]}>
        <Ionicons name={icon} size={22} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: danger ? colors.error : colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />)}
    </TouchableOpacity>
  );

  const ThemeOption = ({ value, label, icon }: { value: typeof theme; label: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: theme === value ? colors.primary : colors.surface,
          borderColor: theme === value ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setTheme(value)}
    >
      <Ionicons name={icon} size={20} color={theme === value ? '#FFFFFF' : colors.textSecondary} />
      <Text style={[styles.themeLabel, { color: theme === value ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.surface }]}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Theme Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.themeSection, { backgroundColor: colors.card }]}>
          <View style={styles.themeRow}>
            <ThemeOption value="light" label="Light" icon="sunny" />
            <ThemeOption value="dark" label="Dark" icon="moon" />
            <ThemeOption value="system" label="System" icon="phone-portrait" />
          </View>
        </View>

        {/* Quick Toggle */}
        <MenuItem
          icon={isDark ? 'moon' : 'sunny'}
          title="Dark Mode"
          subtitle={isDark ? 'Currently enabled' : 'Currently disabled'}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Settings</Text>
        
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle={notificationsEnabled ? 'Enabled' : 'Disabled'}
          onPress={handleNotifications}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={() => handleNotifications()}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem
          icon="location-outline"
          title="Location"
          subtitle="Manage location permissions"
          onPress={handleLocationSettings}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Privacy"
          subtitle="View privacy policy"
          onPress={handlePrivacy}
        />
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="FAQ and contact"
          onPress={handleHelp}
        />
        <MenuItem
          icon="information-circle-outline"
          title="About"
          subtitle="Version 1.0.0"
          onPress={handleAbout}
        />

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error + '10' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
