import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Image Local */}
        <Image 
          style={styles.imageBox} 
          source={{ uri: 'https://via.placeholder.com/150.png?text=Image' }} 
        />
      </View>

      {/* Bottom Text Local */}
      <View style={styles.largeTextBox}>
        <Text>Text local Lorem ipsum dolor sit amet, 
            consectetur adipiscing elit. 
            Etiam eget ligula eu lectus lobortis condimentum. 
            Aliquam nonummy auctor massa. Pellentesque habitant morbi 
            tristique senectus et netus et malesuada fames ac turpis egestas. 
            Nulla at risus. Quisque purus magna, auctor et, sagittis ac, 
            posuere eu, lectus. Nam mattis, felis ut adipiscing.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    marginTop: 30
  },
  topRow: {
    flexDirection: 'row',
    height: '48%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageBox: {
    margin: 'auto',
    width: '60%',
    height: '100%', 
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  largeTextBox: {
    width: '100%',
    height: '48%',
    backgroundColor: '#ddd',
    borderRadius: 10
  },
});
