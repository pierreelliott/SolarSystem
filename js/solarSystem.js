/**
 * @author Pierre-Elliott Thiboud / http://pierreelliott.github.io/
 *
 * Copyright (c) 2017 Pierre-Elliott Thiboud
 * All rights reserved
 */

 var kilometre = 1;

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

		 this.positionInSpace.position.x = file.orbit.distance;
		 this.positionInSpace.position.multiplyScalar(12);

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
		 //mesh.scale.multiplyScalar(kilometre);
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
		 //var numberOfDays = millisecondsToDays(date);
		 var numberOfDays = (date/5000); // For testing, ~5 hours = 1 second

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

window.addEventListener("load", function() {
	var container, stats;
	var camera, scene, renderer;
	var clock, controls, delta;
	celestialBodies = new Map();

	var objectsMap = new Map();
	var objectsReferenceMap = new Map();
	var objectsReferenceOnParentMap = new Map();

	earthDay = 0.5;
	uniteAstronomique = 10;

	init();


	function init() {
		scene = new THREE.Scene();

		initSkybox();

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );

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

		ajax("src/ressources.json", initializeSystem )
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
			// initializeSpaceship();
			animate();
		});

		loadCelestialBody(system, scene);

		function loadCelestialBody(body, parentRef) {
			loader.load(
				body.texture,
				function (texture) {
					var ob = new CelestialBody(body, parentRef, texture);
					celestialBodies.set(body.name, ob);
					//HUD.trackObject(ob);
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

	window.addEventListener("resize", function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	});
});
