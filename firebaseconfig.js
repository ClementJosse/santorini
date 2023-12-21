
import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";

const firebaseConfig = {
    apiKey: 'AIzaSyCh-WBJmUSDSxqvJ8b2QprP5oeSBrPYxMc',
    authDomain: 'santorini-1218d.firebaseapp.com',
    databaseURL: 'https://santorini-1218d-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'santorini-1218d',
    storageBucket: 'santorini-1218d.appspot.com',
    messagingSenderId: '839487671755',
    appId: '1:839487671755:android:6d87e86c4b1b2fbb2dfa4e',
  };
  
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
  