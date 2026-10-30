import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Logo from './src/components/Logo';
import { colors } from './src/theme';

export default function App() {
  return (
    <View style={styles.container}>
      <Logo size={120} showSlogan />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
