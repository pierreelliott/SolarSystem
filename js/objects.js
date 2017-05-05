function initObjects() {
	console.log("Function initObjects");

	solarSystem = new THREE.Object3D();

	mercureReferenceSun = new THREE.Object3D();
	mercureReference = new THREE.Object3D();
	venusReferenceSun = new THREE.Object3D();
	earthReferenceSun = new THREE.Object3D();
	earthReference = new THREE.Object3D();
	moonReference = new THREE.Object3D();
	marsReferenceSun = new THREE.Object3D();
	jupiterReferenceSun = new THREE.Object3D();
	saturnReferenceSun = new THREE.Object3D();
	saturnReference = new THREE.Object3D();
	uranusReferenceSun = new THREE.Object3D();
	uranusReference = new THREE.Object3D();
	neptuneReferenceSun = new THREE.Object3D();

	ball = new THREE.SphereGeometry(1, 32, 32);
	ring = new THREE.RingGeometry( 3, 5, 50);
}


function initTextures() {
	console.log("Function initTextures");

	starsTexture = new THREE.TextureLoader().load( "stars.jpg" );
	starsTexture.wrapS = THREE.RepeatWrapping;
	starsTexture.wrapT = THREE.RepeatWrapping;
	starsTexture.repeat.set( 6, 6 );

	sunTexture = new THREE.TextureLoader().load( "sun.jpg" );
	mercureTexture = new THREE.TextureLoader().load( "mercure.jpg" );
	venusTexture = new THREE.TextureLoader().load( "venus.jpg" );
	earthTexture = new THREE.TextureLoader().load( "earth.jpg" );
	moonTexture = new THREE.TextureLoader().load( "moon.jpg" );
	marsTexture = new THREE.TextureLoader().load( "mars.jpg" );
	jupiterTexture = new THREE.TextureLoader().load( "jupiter.jpg" );
	saturnTexture = new THREE.TextureLoader().load( "saturn.jpg" );
	saturnRingsTexture = new THREE.TextureLoader().load( "saturn_rings.png" );
	uranusTexture = new THREE.TextureLoader().load( "uranus.jpg" );
	neptuneTexture = new THREE.TextureLoader().load( "neptune.jpg" );

	starsMaterial = new THREE.MeshPhongMaterial( { map: starsTexture, side: THREE.DoubleSide } );
	sunMaterial = new THREE.MeshPhongMaterial( { emissiveMap: sunTexture, emissive: 0xFFFFFF } );
	mercureMaterial = new THREE.MeshPhongMaterial( { map: mercureTexture } );
	venusMaterial = new THREE.MeshPhongMaterial( { map: venusTexture } );
	earthMaterial = new THREE.MeshPhongMaterial( { map: earthTexture } );
	moonMaterial = new THREE.MeshPhongMaterial( { map: moonTexture } );
	marsMaterial = new THREE.MeshPhongMaterial( { map: marsTexture } );
	jupiterMaterial = new THREE.MeshPhongMaterial( { map: jupiterTexture } );
	saturnMaterial = new THREE.MeshPhongMaterial( { map: saturnTexture } );
	saturnRingsMaterial = new THREE.MeshPhongMaterial( { map: saturnRingsTexture, side: THREE.DoubleSide } );
	uranusMaterial = new THREE.MeshPhongMaterial( { map: uranusTexture } );
	neptuneMaterial = new THREE.MeshPhongMaterial( { map: neptuneTexture } );
}

function initCelestialBodies() {
	console.log("Function initCelestialBodies");

	stars = new THREE.Mesh(ball, starsMaterial);
	sun = new THREE.Mesh(ball, sunMaterial);
	mercure = new THREE.Mesh(ball, mercureMaterial);
	venus = new THREE.Mesh(ball, venusMaterial);
	earth = new THREE.Mesh(ball, earthMaterial);
	moon = new THREE.Mesh(ball, moonMaterial);
	mars = new THREE.Mesh(ball, marsMaterial);
	jupiter = new THREE.Mesh(ball, jupiterMaterial);
	saturn = new THREE.Mesh(ball, saturnMaterial);
	saturnRings = new THREE.Mesh(ring, saturnRingsMaterial);
	uranus = new THREE.Mesh(ball, uranusMaterial);
	neptune = new THREE.Mesh(ball, neptuneMaterial);
}

function init() {
	initObjects();
	initTextures();
	initCelestialBodies();

	light = new THREE.PointLight( 0xFFFFFF, 1, 200, 2 );
	ambientlight = new THREE.AmbientLight( 0x202020 );
	scene.add(light);
	scene.add(ambientlight);

	scene.add(solarSystem);
	stars.scale.set(300,300,300);
	sun.scale.set(1.5, 1.5, 1.5);

	// Pour que ce soit un peu plus réaliste : sun.scale(10,10,10) et UA = 30
	UA = 5;
	earthYear = 0.0005;
	earthDay = earthYear*365.25;

	solarSystem.add(stars);
	solarSystem.add(sun);

	solarSystem.add(earthReferenceSun);
	solarSystem.add(marsReferenceSun);
	solarSystem.add(mercureReferenceSun);
	solarSystem.add(venusReferenceSun);
	solarSystem.add(jupiterReferenceSun);
	solarSystem.add(saturnReferenceSun);
	solarSystem.add(uranusReferenceSun);
	solarSystem.add(neptuneReferenceSun);

	console.log("Add references to sun position");

	mercureReferenceSun.add(mercureReference);
	mercureReference.add(mercure);
	mercure.scale.set(0.1,0.1,0.1);
	mercure.position.x = 0.4*UA;

	venusReferenceSun.add(venus);
	venus.scale.set(0.29,0.29,0.29);
	venus.position.x = 0.7*UA;

	earthReferenceSun.add(earthReference);
	earthReference.position.x = UA;
	earthReference.scale.set(0.3,0.3,0.3);
	earthReference.add(earth);
	earth.rotation.z = 0.2;

	earthReference.add(moonReference);
	moonReference.add(moon);
	moon.scale.set(0.273,0.273,0.273);
	moon.position.x = 1.8;

	marsReferenceSun.add(mars);
	mars.scale.set(0.16,0.16,0.16);
	mars.position.x = 1.5*UA;

	console.log("Add planets up to Mars");

	// Pour les astéroïdes
	/*
	   asteroideX = Math.random (de 0 à 13)
	   y = Math.sqrt(13*13 - asteroideX)
	*/

	jupiterReferenceSun.add(jupiter);
	jupiter.scale.set(1.2,1.2,1.2);
	jupiter.position.x = 5.2*UA;

	saturnReferenceSun.add(saturnReference);
	saturnReference.position.x = 9.5*UA;
	saturnReference.scale.set(1.05,1.05,1.05);
	saturnReference.add(saturn);
	saturnReference.add(saturnRings);
	saturnRings.rotation.x = 1.3;
	saturnRings.scale.set(0.4,0.4,0.4);

	uranusReferenceSun.add(uranusReference);
	uranusReference.scale.set(1.2,1.2,1.2);
	uranusReference.position.x = 19.6*UA;
	uranusReference.rotation.z = 3.14/2;
	uranusReference.add(uranus);

	neptuneReferenceSun.add(neptune);
	neptune.scale.set(1.2,1.2,1.2);
	neptune.position.x = 30*UA;

	console.log("Add all planets now");
}

function ajouterTrainee(reference) {
	var traineeReference = new THREE.Object3D();
	var traineeTexture = new THREE.TextureLoader().load( "mercure.jpg" );
	var traineeMaterial = new THREE.MeshPhongMaterial( { color: 0xF0F0F0 } );
	
	reference.add(traineeReference);
	
	for(var i = 0; i < 20; i++) {
		var trainee = new THREE.Mesh(ball, traineeMaterial);
		trainee.scale.set(0.2,0.2,0.2);
		
		traineeReference.add(trainee);
		trainee.position.z = 2;
		traineeReference.rotation.z -= 0.01;
	}
}

function ajouterTrainee2(reference) {
	var p = new THREE.Vector3();
	var traineeReference = new THREE.Object3D();
	var traineeMaterial = new THREE.MeshPhongMaterial( { color: 0xF0F0F0 } );
	trainee = new THREE.Mesh(ball, traineeMaterial);
	
	var mat = reference.matrixWorld;
	p.applyMatrix4(mat);
	
	reference.add(traineeReference);
	solarSystem.add(trainee);
	trainee.scale.set(0.1,0.1,0.1);
	
	console.log(p);
	trainee.position.copy(p);
}


