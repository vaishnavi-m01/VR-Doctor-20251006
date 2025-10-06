import React from 'react';
import { View, StyleSheet } from 'react-native';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Minimal splash screen - no text or menu elements */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e4336', // brand-dark-green
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Zen Kaku Gothic Antique-Bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'Zen Kaku Gothic Antique',
  },
});
