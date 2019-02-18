let img;
let poseNet;
let poses = [];
let width, height;

function setup() {

    let image_url = '6.jpg';
    let dom_img = document.createElement('img');
    dom_img.src = image_url;
    dom_img.onload = function(){
        
        width = dom_img.width;
        height = dom_img.height;

        createCanvas(width, height);
        // create an image using the p5 dom library
        // call modelReady() when it is loaded
        img = createImg(image_url, imageReady);
        // set the image size to the size of the canvas
        img.size(width, height);
    
        img.hide(); // hide the image in the browser
        frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
    }
}

// when the image is ready, then load up poseNet
function imageReady(){
    // set some options
    let options = {
        imageScaleFactor: 1,
        minConfidence: 0.1
    }
    
    // assign poseNet
    poseNet = ml5.poseNet(modelReady, options);
    // This sets up an event that listens to 'pose' events
    poseNet.on('pose', function (results) {
        poses = results;
        console.log("poses", poses);
    });
}

// when poseNet is ready, do the detection
function modelReady() {
    select('#status').html('Model Loaded');
     
    // When the model is ready, run the singlePose() function...
    // If/When a pose is detected, poseNet.on('pose', ...) will be listening for the detection results 
    // in the draw() loop, if there are any poses, then carry out the draw commands
    poseNet.singlePose(img)
}

// draw() will not show anything until poses are found
function draw() {
    if (poses.length > 0) {
        image(img, 0, 0, width, height);
        drawSkeleton(poses);
        drawKeypoints(poses);
        noLoop(); // stop looping when the poses are estimated
    }

}

// The following comes from https://ml5js.org/docs/posenet-webcam
// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255);
                stroke(20);
                strokeWeight(4);
                ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
            }
        }
    }
}

var Drone = {
    max_height: 1000
};

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected

    var positions = {a: {}, b: {}, c: {}};

    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];

            var unique = partA.part + '_' + partB.part;

            if(unique === 'leftElbow_leftShoulder'){
                positions['a'] = partB.position;
                positions['b'] = partA.position;
                stroke(0,255,0);
            }else if(unique === 'leftHip_leftShoulder'){
                positions['c'] = partA.position;
                stroke(0,255,0);
            }else{
                stroke(255);
            }
            
            strokeWeight(1);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);

        }
    }

    
    let radianes = ObtenerRadianes(Punto(positions.b.x, positions.b.y), Punto(positions.a.x, positions.a.y), Punto(positions.c.x, positions.c.y));
    let angulo = Angulo(radianes);
    
    var distancia = {x: 0, y: (angulo  / 180) * Drone.max_height};

    console.log("positions", positions, "Ángulo: ", angulo, "Distancia vertical: ", distancia.y, "cm.");

    EjemploAngulos(positions)  

}

/**
 * Crea un punto
 * @param {Number} x 
 * @param {Number} y 
 */
const Punto = (x, y) => ({x,y});
/*function Punto(x, y){
    return {x, y}
}*/

/**
 * Convierte radianes a ángulo
 * @param {Number} radians 
 */
const Angulo = (radians) => 360 * radians / (2 * Math.PI)

/**
 * Obtiene radianes de 3 puntos
 * @param {ObjectConstructor} p1 
 * @param {ObjectConstructor} centro 
 * @param {ObjectConstructor} p2 
 */
const ObtenerRadianes = (p1, centro, p2) => {
	const transformedP1 = Punto(p1.x - centro.x, p1.y - centro.y)
	const transformedP2 = Punto(p2.x - centro.x, p2.y - centro.y)

	const angleToP1 = Math.atan2(transformedP1.y, transformedP1.x)
	const angleToP2 = Math.atan2(transformedP2.y, transformedP2.x)

	return angleToP2 - angleToP1;
}


function EjemploAngulos(defined_positions){
    const wrap = document.querySelector("#ejemplo_angulos")
    , a = wrap.querySelector('.a')
    , b = wrap.querySelector('.b')
    , c = wrap.querySelector('.c')
    , positions = defined_positions ? defined_positions : {a: {x: 70, y: 80}, b: {x: 120, y: 50}, c: {x: 70, y: 180}};

    function calc(){

        a.style.left = positions.a.x + "px";
        a.style.top = positions.a.y + "px";
    
        b.style.left = positions.b.x + "px";
        b.style.top = positions.b.y + "px";
    
        c.style.left = positions.c.x + "px";
        c.style.top = positions.c.y + "px";

        
        let radianes = ObtenerRadianes(Punto(positions.b.x, positions.b.y), Punto(positions.a.x, positions.a.y), Punto(positions.c.x, positions.c.y));
        let angulo = Angulo(radianes);
    
   
        var distancia = {x: 0, y: (angulo  / 180) * Drone.max_height};

        console.log("positions", positions, "Ángulo: ", angulo, "Distancia vertical: ", distancia.y, "cm.");
    }

    wrap.onclick = (event) => {
  
        positions.b.x = event.offsetX;
        positions.b.y = event.offsetY;

        calc();
    }

    calc();
}



document.addEventListener("DOMContentLoaded", function(event) { 
    
});



function normaliseToInteriorAngle(angle) {
	if (angle < 0) {
		angle += (2*Math.PI)
	}
	if (angle > Math.PI) {
		angle = 2*Math.PI - angle
	}
	return angle
}
