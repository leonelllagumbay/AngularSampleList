import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

@Component({
  selector: 'app-littlest-tokyo',
  templateUrl: './littlest-tokyo.component.html',
  styleUrls: ['./littlest-tokyo.component.scss'],
})
export class LittlestTokyoComponent implements OnInit, OnDestroy {
  scene: any;
  camera: any;
  pointLight: any;
  stats: any;
  renderer: any;
  mixer: any;
  controls: any;
  clock: any;
  container: any;
  @ViewChild('littlestDiv', {static: true}) littlestDiv: ElementRef;
  constructor() { }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }

  ngOnInit() {
    this.clock = new THREE.Clock();
    this.container = this.littlestDiv.nativeElement;
    this.stats = Stats();
    this.container.appendChild(this.stats.dom);
    this.init();
  }

  ngOnDestroy() {
    this.container.innerHTML = '';
  }

  init() {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild( this.renderer.domElement );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xbfe3dd );

    this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
    this.camera.position.set( 5, 2, 8 );

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target.set( 0, 0.5, 0 );
    this.controls.enablePan = false;

    this.scene.add( new THREE.AmbientLight( 0x404040 ) );

    this.pointLight = new THREE.PointLight( 0xffffff, 1 );
    this.pointLight.position.copy( this.camera.position );
    this.scene.add( this.pointLight );

    // envmap
    const path = 'assets/threejs/textures/cube/Park2/';
    const format = '.jpg';
    const envMap = new THREE.CubeTextureLoader().load( [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ]);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( 'assets/threejs/examples/js/libs/draco/gltf/' );

    const loader = new GLTFLoader();
    loader.setDRACOLoader( dracoLoader );
    loader.load( 'assets/threejs/models/gltf/LittlestTokyo.glb', ( gltf ) => {
      const model = gltf.scene;
      model.position.set( 1, 1, 0 );
      model.scale.set( 0.01, 0.01, 0.01 );
      model.traverse( ( child: any ) => {
        if (child.isMesh) {
          child.material.envMap = envMap;
        }
      });

      this.scene.add( model );

      this.mixer = new THREE.AnimationMixer( model );
      this.mixer.clipAction( gltf.animations[ 0 ] ).play();

      this.animate();

    }, undefined, ( e ) => {
      console.error( e );
    } );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate = () => {
    requestAnimationFrame( this.animate );
    const delta = this.clock.getDelta();
    this.mixer.update( delta );
    this.controls.update( delta );
    this.stats.update();
    this.renderer.render( this.scene, this.camera );
  }

}
