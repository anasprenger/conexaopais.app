import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ConfirmProvider } from './src/contexts/ConfirmContext';
import { ExpressionsProvider } from './src/contexts/ExpressionsContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { SuggestionsProvider } from './src/contexts/SuggestionsContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/navigation/theme';

// Mantém a tela de abertura até as fontes do site (Fraunces e DM Sans) carregarem
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ExpressionsProvider>
          <FavoritesProvider>
            <SuggestionsProvider>
              <ConfirmProvider>
                <NavigationContainer theme={navigationTheme}>
                  <RootNavigator />
                  <StatusBar style="dark" />
                </NavigationContainer>
              </ConfirmProvider>
            </SuggestionsProvider>
          </FavoritesProvider>
        </ExpressionsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
