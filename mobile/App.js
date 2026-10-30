import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { SuggestionsProvider } from './src/contexts/SuggestionsContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/navigation/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <SuggestionsProvider>
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
              <StatusBar style="dark" />
            </NavigationContainer>
          </SuggestionsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
