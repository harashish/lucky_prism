import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Tytuł ekranu */}
      <Text style={styles.title}>Witaj w aplikacji!</Text>
      {/* Podtytuł, informujący o przeznaczeniu pliku */}
      <Text style={styles.subtitle}>To jest Ekran Główny (index.tsx) w zakładce "Home".</Text>
      {/* Komunikat o sukcesie */}
      <Text style={styles.info}>Jeśli to widzisz, Expo Router działa poprawnie.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: 'green',
    marginTop: 10,
  }
});