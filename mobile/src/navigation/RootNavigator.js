import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import ExpressionFormScreen from '../screens/admin/ExpressionFormScreen';
import ExpressionDetailScreen from '../screens/app/ExpressionDetailScreen';
import SuggestExpressionScreen from '../screens/app/SuggestExpressionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AppTabs from './AppTabs';
import { headerOptions } from './theme';

const Stack = createNativeStackNavigator();

// Stack raiz: as telas disponíveis dependem de existir (ou não) um usuário logado
// e do nível dele. Ao fazer login/logout o React Navigation troca automaticamente o conjunto de telas.
export default function RootNavigator() {
  const { user, isAdmin } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ ...headerOptions, headerBackButtonDisplayMode: 'minimal' }}>
      {user ? (
        <Stack.Group>
          <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false, title: 'Voltar' }} />
          <Stack.Screen name="ExpressionDetail" component={ExpressionDetailScreen} options={{ title: 'Expressão' }} />
          <Stack.Screen
            name="SuggestExpression"
            component={SuggestExpressionScreen}
            options={{ title: 'Sugerir expressão' }}
          />
          {isAdmin && (
            <Stack.Screen name="ExpressionForm" component={ExpressionFormScreen} options={{ title: 'Expressão' }} />
          )}
        </Stack.Group>
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
