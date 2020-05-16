import { Component, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

 /*
  * Cloth Simulation using a relaxed constraints solver
  */

// Suggested Readings

// Advanced Character Physics by Thomas Jakobsen Character
// http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
// http://en.wikipedia.org/wiki/Cloth_modeling
// http://cg.alexandra.dk/tag/spring-mass-system/
// Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf

class Particle {
  position = new THREE.Vector3();
  previous = new THREE.Vector3();
  original = new THREE.Vector3();
  a = new THREE.Vector3( 0, 0, 0 ); // acceleration
  mass = 0.1;
  invMass = 1 / this.mass;
  tmp = new THREE.Vector3();
  tmp2 = new THREE.Vector3();
  restDistance = 25;
  xSegs = 10;
  ySegs = 10;
  DAMPING = 0.03;
  DRAG = 1 - this.DAMPING;
  clothFunction = this.plane( this.restDistance * this.xSegs, this.restDistance * this.ySegs );

  constructor( x, y, z, mass ) {
    this.clothFunction( x, y, this.position ); // position
    this.clothFunction( x, y, this.previous ); // previous
    this.clothFunction( x, y, this.original );
  }

  // Force -> Acceleration
  addForce = ( force ) => {
    this.a.add(
      this.tmp2.copy( force ).multiplyScalar( this.invMass )
    );
  }

  // Performs Verlet integration
  integrate = ( timesq ) => {
    const newPos = this.tmp.subVectors( this.position, this.previous );
    newPos.multiplyScalar( this.DRAG ).add( this.position );
    newPos.add( this.a.multiplyScalar( timesq ) );

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.a.set( 0, 0, 0 );
  }

  plane( width, height ) {
    return ( u, v, target ) => {

      const x = ( u - 0.5 ) * width;
      const y = ( v + 0.5 ) * height;
      const z = 0;

      target.set( x, y, z );
    };
  }
}

class Cloth {
  w = 10;
  h = 10;
  particles = [];
  constraints = [];
  MASS = 0.1;
  restDistance = 25;
  constructor( w, h ) {
    this.w = w;
    this.h = h;
    this.init();
  }

  init() {
    // Create particles
    for (let v = 0; v <= this.h; v++ ) {
      for (let u = 0; u <= this.w; u++ ) {

        this.particles.push(
          new Particle( u / this.w, v / this.h, 0, this.MASS )
        );
      }
    }

    // Structural
    for (let v = 0; v < this.h; v ++ ) {
      for (let u = 0; u < this.w; u ++ ) {
        this.constraints.push( [
          this.particles[ this.index( u, v ) ],
          this.particles[ this.index( u, v + 1 ) ],
          this.restDistance
        ]);

        this.constraints.push( [
          this.particles[ this.index( u, v ) ],
          this.particles[ this.index( u + 1, v ) ],
          this.restDistance
        ]);

      }
    }

    for (let u = this.w, v = 0; v < this.h; v ++ ) {
      this.constraints.push( [
        this.particles[ this.index( u, v ) ],
        this.particles[ this.index( u, v + 1 ) ],
        this.restDistance
      ] );
    }

    for (let v = this.h, u = 0; u < this.w; u ++ ) {
      this.constraints.push( [
        this.particles[ this.index( u, v ) ],
        this.particles[ this.index( u + 1, v ) ],
        this.restDistance
      ]);
    }

    // While many systems use shear and bend springs,
    // the relaxed constraints model seems to be just fine
    // using structural springs.
    // Shear
    // var diagonalDist = Math.sqrt(restDistance * restDistance * 2);


    // for (v=0;v<h;v++) {
    // 	for (u=0;u<w;u++) {

    // 		constraints.push([
    // 			particles[index(u, v)],
    // 			particles[index(u+1, v+1)],
    // 			diagonalDist
    // 		]);

    // 		constraints.push([
    // 			particles[index(u+1, v)],
    // 			particles[index(u, v+1)],
    // 			diagonalDist
    // 		]);

    // 	}
    // }
  }

  index( u, v ) {
    return u + v * ( this.w + 1 );
  }
}

@Component({
  selector: 'app-cloth-simulation',
  templateUrl: './cloth-simulation.component.html',
  styleUrls: ['./cloth-simulation.component.scss'],
})
export class ClothSimulationComponent implements OnInit, OnDestroy {
  DAMPING = 0.03;
  DRAG = 1 - this.DAMPING;
  MASS = 0.1;
  restDistance = 25;

  xSegs = 10;
  ySegs = 10;
  cloth = new Cloth( this.xSegs, this.ySegs );

  GRAVITY = 981 * 1.4;
  gravity = new THREE.Vector3( 0, - this.GRAVITY, 0 ).multiplyScalar( this.MASS );


  TIMESTEP = 18 / 1000;
  TIMESTEP_SQ = this.TIMESTEP * this.TIMESTEP;

  windForce = new THREE.Vector3( 0, 0, 0 );

  ballPosition = new THREE.Vector3( 0, - 45, 0 );
  ballSize = 60; // 40

  tmpForce = new THREE.Vector3();

  lastTime;
  diff = new THREE.Vector3();
  container;
  stats;
  camera;
  scene;
  renderer;
  clothGeometry;
  sphere;
  object;
  pinsFormation = [];
  pins = [ 6 ];
  params;
  gui;
  @ViewChild('containerCloth', {static: true}) containerCloth: ElementRef;
  clothFunction = this.plane( this.restDistance * this.xSegs, this.restDistance * this.ySegs );

  constructor() {
    /* testing cloth simulation */

    this.pinsFormation.push( this.pins );

    this.pins = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    this.pinsFormation.push( this.pins );

    this.pins = [ 0 ];
    this.pinsFormation.push( this.pins );

    this.pins = []; // cut the rope ;)
    this.pinsFormation.push( this.pins );

    this.pins = [ 0, this.cloth.w ]; // classic 2 pins
    this.pinsFormation.push( this.pins );

    this.pins = this.pinsFormation[ 1 ];
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }

  ngOnInit() {
    this.params = {
      enableWind: true,
      showBall: false,
      tooglePins: this.togglePins
    };
    this.init();
    this.animate();
  }

  ngOnDestroy() {
    this.gui.destroy();
  }

  init() {
    this.container = this.containerCloth.nativeElement;

    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xcce0ff );
    this.scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

    // camera
    this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.set( 1000, 50, 1500 );

    // lights
    this.scene.add( new THREE.AmbientLight( 0x666666 ) );

    const light = new THREE.DirectionalLight( 0xdfebff, 1 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const d = 300;

    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.far = 1000;

    this.scene.add( light );

    // cloth material
    const loader = new THREE.TextureLoader();
    const clothTexture = loader.load( 'assets/threejs/textures/patterns/circuit_pattern.png' );
    clothTexture.anisotropy = 16;

    const clothMaterial = new THREE.MeshLambertMaterial( {
      map: clothTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.5
    } );

    // cloth geometry

    this.clothGeometry = new THREE.ParametricBufferGeometry( this.clothFunction, this.cloth.w, this.cloth.h );

    // cloth mesh
    this.object = new THREE.Mesh( this.clothGeometry, clothMaterial );
    this.object.position.set( 0, 0, 0 );
    this.object.castShadow = true;
    this.scene.add( this.object );

    this.object.customDepthMaterial = new THREE.MeshDepthMaterial( {
      depthPacking: THREE.RGBADepthPacking,
      map: clothTexture,
      alphaTest: 0.5
    } );

    // sphere

    const ballGeo = new THREE.SphereBufferGeometry( this.ballSize, 32, 16 );
    const ballMaterial = new THREE.MeshLambertMaterial();

    this.sphere = new THREE.Mesh( ballGeo, ballMaterial );
    this.sphere.castShadow = true;
    this.sphere.receiveShadow = true;
    this.sphere.visible = false;
    this.scene.add( this.sphere );

    // ground
    const groundTexture = loader.load( 'assets/threejs/textures/terrain/grasslight-big.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 25, 25 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

    let mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
    mesh.position.y = - 250;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add( mesh );

    // poles

    const poleGeo = new THREE.BoxBufferGeometry( 5, 375, 5 );
    const poleMat = new THREE.MeshLambertMaterial();

    mesh = new THREE.Mesh( poleGeo, poleMat );
    mesh.position.x = - 125;
    mesh.position.y = - 62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );

    mesh = new THREE.Mesh( poleGeo, poleMat );
    mesh.position.x = 125;
    mesh.position.y = - 62;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );

    mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 255, 5, 5 ), poleMat );
    mesh.position.y = - 250 + ( 750 / 2 );
    mesh.position.x = 0;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );

    const gg = new THREE.BoxBufferGeometry( 10, 10, 10 );
    mesh = new THREE.Mesh( gg, poleMat );
    mesh.position.y = - 250;
    mesh.position.x = 125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );

    mesh = new THREE.Mesh( gg, poleMat );
    mesh.position.y = - 250;
    mesh.position.x = - 125;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add( mesh );

    // renderer
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.container.appendChild( this.renderer.domElement );

    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer.shadowMap.enabled = true;

    // controls
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 1000;
    controls.maxDistance = 5000;

    // performance monitor
    this.stats = Stats();
    this.container.appendChild( this.stats.dom );

    //

    this.gui = new GUI();
    this.gui.add( this.params, 'enableWind' );
    this.gui.add( this.params, 'showBall' );
    this.gui.add( this.params, 'tooglePins' );
  }

  togglePins = () => {
    if (this.pinsFormation) {
      this.pins = this.pinsFormation[
        // tslint:disable-next-line: no-bitwise
        ~ ~ ( Math.random() * this.pinsFormation.length )
      ];
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  plane( width, height ) {
    return ( u, v, target ) => {

      const x = ( u - 0.5 ) * width;
      const y = ( v + 0.5 ) * height;
      const z = 0;

      target.set( x, y, z );
    };
  }

  animate = () => {
    requestAnimationFrame( this.animate );

    const time = Date.now();

    const windStrength = Math.cos( time / 7000 ) * 20 + 40;

    this.windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) );
    this.windForce.normalize();
    this.windForce.multiplyScalar( windStrength );

    this.simulate( time );
    this.render();
    this.stats.update();
  }

  render() {
    const p = this.cloth.particles;

    for ( let i = 0, il = p.length; i < il; i ++ ) {

      const v = p[ i ].position;
      this.clothGeometry.attributes.position.setXYZ( i, v.x, v.y, v.z );
    }

    this.clothGeometry.attributes.position.needsUpdate = true;

    this.clothGeometry.computeVertexNormals();

    this.sphere.position.copy( this.ballPosition );

    this.renderer.render( this.scene, this.camera );
  }

  satisfyConstraints( p1, p2, distance ) {
    this.diff.subVectors( p2.position, p1.position );
    const currentDist = this.diff.length();
    if (currentDist === 0 ) {
      return; // prevents division by 0
    }
    const correction = this.diff.multiplyScalar( 1 - distance / currentDist );
    const correctionHalf = correction.multiplyScalar( 0.5 );
    p1.position.add( correctionHalf );
    p2.position.sub( correctionHalf );
  }

  simulate( time ) {
    if ( ! this.lastTime ) {
      this.lastTime = time;
      return;
    }

    let i, j, il, particles, particle, constraints, constraint;

    // Aerodynamics forces

    if ( this.params.enableWind ) {

      let indx;
      const normal = new THREE.Vector3();
      const indices = this.clothGeometry.index;
      const normals = this.clothGeometry.attributes.normal;

      particles = this.cloth.particles;

      for ( i = 0, il = indices.count; i < il; i += 3 ) {
        for ( j = 0; j < 3; j ++ ) {
          indx = indices.getX( i + j );
          normal.fromBufferAttribute( normals, indx );
          this.tmpForce.copy( normal ).normalize().multiplyScalar( normal.dot( this.windForce ) );
          particles[ indx ].addForce( this.tmpForce );
        }
      }
    }

    for ( particles = this.cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {
      particle = particles[ i ];
      particle.addForce( this.gravity );
      particle.integrate( this.TIMESTEP_SQ );
    }

    // Start Constraints

    constraints = this.cloth.constraints;
    il = constraints.length;

    for (i = 0; i < il; i ++ ) {
      constraint = constraints[ i ];
      this.satisfyConstraints( constraint[ 0 ], constraint[ 1 ], constraint[ 2 ] );
    }

    // Ball Constraints

    this.ballPosition.z = - Math.sin( Date.now() / 600 ) * 90; // + 40;
    this.ballPosition.x = Math.cos( Date.now() / 400 ) * 70;

    let pos;

    if ( this.params.showBall ) {
      this.sphere.visible = true;

      for ( particles = this.cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {

        particle = particles[ i ];
        pos = particle.position;
        this.diff.subVectors( pos, this.ballPosition );
        if ( this.diff.length() < this.ballSize ) {
          // collided
          this.diff.normalize().multiplyScalar( this.ballSize );
          pos.copy( this.ballPosition ).add( this.diff );
        }
      }
    } else {
      this.sphere.visible = false;
    }

    // Floor Constraints

    for ( particles = this.cloth.particles, i = 0, il = particles.length; i < il; i ++ ) {
      particle = particles[ i ];
      pos = particle.position;
      if ( pos.y < - 250 ) {
        pos.y = - 250;
      }
    }

    // Pin Constraints

    for ( i = 0, il = this.pins.length; i < il; i ++ ) {
      const xy = this.pins[ i ];
      const p = particles[ xy ];
      p.position.copy( p.original );
      p.previous.copy( p.original );
    }


  }

}

