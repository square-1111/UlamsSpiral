var THREE = require('three');
var Stats = require('stats.js');

var camera, scene, renderer;
var geometry, material, mesh;
var mouse, raycaster, INTERSECTED;
var isPrime = [];

init();
animate();

function init() {
    //Scene
    scene = new THREE.Scene();

    //Camera and its attributes
    let width = window.innerWidth;
    let height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 250);

    //Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //Creating points and adding it to screen
    geometry = new THREE.BufferGeometry();
    var len_x = width;
    var len_y = height;
    console.log(width + " " + height)
    var vertices = spiral(width, height);
    var size = [];
    var colors = [];
    for (let i = 0; i < vertices.length; i++) {
        size.push(0.1);
        colors.push(62 / 255);
        colors.push(182 / 255);
        colors.push(1.0);
    }
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.addAttribute('size', new THREE.Float32BufferAttribute(size, 1).setDynamic(true));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    material = new THREE.PointsMaterial({
        vertexColors: THREE.VertexColors
    });
    mesh = new THREE.Points(geometry, material);
    scene.add(mesh);

    //Helper Axis
    //scene.add(new THREE.AxesHelper(5));
    //Raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    //Stats of the frame
    stats = new Stats();
    stats.showPanel(0); //0: fps, 1: ms
    document.body.appendChild(stats.dom);

    //Event Listener
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

}

function animate() {
    stats.update();
    requestAnimationFrame(animate);
    render();
}

//Render the frame in accordance to size of window
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
}

//Locating mouse in accordance to threejs frame of reference
function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

//Sieve of Eratosthenes to get prime numbers
function sieve(width, height) {
    let numbers = width * height;
    for (let i = 0; i < numbers; i++) {
        isPrime.push(true);
    }
    isPrime[0] = isPrime[1] = false;
    for (let i = 2; i < numbers; i++) {
        if (isPrime[i]) {
            let j = 2;
            while (i * j <= numbers) {
                isPrime[i * j] = false;
                j++;
            }
        }
    }
}

//check if a given point is in the frame
function check(i, j, width, height) {
    if (j <= -1 * width / 2 || j >= width / 2) {
        return false;
    }
    if (i <= -1 * height / 2 || i >= height / 2) {
        return false;
    }
    return true;
}

//Creating outward spiral and pushing the coordinates of prime
function spiral(width, height) {
    sieve(width, height);
    var prime_co = 0;
    let i = 0,
        j = 0,
        dis = 1,
        count = 0;
    let vertex = [];
    let f1 = 1,
        f2 = 0,
        f3 = 0,
        f4 = 0;
    while (check(i, j, width, height)) {
        if (f1) {
            //positive x
            for (let k = 0; k <= dis; k++) {
                ++i;
                if (isPrime[count]) {
                    vertex.push(i, j, 0);
                    prime_co++;
                }
                count++;
                //i++;
            }
            f1 = 0;
            f2 = 1;
        } else if (f2) {
            //negative y
            for (let k = 0; k < dis; k++) {
                j--;
                if (isPrime[count]) {
                    vertex.push(i, j, 0);
                    prime_co++;
                }
                count++;
            }
            dis++;
            f2 = 0;
            f3 = 1;
        } else if (f3) {
            //negative x
            for (let k = 0; k <= dis; k++) {
                i--;
                if (isPrime[count]) {
                    vertex.push(i, j, 0);
                    prime_co++;
                }
                count++;
                //i--;
            }
            f3 = 0;
            f4 = 1;
        } else if (f4) {
            //positive y
            for (let k = 0; k < dis; k++) {
                if (isPrime[count]) {
                    vertex.push(i, j, 0);
                    prime_co++;
                }
                count++;
                j++;
            }
            dis++;
            f4 = 0;
            f1 = 1;
        }
    }
    return vertex;
}

function render() {
    let attributes = mesh.geometry.attributes;
    // console.log(col_attr);

    raycaster.setFromCamera(mouse, camera);

    intersects = raycaster.intersectObject(mesh);

    raycaster.setFromCamera(mouse, camera);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].index) {

            attributes.size.array[INTERSECTED] = 1;

            INTERSECTED = intersects[0].index;

            attributes.size.array[INTERSECTED] = 1 * 12.5;
            attributes.size.needsUpdate = true;

        }

    } else if (INTERSECTED !== null) {

        attributes.size.array[INTERSECTED] = 1;
        attributes.size.needsUpdate = true;
        INTERSECTED = null;

    }
    renderer.render(scene, camera);
 }
