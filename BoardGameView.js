import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const calcul = -((100)/(450))*((Dimensions.get('window').width)/(5));

// Importez les images de manière statique
const images = {
  0: require('./assets/0.png'),
  1: require('./assets/1.png'),
  2: require('./assets/2.png'),
  3: require('./assets/3.png'),
  4: require('./assets/4.png'),
};

const BoardGameView = () => {
  const numRows = 5;
  const numCols = 5;

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * Object.keys(images).length);
    return images[randomIndex.toString()];
  };

  const renderRow = (rowIndex) => (
    <View style={styles.row} key={rowIndex.toString()}>
      {Array.from({ length: numCols }).map((_, colIndex) => (
        <Image
          key={colIndex.toString()}
          source={getRandomImage()}
          style={[styles.image, colIndex !== 0 && { marginLeft: calcul }]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: numRows }).map((_, rowIndex) => renderRow(rowIndex))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: calcul,
  },
  image: {
    width: Dimensions.get('window').width / 5,
    height: Dimensions.get('window').width / 5,
  },
});

export default BoardGameView;
