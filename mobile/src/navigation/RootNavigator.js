import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import ProfessionalRequestsScreen from '../screens/admin/ProfessionalRequestsScreen';
import AboutScreen from '../screens/app/AboutScreen';
import ArticleScreen from '../screens/app/ArticleScreen';
import ColumnScreen from '../screens/app/ColumnScreen';
import ContactScreen from '../screens/app/ContactScreen';
import MagazineScreen from '../screens/app/MagazineScreen';
import ProfessionalScreen from '../screens/app/ProfessionalScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import PostFormScreen from '../screens/publish/PostFormScreen';
import AppTabs from './AppTabs';
import { headerOptions } from './theme';

const Stack = createNativeStackNavigator();

// Stack raiz: as telas registradas dependem de haver usuário logado e do nível dele.
// - visitante: Boas-vindas, Entrar e Criar conta
// - família, profissional e admin: abas + leitura de conteúdos
// - profissional aprovado e admin: área de publicação
// - admin: verificação de novos profissionais
export default function RootNavigator() {
  const { user, isAdmin, canPublish } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ ...headerOptions, headerBackButtonDisplayMode: 'minimal' }}>
      {user ? (
        <Stack.Group>
          <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false, title: 'Voltar' }} />
          <Stack.Screen name="Article" component={ArticleScreen} options={{ title: 'Artigo' }} />
          <Stack.Screen name="Column" component={ColumnScreen} options={{ title: 'Coluna' }} />
          <Stack.Screen name="Magazine" component={MagazineScreen} options={{ title: 'Revista' }} />
          <Stack.Screen name="Professional" component={ProfessionalScreen} options={{ title: 'Perfil profissional' }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre' }} />
          <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contato' }} />
          {canPublish && <Stack.Screen name="PostForm" component={PostFormScreen} options={{ title: 'Nova postagem' }} />}
          {isAdmin && (
            <Stack.Screen
              name="ProfessionalRequests"
              component={ProfessionalRequestsScreen}
              options={{ title: 'Novos profissionais' }}
            />
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
