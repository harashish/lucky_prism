import { StyleSheet, Text, View } from 'react-native';

// UWAGA: Moduły takie jak 'react-native' są podstawowymi pakietami w środowisku Expo/React Native. 
// Błąd kompilacji sugerował, że środowisko testowe miało problem z ich rozpoznaniem.
// Jeśli po tej zmianie błąd nadal się pojawia, oznacza to problem z konfiguracją lokalną,
// a nie z samym kodem. Ten kod jest standardowym i poprawnym React Native.

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
    // Używamy jasnego tła
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