window.onload = function() {
	console.log("hello");
	var container, stats;
	var camera, scene, renderer;
	var clock, controls, delta;
	var objectsMap = new Map();
	var objectsReferenceMap = new Map();
	var objectsReferenceOnParentMap = new Map();

	var earthDay = 0.5;
	var uniteAstronomique = 5;

	init();


	function init() {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		document.body.appendChild( renderer.domElement );

		clock = new THREE.Clock();
		delta = clock.getDelta();
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

		ajax("src/ressources.json", solarSystemInitialization )
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
		var objects = jsonFile.solarSystem.objects;
		var loader = new THREE.TextureLoader();
		var numberObjectsCreated = 0;

		var solarSystem = new THREE.Object3D();
		scene.add(solarSystem);
		objectsReferenceMap.set("solarSystem", { o: solarSystem });

		var ball = new THREE.SphereGeometry(1, 32, 32);
		var ring = new THREE.RingGeometry( 3, 5, 50);

		objects.forEach( function (e) {
			objectsReferenceMap.set(e.name+"Reference", { o: new THREE.Object3D() });
			objectsReferenceOnParentMap.set(e.name+"ReferenceOnParent",  { o: new THREE.Object3D(), rotation: e.parentRotation });
		});
		console.log("references created");

		var loadManagerVar = new LoadManager(objects.length);

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

	function LoadManager(count) {
		this.numberObjectsCreated = 0;
		this.max = count;
	}
	LoadManager.prototype.inc = function () {
		this.numberObjectsCreated++;
		console.log(this.numberObjectsCreated+" objets créés");
		if(this.numberObjectsCreated >= this.max) {
			console.log(objectsMap.get("sun"));
			animate();
		}
	}

	function animate() {
		requestAnimationFrame( animate );

		gravitateAroundParent();
		rotate();

		controls.update( delta );
		renderer.render( scene, camera );
	}

	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};

	function getRefsOnParent() {
		var array = [];
		objectsReferenceOnParentMap.forEach( function (val, key) {
			if(key.match(/.+ReferenceOnParent$/)) {
				array.push(key);
			}
		});
		return array;
	}
	function getCelestialBodies() {
		var array = [];
		objectsMap.forEach( function (val, key) {
			if(!key.match(/Reference/)) {
				array.push(key);
			}
		});
		return array;
	}

	function gravitateAroundParent() {
		var refsOnParentArray = getRefsOnParent();
		// == tous ceux qui sont appelés "[...]ReferenceSun"
		refsOnParentArray.forEach( function (e) {
			var obj = objectsReferenceOnParentMap.get(e);
			var mesh = obj.o;
			var r = obj.rotation;
			mesh.rotation.y += earthDay/r;
		});
	}

	function rotate() {
		var celestialBodies = getCelestialBodies();
		// == tous ceux qui ne sont pas appelés "[...]Reference[...]"

		celestialBodies.forEach( function (e) {
			var obj = objectsMap.get(e);
			var mesh = obj.o;
			var r = obj.rotation;
			mesh.rotation.y += earthDay/r;
		});
	}
}
