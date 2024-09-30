// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_APP_ID } from '@env';
import { getAuth, initializeAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: "calendar-event-adder-8907e.firebaseapp.com",
  projectId: "calendar-event-adder-8907e",
  storageBucket: "calendar-event-adder-8907e.appspot.com",
  messagingSenderId: "815623997635",
  appId: REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
export const firestore = getFirestore(app);