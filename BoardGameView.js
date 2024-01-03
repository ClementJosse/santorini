import React, { useState } from 'react';
import {
  View,
  Image,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { update, ref } from 'firebase/database';
import { db } from './firebaseconfig';

const calcul = -((100 / 450) * (Dimensions.get('window').width / 5));

var selectedRow = '';
var selectedCol = '';

console.log(selectedRow, selectedCol);

function DansLeCarre(rowIndex, colIndex, currentGameData, turnstatus) {
  if (
    selectedRow + 1 >= rowIndex &&
    selectedRow - 1 <= rowIndex &&
    selectedCol + 1 >= colIndex &&
    selectedCol - 1 <= colIndex
  ) {
    if (turnstatus == 'selectPion') {
      if (
        currentGameData.pion[colIndex][rowIndex] === '' ||
        (selectedCol == colIndex && selectedRow == rowIndex)
      ) {
        if (
          currentGameData.board[colIndex][rowIndex] - 1 <=
            currentGameData.board[selectedCol][selectedRow] &&
          currentGameData.board[colIndex][rowIndex] <= 3
        ) {
          return true;
        }
      }
    } else if (turnstatus == 'case') {
      if (currentGameData.pion[colIndex][rowIndex] === '') {
        if (currentGameData.board[colIndex][rowIndex] <= 3) {
          return true;
        }
      }
    }
  } else {
    return false;
  }
}

const imageCase = {
  0: require('./assets/0.png'),
  1: require('./assets/1.png'),
  2: require('./assets/2.png'),
  3: require('./assets/3.png'),
  4: require('./assets/4.png'),
};

const imagePionO = {
  0: require('./assets/0pion_o.png'),
  1: require('./assets/1pion_o.png'),
  2: require('./assets/2pion_o.png'),
  3: require('./assets/3pion_o.png'),
  4: require('./assets/3pion_o.png'),
};

const imagePionV = {
  0: require('./assets/0pion_v.png'),
  1: require('./assets/1pion_v.png'),
  2: require('./assets/2pion_v.png'),
  3: require('./assets/3pion_v.png'),
  4: require('./assets/3pion_v.png'),
};

const FinDeTour = (codePartie, whoAmI) => {
  const newTurn = whoAmI === 'v' ? 'o' : 'v';
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

const BoardGameView = ({
  whoAmI,
  currentGameData,
  codePartie,
  setShowBoardGameView,
}) => {
  const [turnstatus, setTurnstatus] = useState('pion');
  const numRows = 5;
  const numCols = 5;

  const getImageCase = (colIndex, rowIndex) => {
    return imageCase[currentGameData.board[colIndex][rowIndex]];
  };

  const getImagePion = (colIndex, rowIndex, type) => {
    if (type === 'o') {
      return imagePionO[currentGameData.board[colIndex][rowIndex]];
    } else {
      return imagePionV[currentGameData.board[colIndex][rowIndex]];
    }
  };


  const renderRow = (rowIndex) => (
    <View style={styles.row} key={rowIndex.toString()}>
      {Array.from({ length: numCols }).map((_, colIndex) => (
        <TouchableOpacity
          key={colIndex.toString()}
          onPress={() => {
            console.log(`Clicked at position [${rowIndex};${colIndex}]`);
            if (currentGameData.turn === whoAmI) {
              if (turnstatus === 'pion') {
                if (
                  currentGameData.turn ===
                  currentGameData.pion[colIndex][rowIndex]
                ) {
                  selectedCol = colIndex;
                  selectedRow = rowIndex;
                  setTurnstatus('selectPion');
                  console.log(turnstatus);
                }
              } else if (turnstatus === 'selectPion') {
                if (rowIndex == selectedRow && colIndex == selectedCol) {
                  selectedCol = '';
                  selectedRow = '';
                  setTurnstatus('pion');
                  console.log(turnstatus);
                } else if (
                  DansLeCarre(
                    rowIndex,
                    colIndex,
                    currentGameData,
                    turnstatus
                  )
                ) {
                  if (currentGameData.board[colIndex][rowIndex] == 3) {
                    setTurnstatus('win');

                    update(ref(db, 'games/' + codePartie), {
                      game_status: 'win',
                    }).catch((error) => {
                      alert(error);
                    });
                  } else {
                    update(ref(db, `games/${codePartie}/pion/${selectedCol}`), {
                      [selectedRow]: '',
                    }).catch((error) => {
                      alert(error);
                    });

                    update(ref(db, `games/${codePartie}/pion/${colIndex}`), {
                      [rowIndex]: whoAmI,
                    }).catch((error) => {
                      alert(error);
                    });

                    selectedRow = rowIndex;
                    selectedCol = colIndex;
                    setTurnstatus('case');
                  }
                }
              } else if (turnstatus === 'case') {
                if (
                  DansLeCarre(
                    rowIndex,
                    colIndex,
                    currentGameData,
                    turnstatus
                  ) &&
                  (selectedCol != colIndex || selectedRow != rowIndex)
                ) {
                  UpdateBoard(
                    codePartie,
                    rowIndex,
                    colIndex,
                    currentGameData
                  );
                  setTurnstatus('pion');
                  FinDeTour(codePartie, whoAmI);
                }
              }
            }
          }}
        >
          <View
            style={[
              styles.cell,
              {
                opacity:
                  (turnstatus === 'selectPion' ||
                    turnstatus === 'case') &&
                  !DansLeCarre(rowIndex, colIndex, currentGameData, turnstatus)
                    ? 0.5
                    : 1,
              },
            ]}
          >
            <Image
              source={getImageCase(colIndex, rowIndex)}
              style={[
                styles.image,
                colIndex !== 0 && { marginLeft: calcul },
              ]}
            />
            {currentGameData.pion[colIndex][rowIndex] !== '' && (
              <Image
                source={getImagePion(
                  colIndex,
                  rowIndex,
                  currentGameData.pion[colIndex][rowIndex]
                )}
                style={[
                  styles.overlayImage,
                  colIndex !== 0 && { marginLeft: calcul },
                  { position: 'absolute', top: 0, left: 0 },
                ]}
              />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentGameData.host_picture }}
        style={[styles.avatar, styles.hostAvatar]}
      />

      {Array.from({ length: numRows }).map((_, rowIndex) => renderRow(rowIndex))}

      <Image
        source={{ uri: currentGameData.guest_picture }}
        style={[styles.avatar, styles.guestAvatar]}
      />

      {currentGameData.turn === whoAmI && (
        <View style={styles.buttonContainer}>
          <Button
            title="Passer le tour"
            onPress={() => {
              console.log(whoAmI);
              console.log(currentGameData.board);
              FinDeTour(codePartie, whoAmI);
              setTurnstatus('pion'); // Reset the turnstatus after the button is pressed
            }}
          />
        </View>
      )}

      {currentGameData.game_status === 'win' && currentGameData.turn === whoAmI &&(
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Vous avez gagné !</Text>
          <Button
            title="Retourner au Menu"
            onPress={() => {
              
              setShowBoardGameView(false);
            }}
          />
        </View>
      )}

      {currentGameData.game_status === 'win' && currentGameData.turn != whoAmI && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Vous avez perdu...</Text>
          <Button
            title="Retourner au Menu"
            onPress={() => {
              ReturnToMenu();
              setShowBoardGameView(false);
            }}
          />
        </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 100,
    height: 70,
    width: 70,
    borderRadius: 75,
  },
  hostAvatar: {
    left: 10,
    borderColor: 'purple',
    borderWidth: 7,
  },
  guestAvatar: {
    right: 10,
    borderColor: 'orange',
    borderWidth: 7,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
  },
  overlayText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color:'white'
  },
});

export default BoardGameView;
