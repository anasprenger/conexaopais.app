import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import ProfessionalRequestsScreen from '../screens/admin/ProfessionalRequestsScreen';
import AboutScreen from '../screens/app/AboutScreen';
import ApiConfigScreen from '../screens/app/ApiConfigScreen';
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

// Stack raiz.
// - Leitura (abas, artigo, coluna, revista, profissionais, sobre e contato) e a conexão com a API: abertas a todos.
// - Boas-vindas, Entrar e Criar conta: só para quem ainda não entrou. Ao entrar, essas telas saem
//   da pilha e a pessoa volta para onde estava.
// - Área de publicação: profissional aprovado e admin. Verificação de novos profissionais: só admin.
export default function RootNavigator() {
  const { user, isAdmin, canPublish } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ ...headerOptions, headerBackButtonDisplayMode: 'minimal' }}>
      {!user && <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />}

      <Stack.Group>
        <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false, title: 'Voltar' }} />
        <Stack.Screen name="Article" component={ArticleScreen} options={{ title: 'Artigo' }} />
        <Stack.Screen name="Column" component={ColumnScreen} options={{ title: 'Coluna' }} />
        <Stack.Screen name="Magazine" component={MagazineScreen} options={{ title: 'Revista' }} />
        <Stack.Screen name="Professional" component={ProfessionalScreen} options={{ title: 'Perfil profissional' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre' }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contato' }} />
        <Stack.Screen name="ApiConfig" component={ApiConfigScreen} options={{ title: 'Conexão com a API' }} />
      </Stack.Group>

      {user ? (
        <Stack.Group>
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
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
