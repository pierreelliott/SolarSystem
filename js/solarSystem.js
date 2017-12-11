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
			this.positionInSpace.position.multiplyScalar(uniteAstronomique);
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
			this.mesh = new THREE.Mesh(ball, material);

			this.mesh.scale.setScalar(file.mesh.scale);
			this.mesh.rotation.fromArray(file.mesh.rotation);

			this.reference.add(this.mesh);
		}
	}

	class Planet extends CelestialBody {
		constructor(file, texture, parentReference) {
			super(file, parentReference, "Planet");

			file.material.map = texture;
			var material = new THREE.MeshPhongMaterial( file.material );
			var ball = new THREE.SphereGeometry(1, 32, 32);
			var mesh = new THREE.Mesh(ball, material);

			//this.reference.position.multiplyScalar(uniteAstronomique);
			// Il faudra penser à refléter l'absence de ce scalaire en changeant la valeur du vecteur de position

			mesh.scale.setScalar(file.mesh.scale);
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

			//this.reference.position.multiplyScalar(uniteAstronomique);
			// Il faudra penser à refléter l'absence de ce scalaire en changeant la valeur du vecteur de position

			mesh.scale.setScalar(file.mesh.scale);
			mesh.rotation.fromArray(file.mesh.rotation);

			this.reference.add(mesh);
		}
	}


var camera, scene, renderer, celestialBodies;

window.onload = function() {
	var container, stats;
	//var camera, scene, renderer;
	var clock, controls, delta;
	celestialBodies = new Map();

	var objectsMap = new Map();
	var objectsReferenceMap = new Map();
	var objectsReferenceOnParentMap = new Map();

	earthDay = 0.5;
	uniteAstronomique = 5;

	init();


	function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.setClearColor(new THREE.Color(0xEE2299, 1.0)); // To see from where the error is coming
		document.body.appendChild( renderer.domElement );

		clock = new THREE.Clock();
		delta = clock.getDelta();
		console.log("Delta : ");
		console.log(delta);
		camera.position.z = 20;
		camera.rotation.x = -0.2;

		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableZoom = true;

		var light = new THREE.PointLight( 0xFFFFFF, 1, 200, 2 );
		var ambientlight = new THREE.AmbientLight( 0x202020 );
		scene.add(light);
		scene.add(ambientlight);;

		ajax("src/ressources.json", intializeStars )
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

	function solarSystemInitialization(jsonFile) {
		var objects = jsonFile.solarSystem.stars;
		var loader = new THREE.TextureLoader();

		//var ring = new THREE.RingGeometry( 3, 5, 50);

		var loadManagerVar = new LoadManager(objects.length,);

		objects.forEach( function (e) {
			loader.load(
				e.texture,
				function (texture) {
					console.log(e);
					var material;
					if(e.isEmissive) {
						e.material.map = texture;
						e.material.emissiveMap = texture;
						material = new THREE.MeshPhongMaterial( e.material );
					} else {
						texture.repeat.fromArray(e.repeat);
						e.material.map = texture;
						material = new THREE.MeshPhongMaterial( e.material );
					}
					var mesh = new THREE.Mesh(ball, material);
					objectsMap.set(e.name,{ o: mesh, rotation: e.selfRotation });

					var parentReferenceOb = objectsReferenceMap.get(e.parentReference);
					var parentReference = parentReferenceOb.o;
					var referenceOnParentOb = objectsReferenceOnParentMap.get(e.name+"ReferenceOnParent");
					var referenceOnParent = referenceOnParentOb.o;

					//console.log(e);
					parentReference.add(referenceOnParent);

					var reference = objectsReferenceMap.get(e.name+"Reference").o;

					referenceOnParent.add(reference);
					reference.position.fromArray(e.mesh.position);
					reference.position.multiplyScalar(uniteAstronomique);

					reference.add(mesh);

					mesh.scale.setScalar(e.mesh.scale);

					mesh.rotation.fromArray(e.mesh.rotation);

					loadManagerVar.inc();
				}/*,
				Function called when download progresses
				function (xhr) {

				}*/
			);
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
			console.log(scene);
			console.log(celestialBodies);
			animate();
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

	function LoadManager(count, callback) {
		this.numberObjectsCreated = 0;
		this.max = count;
		this.callback = callback;
	}
	LoadManager.prototype.finished = function () {
		this.numberObjectsCreated++;
		//console.log(this.numberObjectsCreated+" objets créés");
		if(this.numberObjectsCreated >= this.max) {
			this.callback();
		}
	}

	function animate() {
		requestAnimationFrame( animate );

		celestialBodies.forEach( function (obj, name) {
			obj.rotate();
		});

		delta = clock.getDelta();
		controls.update( delta );
		renderer.render( scene, camera );
	}

	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};
}
