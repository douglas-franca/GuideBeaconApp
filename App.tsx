import { StatusBar, StyleSheet, Text, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import SearchDevices from './src/components/SearchDevices';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

function AppContent() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Text>My New App</Text>
      <SearchDevices />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
