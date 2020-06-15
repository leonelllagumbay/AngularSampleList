import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-additive-animation-skinning',
  templateUrl: './additive-animation-skinning.component.html',
  styleUrls: ['./additive-animation-skinning.component.scss'],
})
export class AdditiveAnimationSkinningComponent implements OnInit, OnDestroy {
  @ViewChild('additiveAnimationSkinning', {static: true})
  additiveAnimationSkinning: ElementRef;
  scene;
  renderer;
  camera;
  stats;
  model;
  skeleton;
  mixer;
  clock;

  crossFadeControls = [];
  currentBaseAction = 'idle';
  allActions = [];
  baseActions = {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 }
  };
  additiveActions = {
    sneak_pose: { weight: 0 },
    sad_pose: { weight: 0 },
    agree: { weight: 0 },
    headShake: { weight: 0 }
  };
  panelSettings;
  numAnimations;
  container;
  panel;

  constructor() { }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.onWindowResize();
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.panel.destroy();
    this.container.innerHTML = '';
  }

  init() {
    this.container = this.additiveAnimationSkinning.nativeElement;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xa0a0a0 );
    this.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 20, 0 );
    this.scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 3, 10, 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add( dirLight );

    // ground

    const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ),
                  new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add( mesh );

    const loader = new GLTFLoader();
    loader.load( 'assets/threejs/models/gltf/Xbot.glb', ( gltf ) => {

      this.model = gltf.scene;
      this.scene.add( this.model );

      this.model.traverse( ( object ) => {
        if ( object.isMesh ) {
          object.castShadow = true;
        }
      });

      this.skeleton = new THREE.SkeletonHelper( this.model );
      this.skeleton.visible = false;
      this.scene.add( this.skeleton );

      const animations = gltf.animations;
      this.mixer = new THREE.AnimationMixer( this.model );

      this.numAnimations = animations.length;

      for ( let i = 0; i !== this.numAnimations; ++ i ) {

        let clip = animations[ i ];
        const name = clip.name;

        if ( this.baseActions[ name ] ) {

          const action = this.mixer.clipAction( clip );
          this.activateAction( action );
          this.baseActions[ name ].action = action;
          this.allActions.push( action );

          } else if ( this.additiveActions[ name ] ) {

            // Make the clip additive and remove the reference frame

            THREE.AnimationUtils.makeClipAdditive( clip );

            if ( clip.name.endsWith( '_pose' ) ) {
              clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );
            }

            const action = this.mixer.clipAction( clip );
            this.activateAction( action );
            this.additiveActions[ name ].action = action;
            this.allActions.push( action );
          }
        }

      this.createPanel();
      this.animate();
    });

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild( this.renderer.domElement );

    // camera
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
    this.camera.position.set( - 1, 2, 3 );

    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set( 0, 1, 0 );
    controls.update();

    this.stats = Stats();
    this.container.appendChild( this.stats.dom );
  }

  createPanel() {

    this.panel = new GUI( { width: 310 } );

    const folder1 = this.panel.addFolder( 'Base Actions' );
    const folder2 = this.panel.addFolder( 'Additive Action Weights' );
    const folder3 = this.panel.addFolder( 'General Speed' );

    this.panelSettings = {
      'modify time scale': 1.0
    };

    const baseNames = [ 'None', ...Object.keys( this.baseActions ) ];

    for ( let i = 0, l = baseNames.length; i !== l; ++ i ) {

      const name = baseNames[ i ];
      const settings = this.baseActions[ name ];
      this.panelSettings[ name ] = () => {

        const currentSettings = this.baseActions[ this.currentBaseAction ];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;

        this.prepareCrossFade( currentAction, action, 0.35 );

      };

      this.crossFadeControls.push( folder1.add( this.panelSettings, name ) );

    }

    for ( const name of Object.keys( this.additiveActions ) ) {

      const settings = this.additiveActions[ name ];

      this.panelSettings[ name ] = settings.weight;
      folder2.add( this.panelSettings, name, 0.0, 1.0, 0.01 ).listen().onChange( ( weight ) => {

        this.setWeight( settings.action, weight );
        settings.weight = weight;

      });

    }

    folder3.add( this.panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( this.modifyTimeScale );

    folder1.open();
    folder2.open();
    folder3.open();

    this.crossFadeControls.forEach( ( control ) => {

      control.classList1 = control.domElement.parentElement.parentElement.classList;
      control.classList2 = control.domElement.previousElementSibling.classList;

      control.setInactive = () => {
        control.classList2.add( 'control-inactive' );
      };

      control.setActive = () => {
        control.classList2.remove( 'control-inactive' );
      };

      const settings = this.baseActions[ control.property ];

      if ( ! settings || ! settings.weight ) {
        control.setInactive();
      }
    });
  }

  activateAction = ( action ) => {
    const clip = action.getClip();
    const settings = this.baseActions[ clip.name ] || this.additiveActions[ clip.name ];
    this.setWeight( action, settings.weight );
    action.play();
  }

  modifyTimeScale = ( speed ) => {
    this.mixer.timeScale = speed;
  }

  prepareCrossFade = ( startAction, endAction, duration ) => {

    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if ( this.currentBaseAction === 'idle' || ! startAction || ! endAction ) {
      this.executeCrossFade( startAction, endAction, duration );
    } else {
      this.synchronizeCrossFade( startAction, endAction, duration );
    }

    // Update control colors
    if ( endAction ) {

      const clip = endAction.getClip();
      this.currentBaseAction = clip.name;

    } else {

      this.currentBaseAction = 'None';

    }

    this.crossFadeControls.forEach( ( control ) => {
      const name = control.property;
      if ( name === this.currentBaseAction ) {
        control.setActive();
      } else {
        control.setInactive();
      }
    });
  }

  synchronizeCrossFade = ( startAction, endAction, duration ) => {
    this.mixer.addEventListener( 'loop', onLoopFinished );
    const self = this;
    function onLoopFinished( event ) {
      if ( event.action === startAction ) {
        self.mixer.removeEventListener( 'loop', onLoopFinished );
        self.executeCrossFade( startAction, endAction, duration );
      }
    }
  }

  executeCrossFade = ( startAction, endAction, duration ) => {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    if ( endAction ) {
      this.setWeight( endAction, 1 );
      endAction.time = 0;

      if ( startAction ) {
        // Crossfade with warping
        startAction.crossFadeTo( endAction, duration, true );
      } else {
        // Fade in
        endAction.fadeIn( duration );
      }
    } else {
      // Fade out
      startAction.fadeOut( duration );
    }
  }

  // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
  // the start action's timeScale to ((start animation's duration) / (end animation's duration))

  setWeight = ( action, weight ) => {
    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  animate = () => {

    // Render loop

    requestAnimationFrame( this.animate );

    for ( let i = 0; i !== this.numAnimations; ++ i ) {
      const action = this.allActions[ i ];
      const clip = action.getClip();
      const settings = this.baseActions[ clip.name ] || this.additiveActions[ clip.name ];
      settings.weight = action.getEffectiveWeight();
    }

    // Get the time elapsed since the last frame, used for mixer update

    const mixerUpdateDelta = this.clock.getDelta();

    // Update the animation mixer, the stats panel, and render this frame

    this.mixer.update( mixerUpdateDelta );

    this.stats.update();

    this.renderer.render( this.scene, this.camera );
  }
}
