const THREE = require(`three`);
import Band from './Band.js';

class Hand {
  constructor() {
    this.mesh = new THREE.Object3D();
    this.mesh.name = `hand`;
    const material = new THREE.MeshPhongMaterial({
      color: 0xCC9B7C
    });



    const loader = new THREE.JSONLoader();
    loader.load(`../../assets/objects/hand.json`, geometry => {
    
      const object = new THREE.Mesh(geometry, material);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();      
      console.log(object.geometry.boundingBox.max.x - object.geometry.boundingBox.min.x);
      
      this.mesh.add(object);

      // box = object.geometry.boundingBox;
      
    });  



    
  }

  
  addBand(bandjes) {
    let pos = 0;
    bandjes.forEach(b => {
      const band = new Band(b, pos);
      this.mesh.add(band.mesh);  

      pos = pos - 80;
      
    });      
  }
}

export default Hand;