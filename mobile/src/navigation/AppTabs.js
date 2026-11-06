import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import AccountScreen from '../screens/app/AccountScreen';
import CommunityScreen from '../screens/app/CommunityScreen';
import ContentsScreen from '../screens/app/ContentsScreen';
import HomeScreen from '../screens/app/HomeScreen';
import ProfessionalsScreen from '../screens/app/ProfessionalsScreen';
import { colors, fonts } from '../theme';
import { headerOptions } from './theme';

const Tab = createBottomTabNavigator();

const icons = {
  Home: 'home',
  Contents: 'book',
  Professionals: 'people',
  Community: 'chatbubbles',
  Account: 'person-circle',
};

// Abas inferiores com as seções principais do site (abertas também a visitantes)
export default function AppTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? icons[route.name] : `${icons[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início', headerTitle: () => <Logo size={30} direction="row" /> }}
      />
      <Tab.Screen name="Contents" component={ContentsScreen} options={{ title: 'Conteúdos' }} />
      <Tab.Screen name="Professionals" component={ProfessionalsScreen} options={{ title: 'Profissionais' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Comunidade' }} />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={user ? { title: 'Minha conta', tabBarLabel: 'Conta' } : { title: 'Entrar', tabBarLabel: 'Entrar' }}
      />
    </Tab.Navigator>
  );
}
