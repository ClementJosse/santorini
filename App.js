// Pour lancer l'application depuis le terminal :
// npx expo start

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, TextInput ,TouchableOpacity,Clipboard} from 'react-native';
import 'expo-dev-client';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import ZoneDeTexteEditable from './ZoneDeTexteEditable';
import { getDatabase, ref, set, child, get, update, remove, onValue} from "firebase/database";
import { db } from './firebaseconfig';
import BoardGameView from './BoardGameView';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [codePartie, setCodePartie] = useState('');
  const [currentGameData, setCurrentGameData] = useState(null);
  
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = () => {
    Clipboard.setString(codePartie);
  };

  const getCodePartie = () => {
    return codePartie;
  };
  const [showCreateGameView, setShowCreateGameView] = useState(false);
  const [showJoinGameView, setShowJoinGameView] = useState(false);
  const [showWaitingRoom, setShowWaitingRoomView] = useState(false);
  const [showBoardGameView, setShowBoardGameView] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [whoAmI, setWhoAmI] = useState('')
  
  GoogleSignin.configure({
    webClientId:'839487671755-gboic9mvgt87mkvtmvqqvi830n17k869.apps.googleusercontent.com',
  });

  

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    if (showWaitingRoom || showCreateGameView || showBoardGameView ) {
      const fetchGameData = async () => {
        const db = getDatabase();
        const gameDataRef = ref(db, 'games/' + codePartie);
  
        onValue(gameDataRef, (snapshot) => {
          const data = snapshot.val();
          if (data === null) {
            setCurrentGameData(null);
            setIsDataFetched(false);
            setShowCreateGameView(false);
            setShowJoinGameView(false);
            setShowWaitingRoomView(false);
            setShowCreateGameView(false);
            console.log("La référence a été supprimée !");
          } else {
            setCurrentGameData(data);
            setIsDataFetched(true);
            console.log("..");
          }
        });
      };
  
      fetchGameData(); // Appelez la fonction fetchGameData
    }

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [showWaitingRoom,showCreateGameView,showBoardGameView]);

  const onGoogleButtonPress = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userSignIn = auth().signInWithCredential(googleCredential);
    userSignIn.then((user) => {
      console.log(user);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await auth().signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const genererCodePartie = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    for (let i = 0; i < 5; i++) {
      const caractereAleatoire = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      code += caractereAleatoire;
    }
    setCodePartie(code);
    console.log("+",code);

    //POST DATA
    set(ref(db, 'games/' + code), {
      host_name: user.displayName,
      host_picture : user.photoURL,
      game_status : "waiting",
      guest_name:'',
      guest_picture:'',
      turn:'v',
    }).catch((error) => {
      alert(error);
    });

  };

  const supprimerCode = () => {
    let code = getCodePartie()
    console.log("-",code)
    
    // DELETE DATA
    //remove(ref(db, 'games/' + code));
    code = '';
    setCodePartie(code);

  };

  const JoinGame = (codePartie) => {
    
    // GET DATA
    const dbRef = ref(getDatabase());
    get(child(dbRef, 'games/' + codePartie)).then((snapshot) => {
      if (snapshot.exists()) {
        const gameData = snapshot.val();
        const gameStatus = gameData.game_status;
        
        console.log("Read data: "+codePartie," Status: "+ gameStatus);

        if(gameStatus=="waiting"){
          
          console.log("update game")
          update(ref(db, 'games/' + codePartie), {
            game_status : "filled",
            guest_name: user.displayName,
            guest_picture: user.photoURL,
          }).catch((error) => {
            alert(error);
          });

          setShowWaitingRoomView(true);
          setShowJoinGameView(false);
        }
        else{
          alert("la partie "+codePartie+" est occupée");
        }
      } else {
        alert("la partie "+codePartie+" n'existe pas");
      }

    }).catch((error) => {
      console.error(error);
    });
  };
  

  const QuitterGame = () => {
    update(ref(db, 'games/' + codePartie), {
      game_status : "waiting",
      guest_name: '',
      guest_picture: '',
    }).catch((error) => {
      alert(error);
    });
  }



  if (initializing) return null;

  if (!user) {
    return (
      <View style={styles.container}>
        <Header />
        <GoogleSigninButton
          style={{ width: 300, height: 65, marginTop: 300 }}
          onPress={onGoogleButtonPress}
        />
      </View>
    );
  }

  if (showCreateGameView && isDataFetched) {
    if(currentGameData.game_status=='waiting'){
      return (
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
          <Button title="< Menu" onPress={() => { supprimerCode(); setShowCreateGameView(false); setWhoAmI(''); setIsDataFetched(false); console.log("menu") }} />
          </View>
          <Text style={styles.title}>Code de la partie:</Text>
          <TouchableOpacity onPress={() => copyToClipboard()}>
            <Text style={styles.code}>{codePartie}</Text>
          </TouchableOpacity>
          <View style={[styles.upperContainer]}>
            <View style={styles.profileContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ height: 50, width: 50, borderRadius: 75 }}
                />
              </View>
              <Text style={styles.text}>{user.displayName}</Text>
            </View>
          </View>
        </View>
      );
    }
    else{
      console.log("là")

      const initPlateau = [];
      for (let i = 0; i < 5; i++) {
        initPlateau[i] = [];
        for (let j = 0; j < 5; j++) {
          initPlateau[i][j] = 0;
        }
      }

      const initPion = [];
      for (let i = 0; i < 5; i++) {
        initPion[i] = [];
        for (let j = 0; j < 5; j++) {
          if((i==1 && j==3 ) || (i==3 && j == 1)){
            initPion[i][j] = "v";
          }
          else if ((i==3 && j==3 ) || (i==1 && j == 1)){
            initPion[i][j] = "o";
          }
          else{
            initPion[i][j] = '';
          }
        }
      }
      

      return(
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
          <Button title="< Menu" onPress={() => { supprimerCode(); setShowCreateGameView(false); setWhoAmI(''); console.log("menu") }} />
          </View>
          <Text style={styles.title}>Code de la partie:</Text>
          <TouchableOpacity onPress={() => copyToClipboard()}>
            <Text style={styles.code}>{codePartie}</Text>
          </TouchableOpacity>
          <View style={[styles.versusContainer]}>
            <View style={styles.profileContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ height: 50, width: 50, borderRadius: 75 }}
                />
              </View>
              <Text style={styles.text}>{user.displayName}</Text>
            </View>
            <View style={styles.profileContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: currentGameData.guest_picture }}
                  style={{ height: 50, width: 50, borderRadius: 75 }}
                />
              </View>
              <Text style={styles.text}>{currentGameData.guest_name}</Text>
            </View>   
          </View>
          <View style={styles.buttonContainer}>
          <Button title="Lancer la partie" onPress={() => { 
            console.log("lancer la partie");
            update(ref(db, 'games/' + codePartie), {
              game_status : "running",
              board : initPlateau,
              pion : initPion,
              }).catch((error) => {alert(error);});
            setShowBoardGameView(true);
            setShowCreateGameView(false);
          }}/>
          </View>
        </View>
      );
    }
  }

  if (showJoinGameView) {
    // Créez une fonction de rappel pour récupérer le code de la zone de texte
    const handleCodeChange = (nouveauCode) => {
      // Mettez à jour l'état avec le nouveau code
      setCodePartie(nouveauCode);
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button title="< Menu" onPress={() => {setShowJoinGameView(false); setWhoAmI(''); console.log("menu")}} />
        </View>
        <Text style={styles.title}>Entrez le code de la partie:</Text>
        {/* Passez la fonction de rappel au composant ZoneDeTexteEditable */}
        <ZoneDeTexteEditable onTextChange={handleCodeChange} />
        <View style={styles.buttonContainer}>
          <Button title="Rejoindre" onPress={() => {JoinGame(codePartie);}} />
        </View>
      </View>
    );
  }
  
  if (showWaitingRoom && isDataFetched) {
    if(currentGameData.game_status=="running"){
      setShowWaitingRoomView(false);
      setShowBoardGameView(true);
    }

    return (
      <View style={[styles.container]}>
        <View>
          <View style={styles.buttonContainer}>
            <Button
              title="< Retour"
              onPress={() => {
                QuitterGame(codePartie);
                setShowWaitingRoomView(false);
                setShowJoinGameView(true);
                setIsDataFetched(false)
              }}
            />
          </View>
        </View>
        <Text style={styles.title}>Code de la partie:</Text>
        <TouchableOpacity onPress={() => copyToClipboard()}>
          <Text style={styles.code}>{codePartie}</Text>
        </TouchableOpacity>
        <View style={[styles.versusContainer]}>
          <View style={styles.profileContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentGameData.host_picture }}
                style={{ height: 50, width: 50, borderRadius: 75 }}
              />
            </View>
            <Text style={styles.text}>{currentGameData.host_name}</Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentGameData.guest_picture }}
                style={{ height: 50, width: 50, borderRadius: 75 }}
              />
            </View>
            <Text style={styles.text}>{currentGameData.guest_name}</Text>
          </View>   
        </View>
      </View>
    );
  }

  if (showBoardGameView && isDataFetched) {
    return (
      <View style={[styles.container]}>
        <BoardGameView whoAmI={whoAmI} currentGameData={currentGameData} codePartie={codePartie} setShowBoardGameView={setShowBoardGameView}/>
      </View>
    );
  }
  
  

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.buttonContainer}>
          <Button title='Se Déconnecter' onPress={signOut} />
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: user.photoURL }}
              style={{ height: 50, width: 50, borderRadius: 75 }}
            />
          </View>

          <Text style={styles.text}>{user.displayName}</Text>
        </View>
      </View>
      
      <View style={styles.lowerContainer}>
        <Button title='Créer une partie' onPress={() => {genererCodePartie(); setShowCreateGameView(true); setWhoAmI('v')}} />
        <Text style={{ height: 50 }}>{''}</Text>
        <Button title='Rejoindre une partie' onPress={() => {setShowJoinGameView(true); setWhoAmI('o')}} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'column', // Utilisation de flexbox avec une disposition en colonne
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1, // Permet à la vue de s'étendre pour occuper tout l'espace vertical disponible
    justifyContent: 'center', // Centre les éléments horizontalement
    backgroundColor: '#84D2F9',
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'flex-start',
  },
  profileContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lowerContainer: {
    marginTop: 200, // Ajout d'une marge entre les conteneurs supérieur et inférieur
    alignItems: 'center',
    marginBottom: 200
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  code: {
    fontSize: 40,
    marginBottom: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  

});

