/**
 * @author Pierre-Elliott Thiboud / http://pierreelliott.github.io/
 *
 * Copyright (c) 2017 Pierre-Elliott Thiboud
 * All rights reserved
 */

	class CelestialBody {
		constructor(file, parentReference, type) {
			this.centerOfGravity = new THREE.Object3D();
			this.positionInSpace = new THREE.Object3D();
			this.reference = new THREE.Object3D();
			this.name = file.name;
			this.orbitalRotation = file.orbitalRotation; // Rotation around its parent
			this.siderealRotation = file.siderealRotation; // Rotation on itself
			this.mass = file.mass;
			this.type = type;

			parentReference.add(this.centerOfGravity);
			this.centerOfGravity.add(this.positionInSpace);
			this.positionInSpace.position.fromArray(file.reference.position); // Unité en UA
			this.positionInSpace.position.multiplyScalar(astronomicalUnit);
			this.positionInSpace.name = file.name + "Position";
			this.positionInSpace.add(this.reference);

			this.numberOfRotation = 0;
		}
		rotate() {
			this.centerOfGravity.rotation.y += getRotationAngle(this.orbitalRotation);
			this.reference.rotation.y += getRotationAngle(this.siderealRotation);
			this.numberOfRotation++;

			function getRotationAngle(r) {
				if(r == 0) { return 0; }
				else { return earthDay/r; }
			}
		}
		getType() { return this.type; }
		getReference() { return this.positionInSpace; }
	}

	class Star extends CelestialBody {
		constructor(file, texture, parentReference) {
			super(file, parentReference, "Star");

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
			super(file, parentReference, "Planet");

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
			super(file, parentReference, "Satellite");

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
		constructor(object, parentReference) {
			this.mesh = object;
			this.reference = new THREE.Object3D();
			this.reference.add(this.mesh);
			parentReference.add(this.reference);
			this.reference.position.z = 10;
			this.mesh.scale.setScalar(0.001);
			this.mesh.rotation.y = Math.PI;
		}
		getControls(camera, domElem) {
			this.reference.add(camera);
			camera.rotation.x = 0.1;
			camera.position.z = 0.1;
			
			var controls = new THREE.FlyControls( this.reference, domElem, {camera: camera} );
			controls.movementSpeed = 10;
			controls.rollSpeed = Math.PI / 6;
			controls.autoForward = false;
			controls.dragToLook = true;
			
			return controls;
		}
	}

window.onload = function() {
	//setTimeout(hideLoadingPanel, 5000);
	var container, stats;
	var camera, scene, renderer;
	var cameraHud, sceneHud;
	var clock, controls, delta;
	celestialBodies = new Map();
	ships = new Map();

	earthDay = 0.5;
	astronomicalUnit = 10;

	init();


	function init() {
		scene = new THREE.Scene();
		sceneHud = new THREE.Scene();
		
		var width = window.innerWidth;
		var height = window.innerHeight;
		
		var fieldOfView = 100,
			aspectRatio = window.innerWidth / window.innerHeight,
			nearPlane = 0.01,
			farPlane = 1000;
		camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, nearPlane, farPlane );
		//cameraHud = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
		
		scene.add(camera);
		//sceneHud.add(cameraHud);

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;

		document.getElementById("solarSystem").appendChild( renderer.domElement ); // Append the 3D scene in the page

		clock = new THREE.Clock();
		delta = clock.getDelta();
		//camera.position.z = 20;
		//camera.rotation.x = -0.2;

		/*controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableZoom = true;*/

		var light = new THREE.PointLight( 0xFFFFFF, 1, 200, 2 );
		var ambientlight = new THREE.AmbientLight( 0x202020 );
		scene.add(light);
		scene.add(ambientlight);;

		ajax("src/ressources.json", intializeStars )
	}
	
	function initHud() {
		var hudGeometry = new THREE.ConeGeometry(0.1, 0.2, 16);
		hudGeometry.rotateX(Math.PI * 0.5);
		var hudMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });

		var hudData = new THREE.Mesh(hudGeometry, hudMaterial);
		
		sceneHud.add(hudData);
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
				var playerShip = new Spaceship(obj, scene);
				controls = playerShip.getControls(camera, renderer.domElement);
				ships.set("player", playerShip);
				
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
		//renderer.render( scene, camera );
		
		//renderer.clear();
		renderer.render(scene, camera);
		//renderer.clearDepth();
		//renderer.render(sceneHud, cameraHud);
	}

	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		
		//cameraHud.aspect = window.innerWidth / window.innerHeight;
		//cameraHud.updateProjectionMatrix();
		
		renderer.setSize( window.innerWidth, window.innerHeight );
	};
}
