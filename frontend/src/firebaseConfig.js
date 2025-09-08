// // src/firebaseConfig.js
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyCUECt6_LnqWVHaCvFsYGOYyVL4MA9wO_o",
//   authDomain: "chitfund-fecfe.firebaseapp.com",
//   projectId: "chitfund-fecfe",
//   storageBucket: "chitfund-fecfe.appspot.com",
//   messagingSenderId: "327253674784",
//   appId: "1:327253674784:web:53895617f66f8d13cca545",
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);


//AIzaSyCUECt6_LnqWVHaCvFsYGOYyVL4MA9wO_o
// In your Firebase initialization
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCUECt6_LnqWVHaCvFsYGOYyVL4MA9wO_o",
  authDomain: "chitfund-fecfe.firebaseapp.com",
  projectId: "chitfund-fecfe",
  storageBucket: "chitfund-fecfe.appspot.com",
  messagingSenderId: "327253674784",
  appId: "1:327253674784:web:53895617f66f8d13cca545",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});