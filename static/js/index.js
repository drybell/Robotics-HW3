

// https://codepen.io/zalo/pen/MLBKBv?editors=0011

import {
  BoxBufferGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  Mesh,
  Clock,
  Points,
  MeshBasicMaterial,
  PerspectiveCamera,
  PointsMaterial,
  Scene,
  WebGLRenderer,
  HemisphereLight,
  MOUSE,
  Vector3, 
  Quaternion,
  Euler,
  PlaneBufferGeometry,
  MeshPhysicalMaterial,
  DirectionalLight,
  MeshPhongMaterial,
  GridHelper,
  MeshLambertMaterial,
  Group,
  AxesHelper,
  Matrix4,
  Vector2,
  CatmullRomCurve3,
  TextureLoader,
  PlaneGeometry,
  EllipseCurve,
  LineBasicMaterial,
  Line
} from './three.module.js';

import { OrbitControls } from './OrbitControls.js';
import { DragControls } from './DragControls.js';
import { STLLoader } from './STLLoader.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { GLTFExporter } from './GLTFExporter.js';
// import { ImageLoader } from './ImageLoader.js';


// const curve = new SplineCurve();

// const path_material = LineBasicMaterial( { color : 0xff0000 } );

var clock = new Clock();
const container = document.querySelector('#container');
const scene = new Scene();

scene.background = new Color('skyblue');

var white = new MeshLambertMaterial({ color: 0x888888 });

const fov = 35; // AKA Field of View
const aspect = container.clientWidth / container.clientHeight;
const near = 0.1; // the near clipping plane
const far = 3500; // the far clipping plane

const camera = new PerspectiveCamera(fov, aspect, near, far);
var draggableObjects = new Array();
camera.position.set(650, 300, 0);
// camera.position.set(1400, 700, -1000);

// const geometry = new BoxBufferGeometry(2, 2, 2);
const boxGeometry = new BoxBufferGeometry(100, 100, 100);
const material = new MeshBasicMaterial();
// const cube = new Mesh(geometry, material);

let light = new DirectionalLight(0xbbbbbb);
light.position.set(0, 200, 100);
light.castShadow = true;
light.shadow.camera.top = 180;
light.shadow.camera.bottom = - 100;
light.shadow.camera.left = - 120;
light.shadow.camera.right = 120;
scene.add(light);

const axesHelper = new AxesHelper( 10 );
scene.add( axesHelper );

var mesh2 = new Mesh(new PlaneBufferGeometry(2000, 2000), new MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
mesh2.rotation.x = - Math.PI / 2;
mesh2.receiveShadow = true;
scene.add(mesh2);
var grid = new GridHelper(2000, 20, 0x000000, 0x000000);
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);

var target2 = new Mesh(boxGeometry, new MeshLambertMaterial({ color: 0x3399dd }));
// target2.position.set(150, 0, 80);
target2.scale.set(0.05, 0.05, 0.05);
target2.transparent = true;
target2.opacity = 0.5;
target2.castShadow = true;
target2.receiveShadow = true;
scene.add(target2);
draggableObjects.push(target2);
camera.lookAt(new Vector3(0,0,0));

var all_paths;
var travel_paths = new Group();
var travel_vectors = new Array();
var first_location = new Array();

window.onload = function () { 
  $.ajax({
    type: "GET",
    url: "/image",
  }).success(function(e) {
      let target_coords = e.coords;
      const mat = new PointsMaterial( { color : 0xff0000 } );
      let thresh = 3.9;
      let y_offset = 145;
      let x_offset = -110;
      scene.add(travel_paths);
      console.log(target_coords);
      for (let i = 0; i < target_coords.length; i ++ ) { 
        let temp = new Array();
        for (let j = 0; j < target_coords[i].length - 1; j += 2) { 
          // temp.push(new Vector3( target_coords[i][j], 0, target_coords[i][j + 1] ));
          let x = (target_coords[i][j] / thresh) + x_offset;
          let y = (target_coords[i][j + 1] / thresh) + y_offset;
          temp.push( y, 0, -1 * x);
        }
        // const line_geo = new BufferGeometry().setFromPoints( temp );
        const line_geo = new BufferGeometry();
        line_geo.setAttribute( 'position', new Float32BufferAttribute( temp, 3 ) );
        const temp_point = new Points( line_geo, mat );
        // temp_point.rotateY(radians(90));
        travel_paths.add(temp_point);
        // const travel_path = new Line(line_geo, mat);
        // travel_path.rotateY(-90);
        temp_point.geometry.attributes["position"];
      }
      scene.add(travel_paths);
      let temp_array = travel_paths.children[0].geometry.attributes["position"].array;
      first_location = temp_array.slice(0, 3);
      console.log(travel_paths);
      let coords_list = travel_paths.children.map( j => j.geometry.attributes["position"].array);
      for (let j = 0; j < coords_list.length; j ++) { 
        let temp = new Array();
        let curr_path = coords_list[j];
        for (let i = 0; i < curr_path.length; i += 3) {
          temp.push(new Vector3(curr_path[i], curr_path[i + 1], curr_path[i + 2]));
        }
        travel_vectors.push(temp);
      }
  });
}


// var target3 = new Mesh(boxGeometry, new MeshLambertMaterial({ color: 0x3399dd }));
// target3.position.set(10, 137, -127.5);
// target3.scale.set(0.1, 0.1, 0.1);
// target3.transparent = true;
// target3.opacity = 0.5;
// target3.castShadow = true;
// target3.receiveShadow = true;
// scene.add(target3);

scene.add(new HemisphereLight(0xffffff, 1.5));

const renderer = new WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(container.clientWidth, container.clientHeight);

renderer.setPixelRatio(window.devicePixelRatio);

container.append(renderer.domElement);

// renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.rotateSpeed = 0.35;
controls.dampingFactor = 0.6;
// controls.enableZoom = true;
// controls.enablePan = true;
// controls.enableRotate = true;
// controls.autoRotate = true;
// controls.autoRotateSpeed = 1;
controls.addEventListener('change', render);
controls.target.set(0, 45, 0);
controls.update();

const dragControls = new DragControls(draggableObjects, camera, renderer.domElement);

dragControls.addEventListener('dragstart', function () {
	controls.enabled = false;
});	

dragControls.addEventListener('dragend', function () {
	controls.enabled = true;
});

dragControls.addEventListener('hoveron', function () {
	controls.enabled = false;
});

dragControls.addEventListener('hoveroff', function () {
	controls.enabled = true;
});
const material2 = new MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );

const gltfloader = new GLTFLoader();
var base_group;
var humerus;
var servo_group;
var linear_servo_group;
var sm_servo;
var end_effector_arm;
var ee_; 
var pen;
var servo_hat;
var sm_servo_4;

// servo_hat, sm_servo_4, pen

gltfloader.load('./static/stl/arm.gltf',
  function ( gltf ) { 
    console.log(gltf.scene);
    let robot = gltf.scene;
    let full_robot = robot.clone().children[0];
    let robot_gltf = robot.clone(false);
    full_robot.children = [];

    let children_copy = robot.clone().children[0].children; 

    let base_0 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Base_Bot";
    });

    let base_1 = children_copy.find(obj => { 
      return obj.name === "occurrence_of_Base_Top";
    });

    base_group = new Group();
    base_group.add(base_0);
    base_group.add(base_1);

    let servo_base = children_copy.find(obj => {
      return obj.name === "occurrence_of_Servo_Bot";
    });

    let servo_1 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Servo_Mid";
    });

    let servo_2 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Servo_Top";
    });

    let servo_3 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Servo_Gear";
    });

    servo_hat = children_copy.find(obj => {
      return obj.name === "occurrence_of_Servo_Horn";
    });

    servo_group = new Group();
    servo_group.add(servo_base);
    servo_group.add(servo_1);
    servo_group.add(servo_2);
    servo_group.add(servo_3);

    humerus = children_copy.find(obj => {
      return obj.name === "occurrence_of_Humerus";
    });

    let small_servo = children_copy.find(obj => {
      return obj.name === "occurrence_of_BottomBody";
    });

    let sm_servo_1 = children_copy.find(obj => {
      return obj.name === "occurrence_of_MiddleBody";
    });

    let sm_servo_2 = children_copy.find(obj => {
      return obj.name === "occurrence_of_UpperBody";
    });

    let sm_servo_3 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Small_Mid_Gear";
    });

    sm_servo_4 = children_copy.find(obj => {
      return obj.name === "occurrence_of_GearTop";
    });

    sm_servo = new Group();
    sm_servo.add(small_servo);
    sm_servo.add(sm_servo_1);
    sm_servo.add(sm_servo_2);
    sm_servo.add(sm_servo_3);
    sm_servo.add(sm_servo_4);

    end_effector_arm = children_copy.find(obj => {
      return obj.name === "occurrence_of_Forearm";
    });

    let linear_servo = children_copy.find(obj => {
      return obj.name === "occurrence_of_Linear_Plate";
    });

    let linear_servo1 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Linear_Cyl";
    });

    let linear_servo2 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Linear_Shaft";
    });

    let linear_servo3 = children_copy.find(obj => {
      return obj.name === "occurrence_of_Linear_Gear";
    });

    linear_servo_group = new Group();
    linear_servo_group.add(linear_servo);
    linear_servo_group.add(linear_servo1);
    linear_servo_group.add(linear_servo2);
    linear_servo_group.add(linear_servo3);

    ee_ = children_copy.find(obj => {
      return obj.name === "occurrence_of_EE_Back";
    });

    let ee_1 = children_copy.find(obj => {
      return obj.name === "occurrence_of_EE_Front";
    });

    const ee = new Group();
    ee.add(ee_);
    ee.add(ee_1);

    pen = children_copy.find(obj => {
      return obj.name === "occurrence_of_Sharpie";
    });

    // let j1axis = new AxesHelper( 10 );
    // let j2axis = new AxesHelper( 10 );
    // let j3axis = new AxesHelper( 10 );

    servo_hat.rotateY(radians(180));
    servo_hat.rotateZ(radians(59));

    scene.attach(robot_gltf);
    robot_gltf.add(full_robot);
    full_robot.attach(base_group);
    base_0.attach(servo_group);
    servo_3.attach(servo_hat);
    servo_hat.attach(humerus);
    // servo_hat.add(j1axis);
    humerus.attach(sm_servo);
    sm_servo_4.attach(end_effector_arm);
    // sm_servo_4.add(j2axis);
    end_effector_arm.attach(ee);
    ee_.attach(linear_servo_group);
    ee_.attach(pen);
    // pen.add(j3axis);

    console.log(full_robot);

    base_group.scale.set(1000, 1000, 1000);
    base_group.rotateX(radians(-90));
    base_group.rotateZ(radians(-90));
  })


// https://stackoverflow.com/questions/44899019/how-to-draw-form-circle-with-two-points
function calculateRemainingPoint(points, x, precision, maxIteration) {
    if (x === void 0) { x = 0; };
    if (precision === void 0) { precision = 0.001; };
    if (maxIteration === void 0) { maxIteration = 10000; };
    var newPoint = {
        x: x,
        y: (points[0].y + points[1].y) / 2,
        r: 50
    };
    var d0 = distance(points[0].x, points[0].y, x, newPoint.y);
    var d1 = distance(points[1].x, points[1].y, x, newPoint.y);
    var iteration = 0;
    //Bruteforce approach
    while (Math.abs(d0 - d1) > precision && iteration < maxIteration) {
        var oldDiff = Math.abs(d0 - d1);
        var oldY = newPoint.y;
        iteration++;
        newPoint.y += oldDiff / 10;
        d0 = distance(points[0].x, points[0].y, x, newPoint.y);
        d1 = distance(points[1].x, points[1].y, x, newPoint.y);
        var diff_1 = Math.abs(d0 - d1);
        if (diff_1 > oldDiff) {
            newPoint.y = oldY - oldDiff / 10;
            d0 = distance(points[0].x, points[0].y, x, newPoint.y);
            d1 = distance(points[1].x, points[1].y, x, newPoint.y);
        }
    }
    var diff = (points[0].x + points[1].x) / points[0].x;
    newPoint.r = d0;
    return newPoint;
}

function distance(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt(a * a + b * b);
}

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function downloadJSON( blob, filename ) {

	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
	// URL.revokeObjectURL( url ); breaks Firefox...

}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// j1 --> Vector3
// j2 --> Vector3 
function distanceBetween(j1, j2){
	return j1.distanceTo(j2);
}

// https://stackoverflow.com/questions/31973278/iterate-an-array-as-a-pair-current-next-in-javascript
function pairwise(arr, func){
	let new_arr = new Array(arr.length);
    for(let i=0; i < arr.length - 1; i++){
        new_arr[i] = func(arr[i], arr[i + 1])
    }
    return new_arr;
}

// https://stackoverflow.com/questions/9453421/how-to-round-float-numbers-in-javascript
function roundUsing(func, number, prec) {
    var tempnumber = number * Math.pow(10, prec);
    tempnumber     = func(tempnumber);
    return tempnumber / Math.pow(10, prec);
}

function orthogonal(p){
	let temp = p.clone();
	let x = Math.abs(p.x);
	let y = Math.abs(p.y);
	let z = Math.abs(p.z);

	let X_AXIS = new Vector3(1,0,0);
	let Y_AXIS = new Vector3(0,1,0);
	let Z_AXIS = new Vector3(0,0,1);

	let other = x < y ? (x < z ? X_AXIS : Z_AXIS) : (y < z ? Y_AXIS : Z_AXIS);
	temp.cross(other);
	return temp;
}

function quatToEuler(q){
	let phi1  = 2 * ((q.w * q.x) + (q.y * q.z));
    let phi2  = 1 - (2 * (q.x * q.x + q.y * q.y));
    let phi   = roundUsing(Math.floor, Math.atan2(phi1, phi2), 8);

    let theta = 2 * ((q.w * q.y) - (q.z * q.x));
    theta = theta > 1 ? 1 : theta;
    theta = theta < -1 ? -1 : theta;
    theta = roundUsing(Math.floor, Math.asin(theta), 8);

    let psi1  = 2 * ((q.w * q.z) + (q.x * q.y));
    let psi2  = 1 - (2 * (q.y * q.y + q.z * q.z));
    let psi   = roundUsing(Math.floor, Math.atan2(psi1, psi2), 8);

    return new Euler(phi, theta, psi);
}

// https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
const zip = (a, b) => a.map((k, i) => [k, b[i]]);

function degrees (angle) {
  return angle * (180 / Math.PI);
}

function radians (angle) {
  return angle * (Math.PI / 180);
}

function radsToQuaternion(psi, theta, phi){
	  let c3 = Math.cos(psi / 2);
    let s3 = Math.sin(psi / 2);
    let c2 = Math.cos(theta / 2);
    let s2 = Math.sin(theta / 2);
    let c1 = Math.cos(phi / 2);
    let s1 = Math.sin(phi / 2);

    let w = (c1 * c2 * c3) + (s1 * s2 * s3);
    let x = (s1 * c2 * c3) - (c1 * s2 * s3);
    let y = (c1 * s2 * c3) + (s1 * c2 * s3);
    let z = (c1 * c2 * s3) - (s1 * s2 * c3);

    return new Quaternion(x, y, z, w).normalize();
}

// v1 --> Vector3
// v2 --> Vector3
function findQuatForVecs(v1, v2){ 
	let v1_norm = v1.clone().normalize();
	let v2_norm = v2.clone().normalize();

	let _dot    = v1.dot(v2);
	let k       = Math.sqrt(v1.length() * v2.length());
	if (_dot / k == -1){
		let ortho = orthogonal(v1_norm).normalize();
		return new Quaternion(ortho.x, ortho.y, ortho.z, 0);
	}

	let quat_vec = v1_norm.clone().cross(v2_norm);
	let quat_w = _dot + k;
	return new Quaternion(quat_vec.x, quat_vec.y, quat_vec.z, quat_w);
}

// p -> Vector3
// q -> Quaternion
function rotatePByQuat(p, q){
	let q_norm  = q.clone().normalize();
	let q_vec   = new Vector3(q_norm.x, q_norm.y, q_norm.z, 0);
	let q_vec_2 = q_vec.clone().multiplyScalar(2);
	let t       = q_vec_2.clone().cross(p);

	let qw_times_t   = t.clone().multiplyScalar(q_norm.w);
	let p_plus_qw    = p.clone().add(qw_times_t);
	let cross_qvec_t = q_vec.clone().cross(t);
	let result = p_plus_qw.clone().add(cross_qvec_t);
	let rounded_x = roundUsing(Math.floor, result.x, 10);
	let rounded_y = roundUsing(Math.floor, result.y, 10);
	let rounded_z = roundUsing(Math.floor, result.z, 10);
	return new Vector3(rounded_x, rounded_y, rounded_z);
}

class SimpleArm {
	// nodes --> Array of Vec3
	// edges --> Array of pair of int 
	// anglelims --> Array of pair of int
	// axes --> array of Vec3
	constructor(nodes, edges, anglelims, axes, sizes){
		this.nodes       = nodes;
		this.edges       = edges;
		this.anglelims   = anglelims;
		this.axes        = axes;
		this.sizes       = sizes;
		this.angles      = new Array(edges.length).fill(0);
		this.eulerangles = new Array(edges.length).fill(new Euler(0,0,0));
		this.distances   = pairwise(nodes, distanceBetween);

		this.checkDistances = this.checkDistances.bind(this);
		this.createRobot = this.createRobot.bind(this);
		this.robot       = this.createRobot(scene);
		this.updateDistances = this.updateDistances.bind(this);
		this.setRobot = this.setRobot.bind(this);
		this.maxDistance = this.maxDistance.bind(this);
		this.num_nodes = this.num_nodes.bind(this);
		this.num_links = this.num_links.bind(this);
		this.getCurrMotorAngle = this.getCurrMotorAngle.bind(this);
		this.setAngles = this.setAngles.bind(this);
		this.getEndEffector = this.getEndEffector.bind(this);
		this.constrainQuat = this.constrainQuat.bind(this);
		this.CCDIKIter = this.CCDIKIter.bind(this);
		this.rotateJByQuat = this.rotateJByQuat.bind(this);
		this.getAngleLims = this.getAngleLims.bind(this);
		this.getNode = this.getNode.bind(this);
		this.getEulerAngles = this.getEulerAngles.bind(this);
		this.getAxis = this.getAxis.bind(this);

		this.tcp		 = new Vector3();
	}

	checkDistances(new_dists){
		let combined_dists = zip(this.distances, new_dists);
		console.log(combined_dists);
		let temp = new Array();
		combined_dists.forEach(e => {
			let e1 = e[0];
			let e2 = e[1];
			let a = roundUsing(Math.floor, e1, 6);
			let b = roundUsing(Math.floor, e2, 6);
			temp.push(a == b);
		});
		return temp.every(v => v === true); 
	}

	createRobot(base){
		let temp = new Array();
		for (let i = 0; i < this.num_nodes(); i++){
			let position = this.getNode(i).toArray();
			let size     = this.sizes[i];
			let joint    = new Group();
			// let graphicsOffset = 
			if (i == 0){
				let axis     = this.getAxis(i).toArray();
				let limits   = this.anglelims[i];
				base.add(joint);
				joint.position.set(position[0], position[1], position[2]);
				joint.axis = new Vector3(axis[0], axis[1], axis[2]);
				joint.minLimit = limits[0] * 0.0174533;
				joint.maxLimit = limits[1] * 0.0174533;
				temp.push(joint);
				let box = new Mesh(boxGeometry, white);
				joint.add(box);
				box.scale.set(size[0], size[1], size[2]);
				box.position.set(0, 0, 0);
				box.castShadow = true;
			}
			else if (i != this.num_links()){
				let axis     = this.getAxis(i).toArray();
				let limits   = this.anglelims[i];
				temp[i-1].add(joint);
				let prev_position = this.getNode(i - 1).toArray();
				position = [position[0] - prev_position[0], position[1] - prev_position[1], position[2] - prev_position[2]];
				joint.position.set(position[0], position[1], position[2]);
				joint.axis = new Vector3(axis[0], axis[1], axis[2]);
				joint.minLimit = limits[0] * 0.0174533;
				joint.maxLimit = limits[1] * 0.0174533;
				temp.push(joint);
				let box = new Mesh(boxGeometry, white);
				joint.add(box);
				box.scale.set(size[0], size[1], size[2]);
				box.position.set(0,0,0);
				box.castShadow = true;
			}
			else {
      			temp[i-1].add(joint);
      			let prev_position = this.getNode(i - 1).toArray();
				position = [position[0] - prev_position[0], position[1] - prev_position[1], position[2] - prev_position[2]];
      			joint.position.set(position[0], position[1], position[2]);
      			temp.push(joint);
      			let box = new Mesh(boxGeometry, white);
				joint.add(box);
				box.scale.set(size[0], size[1], size[2]);
				box.position.set(0,0,0);
				box.castShadow = true;
			}
		}
		console.log(temp);
		return temp;
	}

	updateDistances(){
		let temp = pairwise(this.nodes, distanceBetween);
		if (! this.checkDistances(temp)){
			console.log("WARNING: DISTANCES CHANGED");
		}
		this.distances = temp;
	}

	setRobot(robot){
		this.robot = robot;
	}

	maxDistance(){
		return this.distances.reduce((a, b) => a + b, 0);
	}

	num_nodes(){
		return this.nodes.length; 
	}

	num_links(){
		return this.edges.length;
	}

	getCurrMotorAngle(index){
		return this.angles[index];
	}

	setAngles(index, theta){
		this.angles[index] = theta;

		let curr_axis  = this.axes[index];
		let eulerarray = new Array(3);
		let i = curr_axis.toArray().indexOf(1);
		eulerarray[i] = radians(theta);

		this.eulerangles[i] = new Euler().fromArray(eulerarray);
	}

	getAngleLims(index){
		return this.anglelims[index];
	}

	getNode(index){
		return this.nodes[index];
	}

	getEulerAngles(){
		return this.anglelims;
	}

	getAxis(index){
		return this.axes[index];
	}

	getEndEffector(){
		return this.nodes.slice(-1)[0];
	}

	getDistanceOfJointLink(index){
		return this.distances[index];
	}

	setNode(index, node){
		this.nodes[index] = node;
	}

	constrainQuat(q, motor_index){
		let euler    = quatToEuler(q).toArray();
		let eulerdeg = new Array();
		euler.forEach(i => eulerdeg.push(degrees(i)));

		let axis   = this.getAxis(motor_index);
		let angles = this.getAngleLims(motor_index);
		let j_min = angles[0];
		let j_max = angles[1];
		let angle = this.getCurrMotorAngle(motor_index);
		let focus_index = axis.toArray().indexOf(1);
		let focus_angle = eulerdeg[focus_index];

		if (angle == j_min || angle == j_max){
			return new Quaternion(0,0,0,0);
		}
		else if (focus_angle < angle + j_min){
			euler[focus_index] = j_min;
			this.setAngles(motor_index, j_min);
			return radsToQuaternion(euler[2], euler[1], euler[0]);
		}
		else if (focus_angle > angle + j_max){
			euler[focus_index] = j_max;
			this.setAngles(motor_index, j_max);
			return radsToQuaternion(euler[2], euler[1], euler[0]);
		}
		else{
			this.setAngles(motor_index, angle + focus_angle);
			return q;
		}
	}

	rotateJByQuat(index, q){
		if (index == this.num_links()){
			return
		}

		for (let i = index + 1; i <= this.num_links(); i++){
			let vec = this.getNode(i);
			let prev_vec = this.getNode(i - 1);

			vec.clone().sub(prev_vec).applyQuaternion(q).add(prev_vec);
			this.setNode(i, vec);
		}
	}

	CCDIKIter(target){
		let tcp = new Vector3();
		for (let i = this.num_links() - 1; i >= 0; i--){
			this.robot[i].updateMatrixWorld();
			let curr_axis = this.getAxis(i);
			let angles = this.getAngleLims(i);
	        this.robot[this.num_links()].getWorldPosition(this.tcp);
	        let toolDirection = this.robot[i].worldToLocal(this.tcp.clone()).normalize();
	        let targetDirection = this.robot[i].worldToLocal(target.clone()).normalize();
	        let fromToQuat = new Quaternion(0, 0, 0, 1).setFromUnitVectors(toolDirection, targetDirection);
	        this.robot[i].quaternion.multiply(fromToQuat);

	        let invRot = this.robot[i].quaternion.clone().inverse();
	        let parentAxis = this.robot[i].axis.clone().applyQuaternion(invRot);
	        fromToQuat.setFromUnitVectors(this.robot[i].axis, parentAxis);
	        this.robot[i].quaternion.multiply(fromToQuat);
	        // this.robot[i].setRotationFromQuaternion(fromToQuat);

	        let clampedRot = this.robot[i].rotation.toVector3().clampScalar(radians(angles[0]), radians(angles[1]));
	        this.robot[i].rotation.setFromVector3(clampedRot);

	        this.robot[i].updateMatrixWorld();
	        // console.log(this.robot);
		}
	}
}

// arm    --> SimpleArm
// target --> Vector3 
// tolerance --> number
// steps  --> int
function CCDIK(arm, target, tolerance, steps){ 
	let ctr = 0;
	let dist = distanceBetween(arm.getEndEffector(), target);
	// console.log(dist);
	while (dist > tolerance && ctr < steps){
		for (let i = arm.num_links(); i >= 0; i--){
			let curr = arm.getNode(i);
			let ee   = arm.getEndEffector();

			let vec_to_ee     = ee.clone().sub(curr);
			let vec_to_target = target.clone().sub(curr); 

			let quat_rot      = findQuatForVecs(vec_to_ee, vec_to_target);
			let quat_inv      = quat_rot.clone().inverse();
			let curr_axis     = arm.getAxis(i);

			let parent_axis   = rotatePByQuat(curr_axis, quat_inv);
			let quat_axis     = findQuatForVecs(curr_axis, parent_axis);
			let new_quat      = quat_rot.clone().multiply(quat_axis);

			let new_q = arm.constrainQuat(new_quat, i);
			if (!new_q.equals(new Quaternion(0,0,0,0))){
				arm.rotateJByQuat(i, new_quat);
			}
		}
		dist = distanceBetween(arm.getEndEffector(), target);
		ctr++;
	}
}
// function maxDist(model){
// 	let temp_pos = new Array();
// 	let temp = new Vector3();
// 	model[0].getWorldPosition(temp)
// 	let base_length = temp.length();
// 	let summ_dists = base_length;
// 	model.forEach(e => {e.getWorldPosition(temp); temp_pos.push(temp);});

// 	for (let i=0; i < model.length - 1; i++){
// 		summ_dists += Math.abs(temp_pos[i].distanceTo(temp_pos[i+1]));
// 	}
// 	return summ_dists;
// }

	// if (target.length() > maxDist(model)){
	// 	let lastJoint = model.slice(-2)[0];
	// 	// just make sure the end effector is pointing towards
	// 	// the target 
	// 	lastJoint.lookAt(target);
	// 	let invRot = lastJoint.quaternion.clone().inverse();
 //        let parentAxis = lastJoint.axis.clone().applyQuaternion(invRot);
 //        let fromToQuat = new Quaternion(0,0,0,1).setFromUnitVectors(lastJoint.axis, parentAxis);
 //        lastJoint.quaternion.multiply(fromToQuat);
 //        return;
	// }

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
// Optimizations from https://github.com/mrdoob/three.js/blob/master/examples/jsm/animation/CCDIKSolver.js
// 

function CCDIKGLTF(model, anglelims, axes, target){
	let tcp             = new Vector3();
	let targetDirection = new Vector3();
	let invQ            = new Quaternion();
	let scale_junk      = new Vector3();
	let endEffector     = model.slice(-1)[0];
	let ee              = new Vector3();
	let temp_ee         = new Vector3();
	let temp_target     = new Vector3();
	let axis            = new Vector3();
	let q               = new Quaternion();
	// endEffector.getWorldPosition(ee);

	for (let i = model.length - 2; i >= 0; i--){
		// console.log(i);
		let curr = model[i];
        curr.updateMatrixWorld();

        let curr_axis = axes[i];
        let angles = anglelims[i];

        curr.matrixWorld.decompose(tcp, invQ, scale_junk);
        invQ.inverse();
        ee.setFromMatrixPosition(endEffector.matrixWorld);

        endEffector.getWorldPosition(ee);

        temp_ee.subVectors(ee, tcp);
        temp_ee.applyQuaternion(invQ);
        temp_ee.normalize();

        temp_target.subVectors(target, tcp);
        temp_target.applyQuaternion(invQ);
        temp_target.normalize();

        let angle = temp_target.dot(temp_ee);
        if ( angle > 1.0 ) {
    			angle = 1.0;
    		} else if ( angle < - 1.0 ) {
    			angle = - 1.0;
    		}

		angle = Math.acos( angle );

		if ( angle < 1e-5 ) continue;

		if (angle < angles[0]) {
			angle = angles[0];
		}
		if (angle > angles[1] ) {
			angle = angles[1];
		}

		axis.crossVectors( temp_ee, temp_target );
		axis.normalize();

		q.setFromAxisAngle( axis, angle );
		curr.quaternion.multiply( q );

    let invRot = curr.quaternion.clone().inverse();
    let parentAxis = curr.axis.clone().applyQuaternion(invRot);
    // console.log(parentAxis);

    let fromToQuat = new Quaternion(0,0,0,1).setFromUnitVectors(curr.axis, parentAxis);
    let eulercheck = new Euler().setFromQuaternion(fromToQuat);
  //       let angle2 = Math.acos( curr_axis.dot(parentAxis));
  //       if (curr_axis.toArray() === [1,0,0]){
		// 	curr.rotateX(eulercheck.toArray()[0]);
		// }
		// else if (curr_axis.toArray() === [0,1,0]){
		// 	curr.rotateY(eulercheck.toArray()[0]);
		// }
		// else {
		// 	curr.rotateZ(eulercheck.toArray()[0]);
		// }

    curr.quaternion.multiply(fromToQuat); 
        // model[1].rotation.y = -Math.PI/2;
		// model[1].rotation.z = 0;
        // let clampedRot = curr.rotation.toVector3().clampScalar(radians(angles[0]), radians(angles[1]));
        // curr.rotation.setFromVector3(clampedRot);
    curr.updateMatrixWorld();
        // console.log(curr.rotation);
	}
}

function CCDSINGULAR(curr, endEffector, angles, curr_axis, target){
	let tcp             = new Vector3();
	let targetDirection = new Vector3();
	let invQ            = new Quaternion();
	let scale_junk      = new Vector3();
	let ee              = new Vector3();
	let temp_ee         = new Vector3();
	let temp_target     = new Vector3();
	let axis            = new Vector3();
	let q               = new Quaternion();
	// endEffector.getWorldPosition(ee);
	// console.log(i);
    curr.updateMatrixWorld();

    curr.matrixWorld.decompose(tcp, invQ, scale_junk);
    invQ.inverse();
    ee.setFromMatrixPosition(endEffector.matrixWorld);

    endEffector.getWorldPosition(ee);

    temp_ee.subVectors(ee, tcp);
    temp_ee.applyQuaternion(invQ);
    temp_ee.normalize();

    temp_target.subVectors(target, tcp);
    temp_target.applyQuaternion(invQ);
    temp_target.normalize();

    let angle = temp_target.dot(temp_ee);
    if ( angle > 1.0 ) {
		angle = 1.0;
	} else if ( angle < - 1.0 ) {
		angle = - 1.0;
	}

	angle = Math.acos( angle );

	if ( angle < 1e-5 ) return;

	if (angle < angles[0]) {
		angle = angles[0];
	}
	if (angle > angles[1] ) {
		angle = angles[1];
	}

	axis.crossVectors( temp_ee, temp_target );
	axis.normalize();

	q.setFromAxisAngle( axis, angle );
	curr.quaternion.multiply( q );

    let invRot = curr.quaternion.clone().inverse();
    let parentAxis = curr.axis.clone().applyQuaternion(invRot);
    // console.log(parentAxis);

    let fromToQuat = new Quaternion(0,0,0,1).setFromUnitVectors(curr.axis, parentAxis);

    curr.quaternion.multiply(fromToQuat); 
    curr.updateMatrixWorld();
    // console.log(curr.rotation);
}

function LOOKATCCD(model, anglelims, axes, target){
	let tcp = new Vector3();
	let targetDirection = new Vector3();
	let endEffector = model.slice(-1)[0];
	let ee = new Vector3();
	endEffector.getWorldPosition(ee);

	for (let i = model.length - 2; i >= 0; i--){
		let curr = model[i];
        curr.updateMatrixWorld();

        let curr_axis = axes[i];
        let angles = anglelims[i];

        // let tcp = target.clone();
        // let toolDirection = curr.worldToLocal(tcp);
        curr.lookAt(target);

        let invRot = curr.quaternion.clone().inverse();
        let parentAxis = curr.axis.clone().applyQuaternion(invRot);
        let fromToQuat = new Quaternion(0,0,0,1).setFromUnitVectors(curr.axis, parentAxis);
        curr.quaternion.multiply(fromToQuat);

        // let clampedRot = curr.rotation.toVector3().clampScalar(radians(angles[0]), radians(angles[1]));
        // curr.rotation.setFromVector3(clampedRot);

        curr.updateMatrixWorld();
	}
}

var j1_angles = new Array(1, 179);
var j1_axis   = new Vector3(0,0,1);
var urj1_axis = new Vector3(0,1,0);

var j2_angles = new Array(1, 179);
var j2_axis   = new Vector3(0,0,1);
var urj2_axis = new Vector3(0,0,1);

var j3_angles = new Array(0, 179);
var j3_axis   = new Vector3(0,1,0);
var urj3_axis = new Vector3(0,1,0);

var j4_angles = new Array(-179, 179);
var j4_axis   = new Vector3(0, 1, 0);

var j5_angles = new Array(-179, 179);
var j5_axis = new Vector3(0,1,0);


var j1 = new Vector3(0,0,0);
var j2 = new Vector3(0, 90, 0);
var j3 = new Vector3(0, 90, 90);
var j4 = new Vector3(0, 90, 180);
var j5 = new Vector3(0, 40, 180);

var new_angles = new Array(j1_angles, j2_angles);
var new_axes   = new Array(j1_axis, j2_axis);

var fanuc_nodes = new Array(j1, j2, j3, j4, j5);
var fanuc_angles = new Array(j1_angles, j2_angles, j3_angles, j4_angles, j5_angles);
var fanuc_axes   = new Array(j1_axis, j2_axis, j3_axis, j4_axis, j5_axis);
var fanuc_edges = new Array(new Array((0,1)),new Array((1,2)), new Array((2,3)), new Array((3,4)));
var fanuc_sizes = new Array([.2,.2,.2], [.2, .2, .2], [.2, .2, .2], [.2, .2, .2], [.2, .2, .2]);
// const test = new SimpleArm(fanuc_nodes, fanuc_edges, fanuc_angles, fanuc_axes, fanuc_sizes);

// // TESTING distanceBetween 
// console.log(distanceBetween(j1_axis, j2_axis));
// console.log(distanceBetween(new Vector3(10,20,30), new Vector3(5,2,8)));
// console.log(test.distances);

// // TESTING checkDistance and updateDistances
// console.log(test.checkDistances(new Array(179.88287927426558, 640, 116, 192, 256)));
// test.updateDistances();

// // TESTING maxDistance
// console.log(test.maxDistance());

// var j1_model;
// fanuc_j1.getWorldPosition(j1_model);
// var j2_model;
// fanuc_j2.getWorldPosition(j2_model);
// var j3_model;
// fanuc_j3.getWorldPosition(j3_model);
// var j4_model;
// fanuc_j4.getWorldPosition(j4_model);
// var j5_model;
// fanuc_j5.getWorldPosition(j5_model);
// var j6_model;
// fanuc_j6.getWorldPosition(j6_model);



// var fanuc_gltf_nodes = new Array(j1_model, j2_model, j3_model, j4_model, j5_mode, j6_model);
var dialog_box_wrapper = document.createElement("div");
dialog_box_wrapper.setAttribute("id", "data_wrapper");
var euler_1_wrapper    = document.createElement("p");
euler_1_wrapper.setAttribute("id", "euler_1_wrapper");
var euler_2_wrapper    = document.createElement("p");
euler_2_wrapper.setAttribute("id", "euler_2_wrapper");
dialog_box_wrapper.append(euler_1_wrapper);
dialog_box_wrapper.append(euler_2_wrapper);
document.body.appendChild(dialog_box_wrapper);

function targetTravel (paths, target, delta) { 
  target.userData.speed = 1;
  target.position.set(first_location[0], first_location[1], first_location[2]);
  if (paths) { 
    for (let i = 0; i < paths.children.length; i ++){ 
      let child = paths.children[i];
      let positions = child.geometry.attributes["position"].array;
      for (let j = 0; j < positions.length; j += 3) {
        let new_vec = new Vector3( positions[j], positions[j + 1], positions[j + 2]);
        let direction = new_vec.sub(target.position).normalize();
        target.position.addScaledVector(direction, target.userData.speed);
        target.rotateOnWorldAxis(new Vector3(0, 1, 0), radians(90));
      }
    }
  }
}

function getNextTravelPoint(i, paths, target) { 
    let counts = paths.map(x => x.length);
    let temp = 0;
    let indices = new Array();

    for (let x = 0; x < counts.length; x ++) { 
      indices.push(counts[x] + temp);
      temp += counts[x];
    }

    let sum = counts.reduce(function (a, b) {return a + b;}, 0);

    function index_less (j) {
      return i <= j - 1;
    }

    if (i < sum) {
      let curr_path_index;
      let path_index = indices.findIndex(index_less);
      let curr_path  = paths[path_index];
      if (path_index > 0) { 
        curr_path_index = i - indices[path_index - 1];
      }
      else { 
        curr_path_index = i;
      }
      let curr_vec = curr_path[curr_path_index];
      target.position.copy(curr_vec);
      if (!angles_[path_index]) { 
        angles_[path_index] = new Array();
      }
      else {
        angles_[path_index].push([degrees(servo_hat.rotation.z * -1), degrees(sm_servo_4.rotation.z)]);
      }
    }
    else {
      return "done";
    }
}


// For each path in new coords
// Animate the target to the path
// solve IK, convert rotation to servo angles, send to server

var check = false;
var robot;
var angles_ = {};
var i = 0;
var res;
var frame_wait = 5;
var curr_frame = 0;
var server_check = false;
target2.visible = false;

function animate() {
  if (!check) {
    if (servo_hat && sm_servo_4 && pen){
      robot = new Array(servo_hat, sm_servo_4, pen);
      servo_hat.axis = j1_axis;
      sm_servo_4.axis = j2_axis;
      check = true;
    }
  }
  else if (robot.length > 0) { 
    CCDIKGLTF(robot, new_angles, new_axes, target2.position);
  }

  if (check && travel_vectors && angles_ && res !== "done" && (curr_frame % frame_wait == 0)) { 
    let res = getNextTravelPoint(i, travel_vectors, target2);
    euler_1_wrapper.innerText = JSON.stringify(degrees(servo_hat.rotation.z * -1));
    euler_2_wrapper.innerText = JSON.stringify(degrees(sm_servo_4.rotation.z));
    i ++;
    if (res === "done" && !server_check) { 
      $.ajax({ type: "POST",
               url: "/get_angles",
               contentType: 'application/json',
               data: JSON.stringify(angles_)
             });
      server_check = true;
    }
  }
  curr_frame ++;
  requestAnimationFrame(animate);
  controls.update();
 
  render();
 
};


window.addEventListener('load', function() {
	animate();
})


function render() {
  renderer.render( scene, camera );
}
