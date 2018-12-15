const THREE = require(`three`);

class Band {
  constructor(b, pos) {
    let arm, band;

    this.mesh = new THREE.Object3D();
    this.mesh.name = `bandArm`;    
    this.mesh.position.set(pos, 0, 0);

    


    //create Arm

    const armLoader = new THREE.JSONLoader();
    armLoader.load(`../../assets/objects/ArmPiece.json`, geometry => {
      const armMaterial = new THREE.MeshPhongMaterial({
        color: 0xCC9B7C,
        name: `armMat`
      });
      arm = new THREE.Mesh(geometry, armMaterial);
      arm.name = `arm`;
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();      

      this.mesh.add(arm);

    });


    //create Band

    const bandLoader = new THREE.JSONLoader();
    bandLoader.load(`../../assets/objects/bandje.json`, geometry => {
      const texture = new THREE.TextureLoader().load(`../../assets/img/bandTexture.jpg`);
      const bandMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        name: `bandMat`
      });
      band = new THREE.Mesh(geometry, bandMaterial);
      band.name = `band`;
      band.info = b;
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();   
      
      this.mesh.add(band); 
    
    });

  }
}

export default Band;