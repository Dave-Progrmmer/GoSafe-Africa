import { Redirect } from 'expo-router';

export default function Index() {
  // This screen just redirects - the AuthGate in _layout.tsx handles the logic
  return <Redirect href="/(auth)/login" />;
}
