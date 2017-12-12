function updateSpeed (element) {
	var speed = element.value;
	var speedIndicator = document.getElementById("speedIndicator");

	speedIndicator.textContent = speed + "%";
}

function hideLoadingPanel() {
	var panel = document.getElementById("loadingPanel");
	panel.style.width = "0";
}
