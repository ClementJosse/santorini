import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import 'expo-dev-client';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import Header from './Header';

export default function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  GoogleSignin.configure({
    webClientId:'839487671755-gboic9mvgt87mkvtmvqqvi830n17k869.apps.googleusercontent.com',
  });

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const onGoogleButtonPress = async () =>{
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    const user_sign_in = auth().signInWithCredential(googleCredential);
    user_sign_in.then((user) => {
      console.log(user);
    })
    .catch((error) =>{
      console.log(error);
    })
  }

  const signOut = async () => {
    try{
      await GoogleSignin.revokeAccess();
      await auth().signOut();
    } catch (error){
      console.error(error);
    }
  }

  function genererCodePartie() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
  
    for (let i = 0; i < 5; i++) {
      const caractereAleatoire = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      code += caractereAleatoire;
    }
    return code;
  }

  if (initializing) return null;

  if(!user){
    return (
      <View style={styles.container}>
        <Header/>
        <GoogleSigninButton
          style={{ width:300, height:65, marginTop:300}}
          onPress={onGoogleButtonPress}
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Conteneur supérieur */}
      <View style={styles.upperContainer}>
        {/* Bouton à gauche */}
        <View style={styles.buttonContainer}>
          <Button title='Se Déconnecter' onPress={signOut} />
        </View>
  
        {/* Conteneur pour l'image et le nom au centre */}
        <View style={styles.profileContainer}>
          {/* Image centrée au-dessus du nom */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: user.photoURL }}
              style={{ height: 50, width: 50, borderRadius: 75 }}
            />
          </View>
  
          {/* Nom centré en dessous de l'image */}
          <Text style={styles.text}>{user.displayName}</Text>
        </View>
      </View>
  
      {/* Conteneur inférieur pour les boutons */}
      <View style={styles.lowerContainer}>
        <Button title='Créer une partie' onPress={() => console.log(genererCodePartie())} />
        <Text style={{height: 50}}>{""}</Text>
        <Button title='Rejoindre une partie' onPress={() => console.log('Rejoindre une partie')} />
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
});

