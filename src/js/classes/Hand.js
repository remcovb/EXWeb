const THREE = require(`three`);
import Band from './Band.js';

class Hand {
  constructor() {
    this.mesh = new THREE.Object3D();
    const material = new THREE.MeshPhongMaterial({
      color: 0xCC9B7C
    });

    const loader = new THREE.JSONLoader();
    loader.load(`../../assets/objects/hand.json`, geometry => {
    
      const object = new THREE.Mesh(geometry, material);
      geometry.computeVertexNormals();

      this.mesh.add(object);
      console.log(object.position);
      
    });
  }
  addBand(bandjes) {
    //console.log(this.mesh.matrixWorld);

    let pos = 0;
    bandjes.forEach(b => {
      const band = new Band(b, pos);
      console.log(band.mesh.position);
      this.mesh.add(band.mesh);  

      pos = pos - 140;
      
    });


    // console.log(band.mesh);
      
  }
}

export default Hand;