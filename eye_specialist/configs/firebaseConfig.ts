import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvQ9M0eBGWAJeZUlfF5C3gFwFu55gm6U8",
  authDomain: "eyespecialist-fbda6.firebaseapp.com",
  projectId: "eyespecialist-fbda6",
  storageBucket: "eyespecialist-fbda6.firebasestorage.app",
  messagingSenderId: "1049273502994",
  appId: "1:1049273502994:web:d6d3cd012c56f1eaa477cb",
  measurementId: "G-7CH16L76SZ"
};

// ✅ Only initialize Firebase once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ✅ Export commonly used Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { firebase, auth, db, storage };