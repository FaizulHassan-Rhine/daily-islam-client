/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDl8xDmL7CVF3LnBwDYCivse1gxBTouY7U",
  authDomain: "daily-islam-13aca.firebaseapp.com",
  projectId: "daily-islam-13aca",
  storageBucket: "daily-islam-13aca.firebasestorage.app",
  messagingSenderId: "620172065624",
  appId: "1:620172065624:web:a363db91e7db00b723832d",
});

firebase.messaging();
