import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AppTabs from './AppTabs';
import { headerOptions } from './theme';

const Stack = createNativeStackNavigator();

// Stack raiz: as telas disponíveis dependem de existir (ou não) um usuário logado.
// Ao fazer login/logout o React Navigation troca automaticamente o conjunto de telas.
export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ ...headerOptions, headerBackButtonDisplayMode: 'minimal' }}>
      {user ? (
        <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
