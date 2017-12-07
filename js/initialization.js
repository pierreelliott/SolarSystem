window.onload = function() {
	var container, stats;
	var camera, scene, renderer;
	var sphere;
	var object;
	var storage;

	loadResources(storage, { src_file: "../src/ressources.json" });

	init(container, camera, scene, renderer);
}

function init(container, camera, scene, renderer) {
				container = document.getElementById( 'mainViewContainer' );
				// scene
				scene = new THREE.Scene();
				// camera
				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.set( 1000, 50, 1500 );
				// lights
				var light, materials;
				scene.add( new THREE.AmbientLight( 0x666666 ) );
				light = new THREE.DirectionalLight( 0xdfebff, 1 );
				light.position.set( 50, 200, 100 );
				light.position.multiplyScalar( 1.3 );
				light.castShadow = true;
				light.shadow.mapSize.width = 1024;
				light.shadow.mapSize.height = 1024;
				var d = 300;

				var loader = new THREE.TextureLoader();
				var clothTexture = loader.load( 'textures/patterns/circuit_pattern.png' );
}
