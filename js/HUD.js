function HUDControls(renderer, camera) {

	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	this.renderer = renderer;
	this.camera = camera; // The "normal" view (the perspective camera)

	this.sceneHUD = new THREE.Scene();
	this.cameraHUD = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
	//console.log(this.cameraHUD);
	this.sceneHUD.add(this.cameraHUD);
	this.sceneHUD.add(new THREE.AmbientLight(0xffffff));

	this.trackedItemsGroup = new THREE.Group();
	this.sceneHUD.add(this.trackedItemsGroup);

	this.trackedItemsArray = [];

	// Change the color of the tracker
	this.colors = {
		type1: 0xFF0000,
		type2: 0x00FF00,
		type3: 0x0000FF
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
		var objectColor = this.colors[trackedItem.type] ? this.colors[trackedItem.type] : 0x000000;
		var hudMaterial = new THREE.MeshPhongMaterial({ color: objectColor, side: THREE.DoubleSide });
		//console.log("Astre " + trackedItem.name + " de type : '" + trackedItem.type +"' et de couleur : '" + this.colors[trackedItem.type] + "'");


		var hudData = new THREE.Mesh(hudGeometry, hudMaterial);

		hudData.scale.set(50, 50, 50);
		hudData.visible = trackedItem.visible ? trackedItem.visible : true;
		hudData.tracked = trackedItem.reference;

		this.trackedItemsArray.push(trackedItem);
		this.trackedItemsGroup.add(hudData);
	}

	// ========== Internals ==========

	var scope = this;
	var cameraPerspective = scope.camera;
	var cameraOrthographic = scope.cameraHUD;

	function updateTrackedItems() {
		var centerPoint = cameraPerspective.position;

		scope.trackedItemsGroup.children.forEach(function(tracker) {

			var target = tracker.tracked;

			if (checkCameraPlane(target, cameraPerspective)) {

				var position = findHudPosition(target, cameraPerspective);

				if (position.distanceTo(centerPoint) <= 400 && position.dot(centerPoint) >= 0) {
					tracker.lookAt(cameraOrthographic);
				} else {
					tracker.lookAt(position);
					position.clampLength(0, 400);
				}

				tracker.position.set(position.x, position.y, position.z);
				tracker.visible = true;

			} else {
				tracker.visible = false;
				/*var position = findHudPosition(target, cameraPerspective);
				tracker.lookAt(position);
				position.clampLength(0, 400);
				tracker.position.set(position.x, position.y, position.z);*/

			}
		});
	}

	/* Vérifie que l'objet soit "en face" de la caméra */
	function checkCameraPlane(obj, camera) {
		var cameraDirection = camera.getWorldDirection();
		var objectDirection = new THREE.Vector3(0, 0, 0);
		objectDirection.subVectors(obj.getWorldPosition(), camera.getWorldPosition());

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
		scope.renderer.clearDepth();

		scope.renderer.render(scope.sceneHUD, scope.cameraHUD);
	}

	this.resize = function(width, height) {
		scope.cameraHUD.aspect = width / height;
		scope.cameraHUD.updateProjectionMatrix();
	}
}
