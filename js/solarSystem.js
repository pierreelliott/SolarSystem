/**
 * @author Pierre-Elliott Thiboud / http://pierreelliott.github.io/
 *
 * Copyright (c) 2017 Pierre-Elliott Thiboud
 * All rights reserved
 */

window.addEventListener( 'load', SolarSystem, false );


function SolarSystem() {
	class CelestialBody {
		constructor(file, parentReference, type) {
			/* The point around which the body gravitate */
			this.centerOfGravity = new THREE.Object3D();
			
			/* The point where the body is relative to its centerOfGravity
			It is the point which actually rotate around the center */
			var positionInSpace = new THREE.Object3D();
			
			/* The reference to the body */
			this.reference = new THREE.Object3D();
			
			/* Informations about the body */
			this.name = file.name;
			this.orbit = file.orbit; // Parameters of the body's orbit
			this.rotation = file.rotation; // Parameters of the body's rotation (on itself)
			this.mass = file.mass;
			this.type = type;

			parentReference.add(this.centerOfGravity);
			this.centerOfGravity.add(positionInSpace);
			
			positionInSpace.position.x(file.orbit.distance); // Unity in AU (Astronomical Unit)
			positionInSpace.position.multiplyScalar(astronomicalUnit);
			
			positionInSpace.add(this.reference);
		}
		rotate() {
			var orbit = this.orbit.period;
			var rotation = this.rotation.period;
			var date = new Date();
			
			this.centerOfGravity.rotation.y = getRotationAngle(orbit);
			this.reference.rotation.y += getRotationAngle(rotation);
			
			function getRotationAngle(r) {
				if(r == 0) { return 0; }
				else { return (date%orbit)/(2*Math.PI);; }
			}
		}
		getType() { return this.type; }
		getReference() { return this.positionInSpace; }
	}

	class Star extends CelestialBody {
		constructor(file, texture, parentReference) {
			super(file, parentReference, "STAR");

			file.material.emissiveMap = texture;
			file.material.map = texture;
			var material = new THREE.MeshPhongMaterial( file.material );
			var ball = new THREE.SphereGeometry(1, 32, 32);
			var mesh = new THREE.Mesh(ball, material);

			mesh.scale.setScalar(file.mesh.scale);
			//mesh.scale.multiplyScalar(0.001*astronomicalUnit);
			mesh.rotation.fromArray(file.mesh.rotation);

			this.reference.add(mesh);
		}
	}

	class Planet extends CelestialBody {
		constructor(file, texture, parentReference) {
			super(file, parentReference, "PLANET");

			file.material.map = texture;
			var material = new THREE.MeshPhongMaterial( file.material );
			var ball = new THREE.SphereGeometry(1, 32, 32);
			var mesh = new THREE.Mesh(ball, material);

			//this.reference.position.multiplyScalar(astronomicalUnit);
			// Il faudra penser à refléter l'absence de ce scalaire en changeant la valeur du vecteur de position

			mesh.scale.setScalar(file.mesh.scale);
			mesh.scale.multiplyScalar(0.1*astronomicalUnit);
			mesh.rotation.fromArray(file.mesh.rotation);

			this.reference.add(mesh);
		}
	}

	class Satellite extends CelestialBody {
		constructor(file, texture, parentReference) {
			super(file, parentReference, "SATELLITE");

			file.material.map = texture;
			var material = new THREE.MeshPhongMaterial( file.material );
			var ball = new THREE.SphereGeometry(1, 32, 32);
			var mesh = new THREE.Mesh(ball, material);

			//this.reference.position.multiplyScalar(astronomicalUnit);
			// Il faudra penser à refléter l'absence de ce scalaire en changeant la valeur du vecteur de position

			mesh.scale.setScalar(file.mesh.scale);
			mesh.scale.multiplyScalar(0.1*astronomicalUnit);
			mesh.rotation.fromArray(file.mesh.rotation);

			this.reference.add(mesh);
		}
	}

	class Spaceship {
		constructor(object, parentReference, camera) {
			this.mesh = object;
			this.reference = new THREE.Object3D();
			this.reference.add(this.mesh);
			parentReference.add(this.reference);
			this.reference.position.z = 10;
			this.mesh.scale.setScalar(0.001);
			this.mesh.rotation.y = Math.PI;

			this.reference.add(camera);
			camera.rotation.x = 0.1;
			camera.position.z = 0.1;
		}
		getControls(camera, domElem) {
			var controls = new THREE.FlyControls( this.reference, domElem, {camera: camera} );
			controls.movementSpeed = 5;
			controls.rollSpeed = Math.PI / 4;
			controls.autoForward = false;
			controls.dragToLook = false;

			return controls;
		}
	}

	//setTimeout(hideLoadingPanel, 5000);
	var container, stats;
	//var camera, scene, renderer;
	var cameraHud, sceneHud;
	var clock, controls, delta;
	celestialBodies = new Map();
	ships = new Map();

	earthDay = 0.005;
	astronomicalUnit = 10;

	var HUD;

	init();


	function init() {
		initScene();
		//initHud();

		initSkybox();

		var fieldOfView = 80,
			aspectRatio = window.innerWidth / window.innerHeight,
			nearPlane = 0.01,
			farPlane = 1000;
		camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
        renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;

		document.getElementById("solarSystem").appendChild( renderer.domElement ); // Append the 3D scene in the page

		clock = new THREE.Clock();
		delta = clock.getDelta();

		HUD = new HUDControls(renderer, camera);

		ajax("src/ressources.json", initializeSystem )
	}

	function initScene() {
		scene = new THREE.Scene();

		var light = new THREE.PointLight( 0xFFFFFF, 1, 200, 2 );
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
		//	skybox.format = THREE.RGBFormat;

		scene.background = skybox;
	}

	function ajax(data_url, callback) {
		$.getJSON(data_url, function (data,status,xhr) {
			if(status === "success") {
				callback(data);
			} else {
				console.log("Error " + status);
			}
		});
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
					var ob;
					switch(body.type) {
						case "E": ob = new Star(body, texture, parentRef); break;
						case "P": ob = new Planet(body, texture, parentRef); break;
						case "S": ob = new Satellite(body, texture, parentRef); break;
					}
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

	function intializeStars(jsonFile) {
		var objects = jsonFile.solarSystem.stars;
		var loader = new THREE.TextureLoader();

		var loadManagerVar = new LoadManager(objects.length,function() {
			initializePlanets(jsonFile);
		});

		objects.forEach( function (e) {
			loader.load(
				e.texture,
				function (texture) {
					var ob = new Star(e, texture, scene);
					celestialBodies.set(e.name, ob);

					HUD.trackObject(ob);

					loadManagerVar.finished();
				}
			);
		});
	}

	function initializePlanets(jsonFile) {
		var objects = jsonFile.solarSystem.planets;
		var loader = new THREE.TextureLoader();

		var loadManagerVar = new LoadManager(objects.length,function() {
			initializeSatellites(jsonFile);
		});

		objects.forEach( function (e) {
			loader.load(
				e.texture,
				function (texture) {
					var parentRef = celestialBodies.get(e.parentReference).getReference();
					var ob = new Planet(e, texture, parentRef);
					celestialBodies.set(e.name, ob);

					HUD.trackObject(ob);

					loadManagerVar.finished();
				}
			);
		});
	}

	function initializeSatellites(jsonFile) {
		var objects = jsonFile.solarSystem.satellites;
		var loader = new THREE.TextureLoader();

		var loadManagerVar = new LoadManager(objects.length,function() {
			initializeSpaceship();
		});

		objects.forEach( function (e) {
			loader.load(
				e.texture,
				function (texture) {
					var parentRef = celestialBodies.get(e.parentReference).getReference();
					var ob = new Satellite(e, texture, parentRef);
					celestialBodies.set(e.name, ob);

					HUD.trackObject(ob);

					loadManagerVar.finished();
				}
			);
		});
	}

	function initializeSpaceship() {
		var loader = new THREE.ObjectLoader();
		var loadManagerVar = new LoadManager(1,function() {
			randomizePosition();
		});

		loader.load(
			"src/rocket_ship.json",
			function ( obj ) {
				var playerShip = new Spaceship(obj, scene, camera);
				controls = playerShip.getControls(camera, renderer.domElement);
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

	function randomizePosition() {
		var rand;
		celestialBodies.forEach( function (obj, name) {
			rand = Math.round(Math.random()*1000000);
			for(var i; i < rand; i++) {
				obj.rotate();
			}
		});

		animate();
		hideLoadingPanel();
	}

	function animate() {
		requestAnimationFrame( animate );

		celestialBodies.forEach( function (obj, name) {
			obj.rotate();
		});

		delta = clock.getDelta();
		controls.update( delta );

		renderScenes();
	}

	function renderScenes() {
		renderer.clear();

		renderer.render(scene, camera); //*

		/*renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
		renderer.clearDepth();
		renderer.render(sceneHud, cameraHud);*/
		HUD.update();
	}

	window.addEventListener( 'resize', onResize, false );

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		//cameraHud.aspect = window.innerWidth / window.innerHeight;
		//cameraHud.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}
}
