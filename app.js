import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Init scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// background
const loader1 = new THREE.TextureLoader();
loader1.load('assets/background/e7741d91aca93535797aab0fa8237099.jpg', function(texture) {
    scene.background = texture;
});


const modelcaracter='assets/character/scene.gltf'

let character;
//personagem principal
const loader = new GLTFLoader();
loader.load(modelcaracter, function (gltf) {
    character = gltf.scene;
    const box = new THREE.Box3().setFromObject(character);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 2.0 / size;
    character.scale.set(scale, scale, scale);
	character.y_v = 0
	character.landed = true
	character.gravity = 0.01
	character.rotation.y = -Math.PI / 2;
	character.castShadow = true
    scene.add(character);
    character.position.set(0, 0, 0);
}, undefined, function (error) {
    console.error(error);
});

const modelenemy='assets/enemy/scene.gltf'

let enemy;
//inimigos
const loader3 = new GLTFLoader();
loader3.load(modelenemy, function (gltf) {
	enemy = gltf.scene;
	const box = new THREE.Box3().setFromObject(enemy);
	const size = box.getSize(new THREE.Vector3()).length();
	const scale = 2.0 / size;
	enemy.scale.set(scale, scale, scale);
	enemy.y_v = 0
	enemy.landed = true
	enemy.castShadow = true
	scene.add(enemy);
	enemy.position.set(5, 0, 0);
}, undefined, function (error) {
	console.error(error);
});

const loader2 = new THREE.TextureLoader();
loader2.load('assets/background/63832f7533fcac464eeab537f6bac730.jpg', function(texture) {
    const geometryPlane = new THREE.BoxGeometry(1, 1, 1);
    const materialPlane = new THREE.MeshPhongMaterial({
        map: texture 
    });
    var plane = new THREE.Mesh(geometryPlane, materialPlane);
    plane.scale.x = 1000; 
    plane.scale.z = 1;    
    plane.position.y = -1.1; 
    scene.add(plane);
	plane.position.set(0, -1.1, 0);
});

// Lights
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 3); // soft white light
scene.add(ambientLight);


//lógica de salto
function keyDown(data) {
    if (data.code == 'Space' && character.landed) {
        character.landed = false;
        character.y_v = 0.3; 
    }
}
window.addEventListener('keydown', keyDown)

//colisoes
let animationFrameId;
function checkCollisions() {
    const characterBox = new THREE.Box3().setFromObject(character);

    scene.children.forEach((object) => {
        if (object === character || object === camera || object.type === 'PointLight')
            return;

        const objectBox = new THREE.Box3().setFromObject(object);
        if (characterBox.intersectsBox(objectBox)) {
            if (object === enemy) {
                console.log("Game Over! Colisão com o inimigo.");
                cancelAnimationFrame(animationFrameId);
                displayGameOverScreen();  
                return;  
            }

            character.position.y = objectBox.max.y + character.scale.y / 2;
            character.y_v = 0;
            character.landed = true;
            character.rotation.z = 0;
        }
    })
}
//perdeu colidiu com o inimigo

let score = 0; 
let scoreInterval; 

function startScore() {
	if (scoreInterval) {
        clearInterval(scoreInterval);
    }

    score = 0;
    scoreElement.innerText = 'Score: ' + score;
    scoreInterval = setInterval(() => {
        score++;
        scoreElement.innerText = 'Score: ' + score;
    }, 500);
}

function stopScore() {
    clearInterval(scoreInterval);
}

function displayGameOverScreen() {
	stopScore();
    const gameOverText = document.createElement('div');
	gameOverText.id = 'game-over-screen';
    gameOverText.style.position = 'fixed'; 
	gameOverText.style.top = '0'; 
    gameOverText.style.left = '0';
    gameOverText.style.width = '100%';
    gameOverText.style.height = '100vh'; 
    gameOverText.style.backgroundColor = 'rgba(0,0,0,0.5)';
    gameOverText.style.color = 'white';
    gameOverText.style.display = 'flex';
    gameOverText.style.justifyContent = 'center';
    gameOverText.style.alignItems = 'center';
    gameOverText.style.fontSize = '300px';
    gameOverText.style.zIndex = '1000'; 
    gameOverText.innerText = 'Game Over!';
    document.body.appendChild(gameOverText);
	
}



//restart game
const restartButton = document.createElement('button');
restartButton.style.position = 'fixed';
restartButton.style.padding = '50px 100px'; 
restartButton.style.top = '10px';
restartButton.style.right = '10px';
restartButton.style.zIndex = '1001';
restartButton.style.width = 'auto';
restartButton.style.height = 'auto'; 
restartButton.style.fontSize = '100px';
restartButton.innerText = 'Restart';
document.body.appendChild(restartButton);

//pontuação
const scoreElement = document.createElement('div');
scoreElement.style.position = 'fixed';
scoreElement.style.color = 'white';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.zIndex = '1001';
scoreElement.style.fontSize = '200px';
document.body.appendChild(scoreElement);



function animate() {
    animationFrameId=requestAnimationFrame(animate);
	
	character.position.x += 0.1;
	


	if (!character.landed) {
        character.y_v -= character.gravity;
    }

    
    character.position.y += character.y_v;

    let planeHeight = -0.2; 
    if (character.position.y <= planeHeight + (character.scale.y / 2)) {
        character.position.y = planeHeight + (character.scale.y / 2); 
        character.y_v = 0;         
        character.landed = true;     
        character.rotation.z = 0;    
    }

    if (!character.landed) {
        character.rotation.z += 0.04;  
    }

	checkCollisions();


	
	controls.update();
	
	//comentar para utilizar o orbitcontrols
	camera.position.x = character.position.x - 2
	camera.position.y = character.position.y + 2
	camera.position.z = character.position.z + 3

	camera.lookAt(character.position);
	
    renderer.render(scene, camera);
}

function restartGame() {
    cancelAnimationFrame(animationFrameId);
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        document.body.removeChild(gameOverScreen);
    }

    character.position.set(0, 0, 0);
    enemy.position.set(5, 0, 0);
    character.landed = true;
    character.y_v = 0;
	character.rotation.y = -Math.PI / 2;
	character.rotation.z = 0;

    startScore(); 
	animate();
}

restartButton.addEventListener('click', function(event) {
    if (event.pointerType === 'mouse') {
        restartGame();
    }
    event.stopPropagation(); 
});

animate();