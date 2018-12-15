// const THREE = require(`three`);
// import Hand from './classes/Hand.js';
// import firebase from 'firebase';

// import Band from './classes/Band.js';



let container,
  renderer,
  camera,
  fieldOfView,
  aspectRatio,
  near,
  far,
  scene,
  WIDTH,
  HEIGHT,
  rayCaster,
  mouseVector,
  intersects;

let hand, totalLength;
const handSize = 615.891;

let hemisphereLight, shadowLight;

const aantalBandjes = [
  {
    concertName: `concert1`,
    concertRating: `good`
  },
  {
    concertName: `concert2`,
    concertRating: `good`
  }];




//FIREBASE
//Als er een fout zit in de facebook login is dit waarschijnlijk
//de URL die moet aangepast worden in Facebook developer site

// import {loopback} from 'ip';


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
    //  console.log(firebaseUser);
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
  threeInit();
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


//THREEJS

const threeInit = () => {
  createScene();
  createLights();
  createHand();

  loop();

};

const createScene = () => {
  //welcomeDivHeight = document.querySelector(`.welcomeDiv`).innerHeight;
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;


  scene = new THREE.Scene();

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  near = 1;
  far = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    near,
    far
  );

  //camera positioneren
  camera.position.x = 20;
  camera.position.y = 100;
  camera.position.z = 200;

  //renderer maken
  renderer = new THREE.WebGLRenderer({
    // Allow transparency to show the gradient background
    // we defined in the CSS
    alpha: true,

    // Activate the anti-aliasing; this is less performant,
    // but, as our project is low-poly based, it should be fine :)
    antialias: true

  });

  //set size of renderer
  renderer.setSize(WIDTH, HEIGHT);

  //enable shadow rendering

  container = document.querySelector(`.canvas`);
  container.appendChild(renderer.domElement);

  window.addEventListener(`resize`, handleWindowResize, false);
  projectorStart();
};

const handleWindowResize = () => {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
};

const createLights = () => {
  //hemispherelight maken
  hemisphereLight = new THREE.AmbientLight(0xaaaaaa, 0x000000, .9);

  //shadowlight
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  //positie lichtbron
  shadowLight.position.set(150, 350, 350);

  //shadowcasting toelaten
  shadowLight.castShadow = true;

  //resolution definen
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  //light activeren
  scene.add(hemisphereLight);
  scene.add(shadowLight);
};

const createHand = () => {
  hand = new Hand();
  hand.mesh.scale.set(.25, .25, .25);
  hand.mesh.rotation.x = - Math.PI / 2;
  hand.mesh.position.y = 100;
  scene.add(hand.mesh);
  addBandjes();
};

const addBandjes = () => {
  hand.addBand(aantalBandjes);


  totalLength = (handSize + (aantalBandjes.length * 80)) / 4;
  //console.log(totalLength);


  if (totalLength > 150) {
    container.addEventListener(`wheel`, handleScroll);
  }
};

const handleScroll = e => {
  e.preventDefault();
  camera.position.x -= event.deltaY * 0.05;


  if (camera.position.x >= 40) {
    camera.position.x = 40;
  }

  if (camera.position.x <= - totalLength + 150) {
    camera.position.x = - totalLength + 150;
  }


};

const loop = () => {
  requestAnimationFrame(loop);

  renderer.render(scene, camera);

};

const projectorStart = () => {
  rayCaster = new THREE.Raycaster();
  //console.log(rayCaster);

  mouseVector = new THREE.Vector3();
  //console.log(mouseVector);


  container.addEventListener(`mousemove`, onMouseMove);
};

const onMouseMove = e => {
  //console.log(e);

  mouseVector.x = (e.layerX / renderer.domElement.clientWidth) * 2 - 1;
  mouseVector.y = - (e.layerY / renderer.domElement.clientHeight) * 2 + 1;

  rayCaster.setFromCamera(mouseVector, camera);
  intersects = rayCaster.intersectObjects(hand.mesh.children, true);
  //console.log(hand.mesh.children);

  //console.log(intersects);

  if (intersects.length !== 0) {
    document.addEventListener(`click`, detailEvent);
  } else {
    return;
  }



};

const detailEvent = () => {
  console.log(`click`);

  console.log(intersects);

  for (let i = 0;i < intersects.length;i ++) {
    if (intersects[i].object.name === `band`) {
      console.log(`found`);
      console.log(intersects[i].object.info);

      break;
    }
  }
};

