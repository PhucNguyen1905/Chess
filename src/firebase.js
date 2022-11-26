import firebase from "firebase/app";
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBKiSnCnGg4T4fP-ps15JhZU50nZ5Ys0wI",
    authDomain: "chess-c4026.firebaseapp.com",
    projectId: "chess-c4026",
    storageBucket: "chess-c4026.appspot.com",
    messagingSenderId: "594022607140",
    appId: "1:594022607140:web:9b09317d8e0c70dc16abb1"
  };
  
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore()
export const auth = firebase.auth()
export default firebase