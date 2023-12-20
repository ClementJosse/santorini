import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, TextInput  } from 'react-native';
import 'expo-dev-client';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import Header from './Header';
import ZoneDeTexteEditable from './ZoneDeTexteEditable'

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [codePartie, setCodePartie] = useState('');
  const getCodePartie = () => {
    return codePartie;
  };
  const [showCreateGameView, setShowCreateGameView] = useState(false);
  const [showJoinGameView, setShowJoinGameView] = useState(false);
  
  GoogleSignin.configure({
    webClientId:'839487671755-gboic9mvgt87mkvtmvqqvi830n17k869.apps.googleusercontent.com',
  });

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

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
    setShowCreateGameView(true);
  };

  const revenirEnArriere = () => {
    setShowCreateGameView(false);
    setShowJoinGameView(false);
    console.log("menu")
  };

  const supprimerCode = () => {
    console.log("-",getCodePartie())
    let code = '';
    setCodePartie(code);
  };

  const goToJoinGameView = () => {
    setShowJoinGameView(true);
  };


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

  if (showCreateGameView) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
        <Button title="< Menu" onPress={() => { supprimerCode(); revenirEnArriere();  }} />
        </View>
        <Text style={styles.title}>Code de la partie:</Text>
        <Text style={styles.code}>{codePartie}</Text> 
      </View>
    );
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
          <Button title="< Menu" onPress={revenirEnArriere} />
        </View>
        <Text style={styles.title}>Code de la partie:</Text>
        {/* Passez la fonction de rappel au composant ZoneDeTexteEditable */}
        <ZoneDeTexteEditable onTextChange={handleCodeChange} />
        <View style={styles.buttonContainer}>
          <Button title="Join" onPress={() => console.log("Code entré depuis ZoneDeTexteEditable:", codePartie)} />
        </View>
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
        <Button title='Créer une partie' onPress={genererCodePartie} />
        <Text style={{ height: 50 }}>{''}</Text>
        <Button title='Rejoindre une partie' onPress={goToJoinGameView} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'column', // Utilisation de flexbox avec une disposition en colonne
    paddingHorizontal: 20,
    flex: 1, // Permet à la vue de s'étendre pour occuper tout l'espace vertical disponible
    justifyContent: 'center', // Centre les éléments horizontalement
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 10,
  },
  code: {
    fontSize: 18,
    marginBottom: 20,
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

