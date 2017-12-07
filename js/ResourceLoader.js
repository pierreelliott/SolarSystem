function loadResources(storage, param) {
	var src = param.src_file;

	if (typeof(Storage) !== "undefined") {
    	storage = window.localStorage;
	} else {
	    storage = new Map();
	}
}

function MapStorage(iterable) {
	Map.call(this, iterable);
}

MapStorage.prototype = Object.create(Map.prototype);
MapStorage.prototype.constructor = MapStorage;
