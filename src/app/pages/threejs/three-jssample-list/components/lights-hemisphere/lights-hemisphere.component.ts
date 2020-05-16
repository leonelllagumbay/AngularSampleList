import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-lights-hemisphere',
  templateUrl: './lights-hemisphere.component.html',
  styleUrls: ['./lights-hemisphere.component.scss'],
})
export class LightsHemisphereComponent implements OnInit {
  camera: any;
  scene: any;
  renderer: any;
  dirLight: any;
  dirLightHeper: any;
  hemiLight: any;
  hemiLightHelper: any;
  mixers = [];
  stats: any;
  clock = new THREE.Clock();
  @ViewChild('container', {static: true}) container: ElementRef;

  constructor() { }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }
  ngOnInit() {
    this.init();
    this.animate();
  }

  init() {
    const container = this.container.nativeElement;

    this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
    this.camera.position.set( 0, 0, 250 );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.scene.fog = new THREE.Fog( this.scene.background, 1, 5000 );

    // LIGHTS

    this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    this.hemiLight.color.setHSL( 0.6, 1, 0.6 );
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set( 0, 50, 0 );
    this.scene.add( this.hemiLight );

    this.hemiLightHelper = new THREE.HemisphereLightHelper( this.hemiLight, 10 );
    this.scene.add( this.hemiLightHelper );

    //

    this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    this.dirLight.color.setHSL( 0.1, 1, 0.95 );
    this.dirLight.position.set( - 1, 1.75, 1 );
    this.dirLight.position.multiplyScalar( 30 );
    this.scene.add( this.dirLight );

    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;

    let d = 50;

    this.dirLight.shadow.camera.left = - d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = - d;

    this.dirLight.shadow.camera.far = 3500;
    this.dirLight.shadow.bias = - 0.0001;

    this.dirLightHeper = new THREE.DirectionalLightHelper( this.dirLight, 10 );
    this.scene.add( this.dirLightHeper );

    // GROUND

    const groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    groundMat.color.setHSL( 0.095, 1, 0.75 );

    const ground = new THREE.Mesh( groundGeo, groundMat );
    ground.position.y = - 33;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add( ground );

    // SKYDOME

    const vertexShader = `
      varying vec3 vWorldPosition;

      void main() {

        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;

      varying vec3 vWorldPosition;

      void main() {

        float h = normalize( vWorldPosition + offset ).y;
        gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
      }
    `;

    // or use
    // http.get('assets/shaders/particle.vert', {
    //   responseType: 'text'
    // }).subscribe(data => {
    //   vertexS1 = data;
    // })

    const uniforms = {
      topColor: { value: new THREE.Color( 0x0077ff ) },
      bottomColor: { value: new THREE.Color( 0xffffff ) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    uniforms.topColor.value.copy( this.hemiLight.color );

    this.scene.fog.color.copy( uniforms.bottomColor.value );

    const skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 15 );
    const skyMat = new THREE.ShaderMaterial( {
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh( skyGeo, skyMat );
    this.scene.add( sky );

    // MODEL

    const loader = new GLTFLoader();

    loader.load( 'assets/threejs/models/gltf/Flamingo.glb', ( gltf ) => {

      const mesh = gltf.scene.children[ 0 ];

      const s = 0.35;
      mesh.scale.set( s, s, s );
      mesh.position.y = 15;
      mesh.rotation.y = - 1;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.scene.add( mesh );

      const mixer = new THREE.AnimationMixer( mesh );
      mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
      this.mixers.push( mixer );

    });

    // RENDERER

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( this.renderer.domElement );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;

    // STATS

    this.stats = Stats();
    container.appendChild( this.stats.dom );
  }

  toggleHemisphereLight() {
    this.hemiLight.visible = ! this.hemiLight.visible;
    this.hemiLightHelper.visible = ! this.hemiLightHelper.visible;
  }

  toggleDirectionalLight() {
    this.dirLight.visible = ! this.dirLight.visible;
    this.dirLightHeper.visible = ! this.dirLightHeper.visible;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate = () => {
    requestAnimationFrame( this.animate );

    this.render();
    this.stats.update();
  }

  render() {

    const delta = this.clock.getDelta();

    for ( let i = 0; i < this.mixers.length; i ++ ) {
      this.mixers[ i ].update( delta );
    }
    this.renderer.render( this.scene, this.camera );
  }
}
