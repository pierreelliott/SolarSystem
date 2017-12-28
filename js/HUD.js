function HUDControls(renderer, camera) {
	
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	
	this.renderer = renderer;
	this.camera = camera; // The "normal" view (the perspective camera)	
	
	this.sceneHUD = new THREE.Scene();
	this.cameraHUD = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
	this.sceneHUD.add(this.cameraHUD);
	this.sceneHUD.add(new THREE.AmbientLight(0xffffff));
	
	this.trackedItemsGroup = new THREE.Group();
	this.sceneHUD.add(this.trackedItemsGroup);
	
	this.trackedItemsArray = [];
	
	this.colors = {
		PLANET: 0x00FF00,
		STAR: 0xFF0000,
		SATELLITE: 0x0000FF
	}
	
	// ========== Public methods ==========
	
	this.update = function() {
		// Things...
		updateTrackedItems();
		
		render();
	}
	
	this.render = function() {
		render();
	}
	
	this.trackObject = function(trackedItem) {
		var hudGeometry = new THREE.ConeGeometry(0.1, 0.2, 16);
		hudGeometry.rotateX(Math.PI * 0.5);
		var hudMaterial = new THREE.MeshPhongMaterial({ color: this.colors[trackedItem.type], side: THREE.DoubleSide });
		//console.log("Astre " + trackedItem.name + " de type : '" + trackedItem.type +"' et de couleur : '" + this.colors[trackedItem.type] + "'");


		var hudData = new THREE.Mesh(hudGeometry, hudMaterial);

		hudData.scale.set(50, 50, 50);
		hudData.visible = false;
		hudData.tracked = trackedItem.reference;

		this.trackedItemsArray.push(trackedItem);
		this.trackedItemsGroup.add(hudData);
	}
	
	// ========== Internals ==========
	
	var scope = this;
	var cameraPerspective = scope.camera;
	var cameraOrthographic = scope.cameraHUD;
	
	function initHud_test(scope) {
		var hudGeometry = new THREE.ConeGeometry(0.1, 0.2, 16);
		hudGeometry.rotateX(Math.PI * 0.5);
		var hudMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });

		var hudData = new THREE.Mesh(hudGeometry, hudMaterial);
		hudData.scale.set(10,10,10);
		
		scope.sceneHUD.add(hudData);
	}
	
	function updateTrackedItems() {
		var centerPoint = new THREE.Vector3(0, 0, 1);

		scope.trackedItemsGroup.children.forEach(function(tracker) {
			
			var target = tracker.tracked;

			if (checkCameraPlane(target, cameraPerspective)) {
				
				var position = findHudPosition(target, cameraPerspective);

				if (position.distanceTo(centerPoint) <= 400) {
					tracker.lookAt(cameraOrthographic);
				} else {
					tracker.lookAt(position);
					position.clampLength(0, 400);
				}

				tracker.position.set(position.x, position.y, position.z);
				tracker.visible = true;
				
			} else {
				
				tracker.visible = false;
				
			}
		});
	}
	
	function checkCameraPlane(obj, camera) {
		var cameraDirection = camera.getWorldDirection();
		var objectDirection = new THREE.Vector3(0, 0, 0);
		objectDirection.subVectors(obj.position, camera.position);

		return cameraDirection.dot(objectDirection) >= 0;
	}

	function findHudPosition(obj, camera) {
		var vector = new THREE.Vector3();

		obj.updateMatrixWorld();
		vector.setFromMatrixPosition(obj.matrixWorld);
		vector.project(camera);

		vector.x *= (WIDTH / 2);
		vector.y *= (HEIGHT / 2);
		vector.z = 1;

		return vector;
	}
	
	function render() {
		scope.renderer.setViewport(0, 0, WIDTH, HEIGHT);
		scope.renderer.clearDepth();

		scope.renderer.render(scope.sceneHUD, scope.cameraHUD);
	}
	
	// =========== Events =============
	
	window.addEventListener( 'resize', onResize, false );
	
	function onResize() {
		scope.cameraHud.aspect = window.innerWidth / window.innerHeight;
		scope.cameraHud.updateProjectionMatrix();
	}
}