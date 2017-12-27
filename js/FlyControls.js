/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {

	this.object = object;
	//this.camera = options.camera;

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', - 1 );

	// API
	
	// Set to false to disable this control
	this.enabled = true;
	
	// Set to true to enable damping (inertia)
	this.enableDamping = false;
	this.dampingFactor = 0.25;
	
	// Set to true/false to enable corresponding moving axis
	this.enableYawing = true; 				// Yaw left / Yaw right
	this.enablePitching = true; 			// Pitch up / Pitch down
	this.enableRolling = true; 				// Roll left / Roll right
	this.enableMoving = true; 				// Forward / Backward
	this.enableVerticalMoving = false; 		// Up / Down
	this.enableHorizontalMoving = false; 	// Left / Right

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;

	// Set to true to allow moving with the mouse
	this.dragToLook = false;
	
	// Set to true to enable auto-forward
	// If enabled, the object will continue to move forward until 'Backward key' is pushed
	this.autoForward = false;

	// disable default target object behavior

	// internals

	this.tmpQuaternion = new THREE.Quaternion();

	this.mouseStatus = 0;
	
	this.keys = {
		YAWLEFT: 81 /*Q*/, YAWRIGHT: 68 /*D*/,
		PITCHUP: 82 /*R*/, PITCHDOWN: 70 /*F*/,
		FORWARD: 90 /*Z*/, BACKWARD: 83 /*S*/,
		LEFT: 37 /*left*/, RIGHT: 39 /*right*/,
		UP: 38 /*up*/, DOWN: 40 /*down*/,
		ROLLLEFT: 65 /*A*/, ROLLRIGHT: 69 /*E*/
	};

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new THREE.Vector3( 0, 0, 0 );
	this.rotationVector = new THREE.Vector3( 0, 0, 0 );
	
	// ====== Public methods ======

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};
	
	this.update = function( delta ) {

		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;

		this.object.translateX( this.moveVector.x * moveMult );
		this.object.translateY( this.moveVector.y * moveMult );
		this.object.translateZ( this.moveVector.z * moveMult );

		this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
		this.object.quaternion.multiply( this.tmpQuaternion );

		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );

	};
	
	this.getContainerDimensions = function() {

		if ( this.domElement != document ) {

			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};

		} else {

			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};

		}

	};
	
	this.dispose = function() {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', _mousedown, false );
		this.domElement.removeEventListener( 'mousemove', _mousemove, false );
		this.domElement.removeEventListener( 'mouseup', _mouseup, false );

		window.removeEventListener( 'keydown', _keydown, false );
		window.removeEventListener( 'keyup', _keyup, false );

	};
	
	// ====== Internals ======
	
	var scope = this;
	
	function horizontalMoving() {
		
	}
	function verticlaMoving() {
		
	}
	function moving() {
		
	}
	function yawing() {
		
	}
	function rolling() {
		
	}
	function pitching() {
		
	}

	function keydown( event ) {
		
		if ( scope.enabled === false ) return;

		if ( event.altKey ) return;

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 16: /* shift */ scope.movementSpeedMultiplier = .1; break;

			case scope.keys.FORWARD:
				if( !scope.enableMoving ) break;
				scope.moveState.forward = 1;
				break;
			case scope.keys.BACKWARD:
				if( !scope.enableMoving ) break;
				scope.moveState.back = 1;
				break;

			case scope.keys.LEFT:
				if( !scope.enableHorizontalMoving ) break;
				scope.moveState.left = 1;
				break;
			case scope.keys.RIGHT:
				if( !scope.enableHorizontalMoving ) break;
				scope.moveState.right = 1;
				break;

			case scope.keys.UP:
				if( !scope.enableVerticalMoving ) break;
				scope.moveState.up = 1;
				break;
			case scope.keys.DOWN:
				if( !scope.enableVerticalMoving ) break;
				scope.moveState.down = 1;
				break;

			case scope.keys.PITCHUP:
				scope.moveState.pitchUp = 1;
				break;
			case scope.keys.PITCHDOWN:
				scope.moveState.pitchDown = 1;
				break;

			case scope.keys.YAWLEFT:
				scope.moveState.yawLeft = 1;
				break;
			case scope.keys.YAWRIGHT:
				scope.moveState.yawRight = 1;
				break;

			case scope.keys.ROLLLEFT:
				scope.moveState.rollLeft = 1;
				break;
			case scope.keys.ROLLRIGHT:
				scope.moveState.rollRight = 1;
				break;

		}

		updateMovementVector();
		updateRotationVector();

	};

	function keyup( event ) {
		
		if ( scope.enabled === false ) return;

		switch ( event.keyCode ) {

			case 16: /* shift */ scope.movementSpeedMultiplier = 1; break;

			case scope.keys.FORWARD: scope.moveState.forward = 0; break;
			case scope.keys.BACKWARD: scope.moveState.back = 0; break;

			case scope.keys.LEFT: scope.moveState.left = 0; break;
			case scope.keys.RIGHT: scope.moveState.right = 0; break;

			case scope.keys.UP: scope.moveState.up = 0; break;
			case scope.keys.DOWN: scope.moveState.down = 0; break;

			case scope.keys.PITCHUP: scope.moveState.pitchUp = 0; break;
			case scope.keys.PITCHDOWN: scope.moveState.pitchDown = 0; break;

			case scope.keys.YAWLEFT: scope.moveState.yawLeft = 0; break;
			case scope.keys.YAWRIGHT: scope.moveState.yawRight = 0; break;

			case scope.keys.ROLLLEFT: scope.moveState.rollLeft = 0; break;
			case scope.keys.ROLLRIGHT: scope.moveState.rollRight = 0; break;

		}

		updateMovementVector();
		updateRotationVector();

	};

	function mousedown( event ) {
		
		if ( this.enabled === false ) return;

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {

			this.mouseStatus ++;

		} else {

			switch ( event.button ) {

				case 0: this.moveState.forward = 1; break;
				case 2: this.moveState.back = 1; break;

			}

			updateMovementVector();

		}

	};

	function mousemove( event ) {
		
		if ( this.enabled === false ) return;

		if ( ! this.dragToLook || this.mouseStatus > 0 ) {

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			updateRotationVector();

		}

	};

	function mouseup( event ) {
		
		if ( this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {

			this.mouseStatus --;

			this.moveState.yawLeft = this.moveState.pitchDown = 0;

		} else {

			switch ( event.button ) {

				case 0: this.moveState.forward = 0; break;
				case 2: this.moveState.back = 0; break;

			}

			updateMovementVector();

		}

		updateRotationVector();

	};

	function updateMovementVector() {

		var forward = ( scope.moveState.forward || ( scope.autoForward && ! scope.moveState.back ) ) ? 1 : 0;

		scope.moveVector.x = ( - scope.moveState.left    + scope.moveState.right );
		scope.moveVector.y = ( - scope.moveState.down    + scope.moveState.up );
		scope.moveVector.z = ( - forward + scope.moveState.back );

		//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

	};

	function updateRotationVector() {

		scope.rotationVector.x = ( - scope.moveState.pitchDown + scope.moveState.pitchUp );
		scope.rotationVector.y = ( - scope.moveState.yawRight  + scope.moveState.yawLeft );
		scope.rotationVector.z = ( - scope.moveState.rollRight + scope.moveState.rollLeft );

		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	}

	function contextmenu( event ) {

		event.preventDefault();

	}

	// ====== Events ======
	
	var _mousemove = bind( this, mousemove );
	var _mousedown = bind( this, mousedown );
	var _mouseup = bind( this, mouseup );
	var _keydown = bind( this, keydown );
	var _keyup = bind( this, keyup );

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );

	this.domElement.addEventListener( 'mousemove', _mousemove, false );
	this.domElement.addEventListener( 'mousedown', _mousedown, false );
	this.domElement.addEventListener( 'mouseup',   _mouseup, false );

	window.addEventListener( 'keydown', _keydown, false );
	window.addEventListener( 'keyup',   _keyup, false );

	updateMovementVector();
	updateRotationVector();

};
