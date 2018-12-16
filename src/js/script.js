const THREE = require(`three`);
const firebase = require(`firebase`);
const WaveSurfer = require(`wavesurfer`);

import Hand from './classes/Hand.js';

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
  intersects,
  finalFile,
  file,
  keydata,
  dataFromUser,
  isPlaying = false,
  fileExists;

let hand, totalLength;

const handSize = 615.891;

let hemisphereLight, shadowLight;

/*Webaudio*/

const concertCanvas = document.querySelector(`.concert-canvas`);

let concertDetail,
  waveCanvas,
  wavesurfer,
  detailBandName,
  detailBandPic,
  storageReff,
  concertData,
  concertTitle,
  wave,
  locationData;

const getJSON = (url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open(`GET`, url, true);
  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhr.withCredentials = true;

  const allHeaders = xhr.getAllResponseHeaders();
  console.log(allHeaders);

  xhr.responseType = `jsonp`;
  xhr.onload = () => {
    const status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

const parseIt = data => {
  const result = JSON.parse(data);

  if (result.resultCount != 0) {
    fileExists = true;
    return result.results[0].previewUrl;
  } else {
    console.log(`artist not in itunes library`);
    fileExists = false;
    return;
  }
};

const aantalBandjes = [];

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

const $home = document.querySelector(`.login-container`);
const $welcome = document.querySelector(`.welcome`);
const $email = document.querySelector(`.email`);
const $password = document.querySelector(`.password`);
const $login = document.querySelector(`.login`);
const $signup = document.querySelector(`.signup`);
const $logout = document.querySelector(`.logout`);
const $facebook = document.querySelector(`.facebook`);
const $band = document.querySelector(`.band`);
const $calender = document.querySelector(`.calender`);
const $bandSubmit = document.querySelector(`.band-button`);
const $upload = document.querySelector(`.upload`);
const $location = document.querySelector(`.location`);
const $signedin = document.querySelector(`.signedin`);
const $emailForm = document.querySelector(`.formval-email`);
const $passwordForm = document.querySelector(`.formval-password`);

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

  promise.catch(e => formvalidation(e));
});

const formvalidation = e => {
  console.log(e.message);
  if (e.message === 'The email address is badly formatted.') {
    $emailForm.innerHTML = 'Email is al gebruikt of fout ingevoerd';
  } else {
    $emailForm.innerHTML = '';
  }

  if (
    e.message ===
    'The password is invalid or the user does not have a password.'
  ) {
    $passwordForm.innerHTML = 'Gelieve je paswoord invullen';
  } else {
    $passwordForm.innerHTML = '';
  }
};

//signup
$signup.addEventListener(`click`, () => {
  const email = $email.value;
  const password = $password.value;
  const auth = firebase.auth();

  const promise = auth.createUserWithEmailAndPassword(email, password);

  promise.then(user => console.log(user)).catch(e => console.log(e.message));
});

$logout.addEventListener(`click`, () => {
  firebase.auth().signOut();
  location.reload();
});

//Realtime listener

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    //  console.log(firebaseUser);
    $home.classList.add(`hide`);
    $logout.classList.remove(`hide`);
    $signup.classList.add(`hide`);
    $login.classList.add(`hide`);
    $facebook.classList.add(`hide`);
    $email.classList.add(`hide`);
    $password.classList.add(`hide`);
    $band.classList.remove(`hide`);
    $bandSubmit.classList.remove(`hide`);
    $bandSubmit.classList.remove(`hide`);
    $calender.classList.remove(`hide`);
    $upload.classList.remove(`hide`);
    $location.classList.remove(`hide`);
    $signedin.classList.remove(`hide`);

    welcome(firebaseUser);
  } else {
    $home.classList.remove(`remove`);
    $welcome.innerHTML = ``;
    $logout.classList.add(`hide`);
    $signup.classList.remove(`hide`);
    $login.classList.remove(`hide`);
    $facebook.classList.remove(`hide`);
    $email.classList.remove(`hide`);
    $password.classList.remove(`hide`);
    $band.classList.add(`hide`);
    $bandSubmit.classList.add(`hide`);
    $calender.classList.add(`hide`);
    $upload.classList.add(`hide`);
    $location.classList.add(`hide`);
    $signedin.classList.add(`hide`);
    console.log(`not logged`);
  }
});

const welcome = user => {
  if (user.displayName) {
    $welcome.innerHTML = `Welkom ${user.displayName}`;
  } else {
    $welcome.innerHTML = `Welkom ${user.email}`;
  }

  databaseUser(user);

  readData(user);
};

$upload.addEventListener(`change`, e => {
  file = e.target.files[0];

  const fileName = file.name.split(` `).join(``);

  finalFile = fileName;

  console.log(fileName);
});

const databaseUser = userData => {
  dataFromUser = userData;
  $bandSubmit.addEventListener(`click`, e => {
    console.log(e);
    e.preventDefault();

    const bandName = $band.value;
    const date = $calender.value;
    const location = $location.value;

    console.log(finalFile);
    console.log(file);

    const storage = firebase.storage();

    const storageRef = storage.ref(`${userData.uid}/${finalFile}`);

    storageRef.child(`${userData.uid}/${finalFile}`);
    console.log(finalFile);
    console.log(file);

    storageRef.put(file);

    console.log($calender);

    const newPostKey = db.ref().push().key;

    db.ref(`users/${userData.uid}/${newPostKey}`).set({
      band: bandName,
      date: date,
      location: location,
      img: finalFile
    });

    // ;
  });
};

const readData = user => {
  const starCountRef = db.ref(`users/${user.uid}`);

  starCountRef.on(`value`, snap => {
    for (const key in snap.val()) {
      keydata = snap.val()[key];
      aantalBandjes.push(keydata);
    }

    threeInit();
    console.log(aantalBandjes);
  });
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
  HEIGHT = 600;

  scene = new THREE.Scene();

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  near = 1;
  far = 10000;
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);

  //camera positioneren
  camera.position.x = 20;
  camera.position.y = 100;
  camera.position.z = 160;

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
  hemisphereLight = new THREE.AmbientLight(0xaaaaaa, 0x000000, 0.9);

  //shadowlight
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

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
  hand.mesh.scale.set(0.25, 0.25, 0.25);
  hand.mesh.rotation.x = -Math.PI / 2;
  hand.mesh.position.y = 100;
  scene.add(hand.mesh);
  addBandjes();
};

const addBandjes = () => {
  console.log(aantalBandjes.length);
  hand.addBand(aantalBandjes);

  totalLength = (handSize + aantalBandjes.length * 80) / 4;
  console.log(totalLength);

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

  if (camera.position.x <= -totalLength + 150) {
    camera.position.x = -totalLength + 150;
  }
};

const loop = () => {
  requestAnimationFrame(loop);

  renderer.render(scene, camera);
};

const projectorStart = () => {
  rayCaster = new THREE.Raycaster();

  mouseVector = new THREE.Vector3();

  container.addEventListener(`mousemove`, onMouseMove);
};

const onMouseMove = e => {
  //console.log(e);

  mouseVector.x = (e.layerX / renderer.domElement.clientWidth) * 2 - 1;
  mouseVector.y = -(e.layerY / renderer.domElement.clientHeight) * 2 + 1;

  rayCaster.setFromCamera(mouseVector, camera);
  intersects = rayCaster.intersectObjects(hand.mesh.children, true);

  if (intersects.length !== 0) {
    document.addEventListener(`click`, detailEvent);
  } else {
    return;
  }
};

const detailEvent = () => {
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.name === `band`) {
      openConcertDetails(intersects[i].object.info);
      break;
    }
  }
};

const openConcertDetails = concert => {
  if (concertCanvas.children.length > 0) {
    concertDetail.remove();
  }

  getSongUrl(concert);
};

const getSongUrl = band => {
  const search = `https://itunes.apple.com/search?term=${band.band.replace(
    / /g,
    '+'
  )}&limit=1`;
  getJSON(search, (err, data) => {
    if (err !== null) {
      console.log(`Something went wrong: ${err}`);
    } else {
      const prevFileLink = parseIt(data);
      createWave(prevFileLink, band);
    }
  });
};

const createWave = (songLink, concert) => {
  console.log(concert.img);

  concertDetail = document.createElement(`div`);
  concertDetail.classList.add(`concert-detail`);
  concertCanvas.appendChild(concertDetail);

  concertTitle = document.createElement(`div`);
  concertTitle.classList.add(`concert-titles`);
  concertDetail.appendChild(concertTitle);

  wave = document.createElement(`div`);
  wave.classList.add(`wave-container`);
  concertDetail.appendChild(wave);

  detailBandName = document.createElement(`h2`);
  detailBandName.classList.add(`detail-band-name`);
  detailBandName.innerHTML = concert.band;
  concertTitle.appendChild(detailBandName);

  concertData = document.createElement(`p`);
  concertData.classList.add(`concert-date`);
  concertData.innerHTML = concert.date;
  concertTitle.appendChild(concertData);

  locationData = document.createElement(`p`);
  locationData.classList.add(`concert-location`);
  locationData.innerHTML = concert.location;

  detailBandPic = document.createElement(`img`);
  detailBandPic.classList.add(`img-selected`);

  const storage = firebase.storage();
  //const pathReference = storage.ref(`${dataFromUser.uid}/${concert.img}`);

  storageReff = storage.ref(`${dataFromUser.uid}`);

  storageReff
    .child(concert.img)
    .getDownloadURL()
    .then(url => {
      detailBandPic.src = url;
    });

  wave.appendChild(detailBandPic);

  waveCanvas = document.createElement(`div`);
  waveCanvas.setAttribute('style', 'width: 400px');

  waveCanvas.classList.add(`wave-form`);
  waveCanvas.id = `waveform`;

  const playPauseBtn = document.createElement(`a`);
  playPauseBtn.classList.add(`play-pause`);
  playPauseBtn.classList.add(`btn`);
  playPauseBtn.innerHTML = `&#9654;`;

  wave.appendChild(waveCanvas);

  if (fileExists === true) {
    wavesurfer = WaveSurfer.create({
      container: `#waveform`,
      progressColor: `#4a00e0`,
      barWidth: 3
    });

    wavesurfer.load(songLink);

    wavesurfer.on(`ready`, () => {
      waveCanvas.appendChild(playPauseBtn);
      playPauseBtn.addEventListener(`click`, e => {
        wavesurfer.playPause();

        if (isPlaying === false) {
          isPlaying = true;
          playPauseBtn.innerHTML = `&#10073; &#10073;`;
        } else {
          isPlaying = false;
          playPauseBtn.innerHTML = `&#9654;`;
        }
      });
    });
  }
};

const init = () => {};

init();
