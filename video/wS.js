// Copyright (c) Walter Chapilliquen <wz.vang@gmail.com> ml5

const colors = {
	"leftHip_rightHip" : '#FF0000', //Cadera izquierda a derecha
	"leftShoulder_rightShoulder": '#FF0000', //Hombro izquierdo a derecho
	
	"leftElbow_leftShoulder": '#00FF00', //codo izquiero a hombro
	"leftElbow_leftWrist": '#00FF00', //codo izquierdo a muñeca

	"rightElbow_rightShoulder": '#00FF00', //codo derecho a hombro
	"rightElbow_rightWrist": '#00FF00', //codo derecho a muñeca
	
};

function Ready() {

	let 
		params = {}, //Configuración
		poses = [], // Poses array
		FLYING = true; //Define si está activo el bucle de reconocimiento

	const wrap = document.querySelector('body'); //Cuerpo página
	var video = document.createElement('video'); //Video
	var canvas = document.createElement('canvas'); //Canvas
	var ctx = canvas.getContext('2d'); //Contexto Canvas

	//Agregar elementos a cuerpo
	wrap.appendChild(video);
	wrap.appendChild(canvas);

	//Crear video a partir de cámara
	/*if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
	  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		video.srcObject=stream;
		video.play();
	  });
	}
	iniciar();
	*/
	//crear video a partir de cámara

	//Crear video a partir de URL
	video.src = "7.mp4";
	video.style.display = "none";
	video.controls = true;
	video.addEventListener('loadeddata', () => {
		video.currentTime = 0;
		video.play();
		//this.playbackRate = 0.3; //velocidad video
		iniciar();
	}, false);
	video.addEventListener("play", () => turnOn(true));
	video.addEventListener("pause", () => turnOn(false));
	canvas.ondblclick = () => {
		video[FLYING ? 'pause' : 'play']()
		turnOn(!FLYING)
	};
	function turnOn(value) {
		FLYING = value
	}
	//crear video a partir de URL

	function iniciar() {
		// crear clase posenet y añadir el evento de captura
		const poseNet = ml5.poseNet(video, () => {
			console.log("modelo cargado")
		});
		poseNet.on('pose', (results) => {
			poses = results;
		});
	}

	/**
	 * Bucle captura
	 */
	function loop() {
		if (FLYING) {
			// Dibuja canvas
			ctx.drawImage(video, 0, 0, params.width, params.height);
			// Dibuja puntos y esqueleto
			drawKeypoints();
			drawSkeleton();
		}
		window.requestAnimationFrame(loop);
	}

	loop();

	// A function to draw ellipses over the detected keypoints
	function drawKeypoints() {
		// Loop through all the poses detected
		for (let i = 0; i < poses.length; i++) {
			// For each pose detected, loop through all the keypoints
			for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
				let keypoint = poses[i].pose.keypoints[j];
				// Only draw an ellipse is the pose probability is bigger than 0.2
				if (keypoint.score > 0.2) {
					ctx.strokeStyle = "#FF0000";
					ctx.beginPath();
					ctx.arc(keypoint.position.x, keypoint.position.y, 3, 0, 2 * Math.PI);
					ctx.stroke();
				}
			}
		}
	}

	// A function to draw the skeletons
	function drawSkeleton() {
		// Loop through all the skeletons detected
		for (let i = 0; i < poses.length; i++) {
			// For every skeleton, loop through all body connections
			for (let j = 0; j < poses[i].skeleton.length; j++) {
				let partA = poses[i].skeleton[j][0];
				let partB = poses[i].skeleton[j][1];
				ctx.strokeStyle = colors[partA.part + "_" + partB.part] || "#FFFFFF";
				ctx.beginPath();
				ctx.moveTo(partA.position.x, partA.position.y);
				ctx.lineTo(partB.position.x, partB.position.y);
				ctx.stroke();
			}
		}
		console.log("poses", poses);
	}

	function configure(attrs) {
		video.width = canvas.width = params.width = attrs.width;
		video.height = canvas.height = params.height = attrs.height;
	}

	configure({
		width: window.innerWidth,
		height: window.innerHeight
	});

	window.addEventListener('resize', () => configure({
		width: window.innerWidth,
		height: window.innerHeight
	}));
}

window.addEventListener('load', Ready);