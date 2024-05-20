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
const modelEnemy1 = 'assets/enemy1/scene.gltf';

let enemies = [];
const numEnemies = 30; 
let previousEnemyPosition = 0;

// Carregar inimigos
for (let i = 0; i < numEnemies; i++) {
    const loader = new GLTFLoader();
    loader.load(modelenemy, function (gltf) {
        let enemy = gltf.scene;
        const box = new THREE.Box3().setFromObject(enemy);
        const size = box.getSize(new THREE.Vector3()).length();
        const scale = 2.0 / size;
        enemy.scale.set(scale, scale, scale);
        enemy.y_v = 0
        enemy.landed = true
        enemy.castShadow = true
        scene.add(enemy);

        
        let enemyPosition = previousEnemyPosition + 5 + Math.random() * 10;
        enemy.position.set(enemyPosition, 0, 0);

        
        previousEnemyPosition = enemyPosition;

        enemies.push(enemy);
    }, undefined, function (error) {
        console.error(error);
    });
}

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
    plane.receiveShadow = true;
    scene.add(plane);
	plane.position.set(0, -1.1, 0);
});

// Lights
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 3); // soft white light
scene.add(ambientLight);
// Point light para iluminar o personagem
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(3 , 0, 0 );
pointLight.castShadow = true;
scene.add(pointLight);

//próximo nível
function goToNextLevel() {
    console.log("Parabéns! Você alcançou o próximo nível.");
    clearEnemies();
    loadEnemies1(); 
    character.position.set(0, 0, 0); 
    speed = 0.14;

    // Load the new background texture
    const loader = new THREE.TextureLoader();
    loader.load('assets/background2/roxo.jpg', function(texture) {
        scene.background = texture;
    });
}

//próximo nível 2
function goToNextLevel1() {
    console.log("Parabéns! Você alcançou o próximo nível.");
    clearEnemies();
    loadMixedEnemies(); 
    character.position.set(0, 0, 0); 
    speed = 0.14;

    // Load the new background texture
    const loader = new THREE.TextureLoader();
    loader.load('assets/background3/vermelho1.png', function(texture) {
        scene.background = texture;
    });
}

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
            if (enemies.includes(object)) { 
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
        if (score == 100) {
            goToNextLevel();
        }
        if(score == 215){
            goToNextLevel1();
        }
    }, 500);
}




function stopScore() {
    clearInterval(scoreInterval);
}

//top scores
function initializeTopScores() {
    if (!localStorage.getItem('topScores')) {
        localStorage.setItem('topScores', JSON.stringify([]));
    }
}


function updateTopScores(newScore) {
    let topScores = JSON.parse(localStorage.getItem('topScores'));
    topScores.push(newScore);
    topScores = topScores.sort((a, b) => b - a).slice(0, 5); 
    localStorage.setItem('topScores', JSON.stringify(topScores));
}

function createScoresTable() {
    const table = document.createElement('table');
    table.style = "width:10%; margin-top: 5px; margin-left: auto; margin-right: auto; font-size: 150px; color: white; border-collapse: collapse; border: 3px solid white;";

    const header = table.createTHead();
    const headerRow = header.insertRow();
    const headerCell = headerRow.insertCell();
    headerCell.innerText = 'Top Scores';
    headerCell.style = "text-align: center; border-bottom: 2px solid white; padding: 10px; border-left: 2px solid white; border-right: 2px solid white;";

    const body = table.createTBody();
    let topScores = JSON.parse(localStorage.getItem('topScores'));

    for (let score of topScores) {
        let row = body.insertRow();
        let cell = row.insertCell();
        cell.innerText = score;
        cell.style = "text-align: center; border-bottom: 1px solid white; padding: 10px; border-left: 2px solid white; border-right: 2px solid white;";
    }

    return table;
}



function displayGameOverScreen() {
    stopScore();
    updateTopScores(score); 

    const gameOverContainer = document.createElement('div');
    gameOverContainer.id = 'game-over-screen';
    gameOverContainer.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background-color: rgba(0,0,0,0.5); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 100px; z-index: 1000;";

    const gameOverText = document.createElement('div');
    gameOverText.innerText = 'Game Over!';
    gameOverText.style = "margin-bottom: 10px;";  

    const scoresTable = createScoresTable(); 

    gameOverContainer.appendChild(gameOverText);
    gameOverContainer.appendChild(scoresTable); 
    document.body.appendChild(gameOverContainer);
}



//restart game
const restartButton = document.createElement('button');
restartButton.style.position = 'fixed';
restartButton.style.padding = '10px 20px'; 
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
scoreElement.style.fontSize = '100px';
document.body.appendChild(scoreElement);

function clearEnemies() {
    enemies.forEach(enemy => {
        scene.remove(enemy);
    });
    enemies = []; 
}

function loadEnemies() {
    let numEnemies = 30; 
    let previousEnemyPosition = 0;

    for (let i = 0; i < numEnemies; i++) {
        const loader = new GLTFLoader();
        loader.load('assets/enemy/scene.gltf', function (gltf) {
            let enemy = gltf.scene;
            scene.add(enemy);
            let enemyPosition = previousEnemyPosition + 5 + Math.random() * 10;
            enemy.position.set(enemyPosition, 0, 0);
            previousEnemyPosition = enemyPosition;

            const box = new THREE.Box3().setFromObject(enemy);
            const size = box.getSize(new THREE.Vector3()).length();
            const scale = 2.0 / size;
            enemy.scale.set(scale, scale, scale);
            enemy.castShadow = true;

            enemies.push(enemy);
        }, undefined, function (error) {
            console.error(error);
        });
    }
}

function loadEnemies1() {
    let numEnemies = 40; 
    let previousEnemyPosition = 0;
    
  

    for (let i = 0; i < numEnemies; i++) {
        const loader = new GLTFLoader();
        loader.load('assets/enemy1/scene.gltf', function (gltf) {
            let enemy = gltf.scene;
            scene.add(enemy);
            let enemyPosition = previousEnemyPosition + 7 + Math.random() * 10;
            enemy.position.set(enemyPosition, -1, 0.5);
            previousEnemyPosition = enemyPosition;

            const box = new THREE.Box3().setFromObject(enemy);
            const size = box.getSize(new THREE.Vector3()).length();
            const scale = 2.0 / size;
            enemy.scale.set(scale, scale, scale);
            enemy.castShadow = true;

            enemies.push(enemy);
        }, undefined, function (error) {
            console.error(error);
        });
    }
}

let speed = 0.1;
let isLoadMixedEnemiesActive = false;


function loadMixedEnemies() {
    isLoadMixedEnemiesActive = true;
    let numEnemies = 40;
    let previousEnemyPosition = 0;
    

    let loadPromises = []; 

    for (let i = 0; i < numEnemies; i++) {
        let model = Math.random() < 0.5 ? modelenemy : modelEnemy1; 

        let loadPromise = new Promise((resolve, reject) => {
            loader.load(model, function (gltf) {
                let enemy = gltf.scene;
                scene.add(enemy);
                let enemyPosition = previousEnemyPosition + 5 + Math.random() * 10;
                if (model === modelenemy) {
                    enemy.position.set(enemyPosition, 0, 0);
                } else if (model === modelEnemy1) {
                    enemy.position.set(enemyPosition, -1, 0.5);
                }
                previousEnemyPosition = enemyPosition;

                const box = new THREE.Box3().setFromObject(enemy);
                const size = box.getSize(new THREE.Vector3()).length();
                const scale = 2.0 / size;
                enemy.scale.set(scale, scale, scale);
                enemy.castShadow = true;

                enemies.push(enemy);
                resolve(); 
            }, undefined, function (error) {
                console.error(error);
                reject(error); 
            });
        });

        loadPromises.push(loadPromise);
    }


}


function animate() {
    initializeTopScores();
    
    animationFrameId=requestAnimationFrame(animate);

       
    //pointLight.position.set(character.position.x, character.position.y + 2, character.position.z);
	
	character.position.x += speed;


    
    if (isLoadMixedEnemiesActive) {
        enemies.forEach(enemy => {
            enemy.position.x -= 0.04 ;
        });
    }
    isLoadMixedEnemiesActive = false; 
    
   

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



startScore(); 

function restartGame() {
    cancelAnimationFrame(animationFrameId);
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        document.body.removeChild(gameOverScreen);
    }

    // Reset background to the initial texture
    const loader = new THREE.TextureLoader();
    loader.load('assets/background/e7741d91aca93535797aab0fa8237099.jpg', function(texture) {
        scene.background = texture;
    }); 

    speed = 0.1;
    character.position.set(0, 0, 0);
    character.landed = true;
    character.y_v = 0;
	character.rotation.y = -Math.PI / 2;
	character.rotation.z = 0;
 
    clearEnemies();
    loadEnemies(); 

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