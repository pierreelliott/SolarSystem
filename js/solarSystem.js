/**
 * @author Pierre-Elliott Thiboud / http://pierreelliott.github.io/
 *
 * Copyright (c) 2017 Pierre-Elliott Thiboud
 * All rights reserved
 */

"use strict";

window.addEventListener( 'load', SolarSystem, false );
var kilometre = 1000;
var shipSpeed = 5000000*kilometre;
var HUD;
var camera, scene, renderer;
var celestialBodies;
var ships;


function SolarSystem() {

	/**
	* CelestialBody - Description
	*/
	class CelestialBody {
		constructor(file, parentReference, texture) {
			/* The point around which the body gravitate */
			this.centerOfGravity = new THREE.Object3D();
			this.centerOfGravity.name = file.name + "Gravity";

			/* The point where the body is relative to its centerOfGravity
			It is the point which actually rotate around the center */
			this.positionInSpace = new THREE.Object3D();
			this.positionInSpace.name = file.name + "Position";

			/* The reference to the body */
			this.reference = new THREE.Object3D();
			this.reference.name = file.name + "Reference";

			/* Informations about the body */
			this.name = file.name;
			this.orbit = file.orbit; // Parameters of the body's orbit
			this.rotation = file.rotation; // Parameters of the body's rotation (on itself)
			this.mass = file.mass;
			//this.type = type;
			this.type = file.type;

			parentReference.add(this.centerOfGravity);
			this.centerOfGravity.add(this.positionInSpace);
			this.centerOfGravity.rotation.x = file.orbit["ecliptic-inclination"] * Math.PI/180; // Because I use degree angles

			this.positionInSpace.position.x = file.orbit.distance; // Distance is in Km
			this.positionInSpace.position.multiplyScalar(kilometre);

			this.positionInSpace.add(this.reference);

			//file.material.side = THREE.DoubleSide;
			var material;
			if (file.type == "E") {
				file.material.emissiveMap = texture;
				material = new THREE.MeshLambertMaterial( file.material );
			} else {
				file.material.map = texture;
				material = new THREE.MeshPhongMaterial( file.material );
			}

			var ball = new THREE.SphereGeometry(1, 32, 32);
			var mesh = new THREE.Mesh(ball, material);

			mesh.scale.setScalar(file.radius*2);
			mesh.scale.multiplyScalar(kilometre);
			mesh.rotation.x = file.rotation.obliquity * Math.PI/180; // Because I use degree angles

			this.reference.add(mesh);
		}
		/**
		* rotate - Description
		*
		* @returns {type} Description
		*/
		rotate(date) {
			var orbit = this.orbit.period;
			var orbitOffset = this.orbit.offset;
			var rotation = this.rotation.period;
			var rotationOffset = this.rotation.offset;
			if (!date instanceof Date) {
				date = new Date();
			}
			date = new Date();
			var numberOfDays = millisecondsToDays(date);
			//var numberOfDays = (date/1000); // For testing, 1 day = 1 second

			this.centerOfGravity.rotation.y = getRotationAngle(orbit, 0);
			this.reference.rotation.y = getRotationAngle(rotation, 0);

			function getRotationAngle(period, offset) {
				if(period == 0) { return 0; }
				else { return (numberOfDays%period)/( period/(2*Math.PI) ) + offset; }
			}

			function millisecondsToDays(date) {
				return (date/1000)/86400;
			}
		}
		getType() { return this.type; }
		getReference() { return this.positionInSpace; }
	}

	class Spaceship {
		constructor(object, parentReference, camera) {
			this.mesh = object;
			this.reference = new THREE.Object3D();
			this.reference.add(this.mesh);
			this.reference.name = "SpaceShip";
			//parentReference = celestialBodies.get("sun").getReference();
			parentReference.add(this.reference);
			console.log(celestialBodies.get("earth").reference.rotation);
			console.log(celestialBodies.get("earth").reference.getWorldPosition().distanceTo(this.reference.position));
			var earthPos = celestialBodies.get("earth").reference.getWorldPosition().x;
			var earthRot = celestialBodies.get("earth").centerOfGravity.rotation.y;
			this.reference.position.set(Math.cos(earthRot)*earthPos, 0, -1*Math.sin(earthRot)*earthPos);
			console.log(this.reference.position);
			this.reference.position.z += 10*kilometre;
			//this.reference.position.z = 1500000*kilometre;
			this.mesh.scale.setScalar(10);
			this.mesh.rotation.y = Math.PI;

			this.reference.add(camera);
			camera.rotation.x = 0.1;
			camera.position.z = kilometre;
		}
		getControls(camera, domElem) {
			var controls = new THREE.FlyControls( this.reference, domElem );
			var orbitCont = new THREE.OrbitControls(camera, domElem);
			orbitCont.enablePan = false;

			controls.movementSpeed = shipSpeed;
			controls.rollSpeed = Math.PI / 4;
			controls.autoForward = false;
			controls.dragToLook = false;

			return { flycontrol: controls, orbitcontrol: orbitCont};
		}
	}

	var container, stats;
	//var camera, scene, renderer;
	var cameraHud, sceneHud;
	var clock, controls, orbitControls, delta;
	celestialBodies = new Map();
	ships = new Map();
	var oldTime;

//	var HUD;

	init();


	function init() {
		initScene();
		//initHud();

		initSkybox();

		var fieldOfView = 80,
			aspectRatio = window.innerWidth / window.innerHeight,
			nearPlane = 0.01,
			farPlane = 150*1000*kilometre;
		camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
        renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;

		document.getElementById("solarSystem").appendChild( renderer.domElement ); // Append the 3D scene in the page

		clock = new THREE.Clock();
		delta = clock.getDelta();
		oldTime = clock.getElapsedTime();

		HUD = new HUDControls(renderer, camera);
		HUD.colors = {
			P: 0x3399FF,
			G: 0x999966,
			E: 0xFFFF00,
			S: 0xCCCCFF
		}

		ajax("src/ressources.json", initializeSystem )
	}

	function initScene() {
		scene = new THREE.Scene();

		var light = new THREE.PointLight( 0xFFFFFF, 0.5, 0, 1 );
		var ambientlight = new THREE.AmbientLight( 0x202020 );
		scene.add(light);
		scene.add(ambientlight);
	}

	function initSkybox() {
		var skyboxPath = 'src/textures/skybox2/';
		var skyboxFormat = '.png';

		var skyboxTextures = [
			skyboxPath + 'right' + skyboxFormat,
			skyboxPath + 'left' + skyboxFormat,
			skyboxPath + 'top' + skyboxFormat,
			skyboxPath + 'bottom' + skyboxFormat,
			skyboxPath + 'front' + skyboxFormat,
			skyboxPath + 'back' + skyboxFormat,
		];

		var skybox = new THREE.CubeTextureLoader().load(skyboxTextures);
			skybox.format = THREE.RGBFormat;

		scene.background = skybox;
	}

	function ajax(data_url, callback) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(this.readyState == 4 && this.status == 200) {
				var jsonFile = JSON.parse(request.responseText);
				callback(jsonFile);
			}
		}
		request.open("GET", data_url, true);
		request.send();
/*
		$.getJSON(data_url, function (data,status,xhr) {
			if(status === "success") {
				callback(data);
			} else {
				console.log("Error " + status);
			}
		});*/
	}

	function initializeSystem(jsonFile) {
		var system = jsonFile.system.bodies;
		var loader = new THREE.TextureLoader();

		var bodiesCount = 0;
		(function countBodies(body) {
			bodiesCount++;
			if(body.children !== undefined) {
				body.children.forEach( function(e) {
					countBodies(e);
				});
			}
		})(system);

		var loadManagerVar = new LoadManager(bodiesCount,function() {
			initializeSpaceship();
		});

		loadCelestialBody(system, scene);

		function loadCelestialBody(body, parentRef) {
			loader.load(
				body.texture,
				function (texture) {
					var ob = new CelestialBody(body, parentRef, texture);
					celestialBodies.set(body.name, ob);
					HUD.trackObject(ob);
					loadManagerVar.finished();

					/* If the celestial body has children (moons for a planet, planets for a star, ...),
						initialize them	*/
					if(body.children !== undefined) {
						body.children.forEach( function(e) {
							loadCelestialBody(e, ob.getReference());
						});
					}
				}
			);
		}
	}

	function initializeSpaceship() {
		var loader = new THREE.ObjectLoader();
		var loadManagerVar = new LoadManager(1,function() {
			animate();
			hideLoadingPanel();
		});

		loader.load(
			"src/rocket_ship.json",
			function ( obj ) {
				var playerShip = new Spaceship(obj, scene, camera);
				var playerControls = playerShip.getControls(camera, renderer.domElement);
				controls = playerControls.flycontrol;
				orbitControls = playerControls.orbitcontrol;
				ships.set("player", playerShip);

				//HUD.camera = playerShip.reference;

				loadManagerVar.finished();
			}
		);
	}

	function LoadManager(count, callback) {
		this.numberObjectsCreated = 0;
		this.max = count;
		this.callback = callback;

		this.finished = function () {
			this.numberObjectsCreated++;
			//console.log(this.numberObjectsCreated+" objets créés");
			if(this.numberObjectsCreated >= this.max) {
				this.callback();
			}
		}
	}

	function animate() {
		requestAnimationFrame( animate );

		//if( clock.getElapsedTime() - oldTime > 2) {
			celestialBodies.forEach( function (obj, name) {
				obj.rotate();
			});
			//oldTime = clock.getElapsedTime();
		//}

		delta = clock.getDelta();
		controls.update( delta );
		orbitControls ? orbitControls.update( delta ) : orbitControls;

		renderScenes();
	}

	function renderScenes() {
		renderer.clear();

		renderer.render(scene, camera);

		HUD.update();
	}

	window.addEventListener( 'resize', onResize, false );
	window.addEventListener('unload', unloadGame);

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		HUD.resize(window.innerWidth, window.innerHeight);

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function unloadGame() {
		renderer.forceContextLoss();
	}
}
