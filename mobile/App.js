import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CommunityProvider } from './src/contexts/CommunityContext';
import { ConfirmProvider, useConfirm } from './src/contexts/ConfirmContext';
import { ContentProvider } from './src/contexts/ContentContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationTheme } from './src/navigation/theme';

// Mantém a tela de abertura até as fontes do site (Fraunces e DM Sans) carregarem e a sessão guardada ser lida
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ContentProvider>
          <CommunityProvider>
            <ConfirmProvider>
              <Navegacao fontesProntas={fontsLoaded || Boolean(fontError)} />
            </ConfirmProvider>
          </CommunityProvider>
        </ContentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Só mostra as telas depois de saber se há uma sessão guardada (evita piscar a tela de boas-vindas para quem já entrou)
function Navegacao({ fontesProntas }) {
  const { restaurando, sessaoExpirada } = useAuth();
  const confirm = useConfirm();
  const navigationRef = useNavigationContainerRef();
  const pronto = fontesProntas && !restaurando;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  // Quando a API recusa o token (sessão expirada), o app sai da conta e avisa uma vez, oferecendo entrar de novo
  useEffect(() => {
    if (!pronto || !sessaoExpirada) return;
    confirm({
      title: 'Sua sessão expirou',
      message: 'Por segurança, o acesso vale por um tempo limitado. Entre de novo para curtir, salvar, comentar e publicar.',
      confirmLabel: 'Entrar',
      cancelLabel: 'Agora não',
      tone: 'primary',
      onConfirm: () => navigationRef.isReady() && navigationRef.navigate('Login'),
    });
  }, [pronto, sessaoExpirada]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pronto) return null;

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
