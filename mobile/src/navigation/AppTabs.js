import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/app/HomeScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import { colors } from '../theme';
import { headerOptions } from './theme';

const Tab = createBottomTabNavigator();

const icons = {
  Home: 'home',
  Profile: 'person',
};

// Abas inferiores exibidas depois do login
export default function AppTabs() {
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
