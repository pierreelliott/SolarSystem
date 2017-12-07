function resize(renderer, camera) {
	console.log("resizing");
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function cameraZoom(e) {
	//console.log(e);
    e.preventDefault();
	var move = e.deltaY/2, moveMin = 2, moveMax = 110;
	if((camera.position.z + move) > moveMin && (camera.position.z + move) < moveMax) {
		camera.position.z += move;
	}
}

function cameraRotate(e) {
	//console.log(e);
    e.preventDefault();
	camera.position.z += e.deltaY;
    /*if(e.deltaY < 0)
    { camera.position.z -= 1; }
    else
    { camera.position.z += 1; }*/
}

function leftClickOnView(e) {
	e.preventDefault();
	document.getElementById('mainView').addEventListener("click", leftClickOnView );
}
