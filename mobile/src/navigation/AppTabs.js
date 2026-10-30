import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';
import GlossaryScreen from '../screens/app/GlossaryScreen';
import HomeScreen from '../screens/app/HomeScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import TipsScreen from '../screens/app/TipsScreen';
import { colors } from '../theme';
import { headerOptions } from './theme';

const Tab = createBottomTabNavigator();

const icons = {
  Home: 'home',
  Glossary: 'book',
  Tips: 'bulb',
  Profile: 'person',
  Admin: 'shield-checkmark',
};

// Abas inferiores exibidas depois do login.
// A aba Admin só é registrada para usuários com nível "admin".
export default function AppTabs() {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: '600' },
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
      <Tab.Screen name="Glossary" component={GlossaryScreen} options={{ title: 'Glossário' }} />
      <Tab.Screen name="Tips" component={TipsScreen} options={{ title: 'Dicas' }} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminPanelScreen} options={{ title: 'Admin' }} />}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
