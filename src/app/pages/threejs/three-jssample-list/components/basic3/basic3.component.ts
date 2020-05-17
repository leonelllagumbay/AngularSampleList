import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-basic3',
  templateUrl: './basic3.component.html',
  styleUrls: ['./basic3.component.scss'],
})
export class Basic3Component implements OnInit {
  mesh: any;
  renderer: any;
  scene: any;
  camera: any;
  geometry: any;
  material: any;
  @ViewChild('basicContainer', {static: true}) basicContainer: ElementRef;
  constructor() { }

  ngOnInit() {
    this.init();
    this.animate();
  }

  init() {
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    this.geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    this.material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    const basicContainer = this.basicContainer.nativeElement;
    basicContainer.appendChild( this.renderer.domElement );
  }

  animate = () => {

    requestAnimationFrame( this.animate );

    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
    this.renderer.render( this.scene, this.camera );
  }
}
