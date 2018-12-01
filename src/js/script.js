//Als er een fout zit in de facebook login is dit waarschijnlijk
//de URL die moet aangepast worden in Facebook developer site

import firebase from 'firebase';


const config = {
  apiKey: `AIzaSyCxaRTBqAwRJQ5objXspjTbxBcTp-YnARg`,
  authDomain: `expweb-9ec96.firebaseapp.com`,
  databaseURL: `https://expweb-9ec96.firebaseio.com`,
  projectId: `expweb-9ec96`,
  storageBucket: `expweb-9ec96.appspot.com`,
  messagingSenderId: `191925832838`
};
firebase.initializeApp(config);
const db = firebase.database();





const $welcome = document.querySelector(`.welcome`);
const $email = document.querySelector(`.email`);
const $password = document.querySelector(`.password`);
const $login = document.querySelector(`.login`);
const $signup = document.querySelector(`.signup`);
const $logout = document.querySelector(`.logout`);
const $facebook = document.querySelector(`.facebook`);
const $user = document.querySelector(`.user`);
const $band = document.querySelector(`.band`);
const $calender = document.querySelector(`.calender`);
const $bandSubmit = document.querySelector(`.band-button`);




const provider = new firebase.auth.FacebookAuthProvider();
//provider.addScope(`email`);

$facebook.addEventListener(`click`, () => {

  const promise = firebase.auth().signInWithPopup(provider);

  promise.catch(e => console.log(e.message));



});

$login.addEventListener(`click`, () => {

  //get email and pass
  const email = $email.value;
  const password = $password.value;
  const auth = firebase.auth();

  //sign in
  const promise = auth.signInWithEmailAndPassword(email, password);

  promise.catch(e => console.log(e.message));

});

//signup
$signup.addEventListener(`click`, () => {

  const email = $email.value;
  const password = $password.value;
  const auth = firebase.auth();

  const promise = auth.createUserWithEmailAndPassword(email, password);

  promise
    .then(user => console.log(user))
    .catch(e => console.log(e.message));
});

$logout.addEventListener(`click`, () => {
  firebase.auth().signOut();
});

//Realtime listener

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    console.log(firebaseUser);
    $logout.classList.remove(`hide`);
    $signup.classList.add(`hide`);
    $login.classList.add(`hide`);
    $facebook.classList.add(`hide`);
    $email.classList.add(`hide`);
    $password.classList.add(`hide`);
    $band.classList.remove(`hide`);
    $bandSubmit.classList.remove(`hide`);
    $bandSubmit.classList.remove(`hide`);

    welcome(firebaseUser);
  } else {
    $welcome.innerHTML = ``;
    $logout.classList.add(`hide`);
    $signup.classList.remove(`hide`);
    $login.classList.remove(`hide`);
    $facebook.classList.remove(`hide`);
    $email.classList.remove(`hide`);
    $password.classList.remove(`hide`);
    $band.classList.add(`hide`);
    $bandSubmit.classList.add(`hide`);
    console.log(`not logged`);
  }
});

const welcome = user => {
  if (user.displayName) {
    $welcome.innerHTML = `Welgekomen ${user.displayName}`;
  } else {
    $welcome.innerHTML = `Welgekomen ${user.email}`;
  }

  databaseUser(user);
  readData(user);



};

const databaseUser = userData => {

  $bandSubmit.addEventListener(`click`, () => {

    const bandName = $band.value;

    console.log($calender);

    const newPostKey = db.ref().push().key;

    db.ref(`users/${userData.uid}/${newPostKey}`).set({
      band: bandName
    });

  });


  $user.innerHTML = userData.uid;
};

const readData = user => {
  const starCountRef = db.ref(`users/${user.uid}`);
  console.log(starCountRef);

  starCountRef.on(`value`, snap =>

    console.log(snap.val())

  );
};



};

