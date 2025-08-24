import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIu0pmX_36vL1uMzoLg3cxacxaMqt_bbc",
  authDomain: "projeto-lindo-nono-ano.firebaseapp.com",
  projectId: "projeto-lindo-nono-ano",
  storageBucket: "projeto-lindo-nono-ano.appspot.com",
  messagingSenderId: "155172461147",
  appId: "1:155172461147:web:18eb30fca82b5d2c44bd7e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };