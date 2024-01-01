import React, { useState } from 'react';
import { View, Image, Button, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { update, ref } from 'firebase/database';
import { db } from './firebaseconfig';

const calcul = -((100) / 450) * (Dimensions.get('window').width / 5);

const images = {
  0: require('./assets/0.png'),
  1: require('./assets/1.png'),
  2: require('./assets/2.png'),
  3: require('./assets/3.png'),
  4: require('./assets/4.png'),
};

const BoutonTest = (codePartie, whoAmI) => {
  const newTurn = whoAmI === 'host' ? 'guest' : 'host';
  update(ref(db, 'games/' + codePartie), {
    turn: newTurn,
  }).catch((error) => {
    alert(error);
  });
};

const UpdateBoard = (codePartie, rowIndex, colIndex, currentGameData) => {
  update(ref(db, `games/${codePartie}/board/${colIndex}`), {
    [rowIndex]: (currentGameData.board[colIndex][rowIndex] + 1) % 5,
  }).catch((error) => {
    alert(error);
  });
};

const BoardGameView = ({ whoAmI, currentGameData, codePartie }) => {
  const numRows = 5;
  const numCols = 5;

  const getImage = (colIndex, rowIndex) => {
    return images[currentGameData.board[colIndex][rowIndex]];
  };

  const renderRow = (rowIndex) => (
    <View style={styles.row} key={rowIndex.toString()}>
      {Array.from({ length: numCols }).map((_, colIndex) => (
        <TouchableOpacity
          key={colIndex.toString()}
          onPress={() => {
            console.log(`Clicked at position [${rowIndex};${colIndex}]`);
            if (currentGameData.turn === whoAmI) {
              UpdateBoard(codePartie, rowIndex, colIndex, currentGameData);
            }
          }}
        >
          <View style={styles.cell}>
            <Image
              source={getImage(colIndex, rowIndex)}
              style={[styles.image, colIndex !== 0 && { marginLeft: calcul }]}
            />
            {rowIndex === 3 && (
              <Image
                source={require('./assets/1pion_o.png')}
                style={[styles.overlayImage, colIndex !== 0 && { marginLeft: calcul },{ position: 'absolute', top: 0, left: 0 }]}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: numRows }).map((_, rowIndex) => renderRow(rowIndex))}
      <View style={styles.row}>
        <Image source={require('./assets/0pion_o.png')} style={styles.image} />
        <Image source={require('./assets/0pion_o.png')} style={styles.image} />
        <Image source={require('./assets/0pion_v.png')} style={styles.image} />
        <Image source={require('./assets/0pion_v.png')} style={styles.image} />
      </View>
      {currentGameData.turn === whoAmI && (
        <Button
          title="TOUR"
          onPress={() => {
            console.log(whoAmI);
            console.log(currentGameData.board);
            BoutonTest(codePartie, whoAmI);
          }}
        />
      )}
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
    marginBottom: calcul,
  },
  image: {
    width: Dimensions.get('window').width / 5,
    height: Dimensions.get('window').width / 5,
  },
  overlayImage: {
    width: Dimensions.get('window').width / 5,
    height: Dimensions.get('window').width / 5,
    resizeMode: 'cover',
  },
  cell: {
    position: 'relative',
  },
});

export default BoardGameView;
