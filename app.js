import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';



// Init scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)



let controls = new OrbitControls(camera, renderer.domElement);

let isFirstPersonView = false;

let cameraStartPosition = new THREE.Vector3(); // Para armazenar a posição inicial da câmera

document.getElementById('toggle-camera-button').addEventListener('click', function() {
    isFirstPersonView = !isFirstPersonView;

    if (isFirstPersonView) {
        // Usando FirstPersonControls
        const firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
        firstPersonControls.movementSpeed = 10;
        firstPersonControls.lookSpeed = 0.1;
        firstPersonControls.lookVertical = true;

        // Configura a posição inicial da câmera para ser a mesma que a posição inicial da personagem
        camera.position.copy(character.position);
        cameraStartPosition.copy(camera.position); // Armazena a posição inicial da câmera
        camera.lookAt(character.position);

        // Remover os controles orbitais antigos, se houver
        controls.dispose();
    } else {
        // Usando OrbitControls
        controls = new OrbitControls(camera, renderer.domElement);
        camera.position.copy(cameraStartPosition);
        camera.lookAt(0, 0, 0); // Aponta para o centro da cena

        // Remover os controles de primeira pessoa antigos, se houver
        if (camera.userData.firstPersonControls) {
            camera.userData.firstPersonControls.dispose();
        }
    }
    this.blur();
});
// Background
const loader1 = new THREE.TextureLoader();
loader1.load('assets/background/e7741d91aca93535797aab0fa8237099.jpg', function(texture) {
    scene.background = texture;
});

const modelcaracter='assets/character/scene.gltf'

let character;

// Personagem principal
const loader = new GLTFLoader();
loader.load(modelcaracter, function (gltf) {
    character = gltf.scene;
    const box = new THREE.Box3().setFromObject(character);
    const size = box.getSize(new THREE.Vector3()).length();
    const scale = 2.0 / size;
    character.scale.set(scale, scale, scale);
    character.y_v = 0;
    character.landed = true;
    character.gravity = 0.01;
    character.rotation.y = -Math.PI / 2;
    character.castShadow = true;
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
        enemy.y_v = 0;
        enemy.landed = true;
        enemy.castShadow = true;
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
const ambientLight = new THREE.AmbientLight(0xffffff, 3); // soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(3 , 0, 0 );
pointLight.castShadow = true;
scene.add(pointLight);

// Próximo nível
function goToNextLevel() {
    console.log("Parabéns! Você alcançou o próximo nível.");
    clearEnemies();
    loadEnemies1(); 
    character.position.set(0, 0, 0); 
    speed = 0.14;

    const loader = new THREE.TextureLoader();
    loader.load('assets/background2/roxo.jpg', function(texture) {
        scene.background = texture;
    });
}

// Próximo nível 2
function goToNextLevel1() {
    console.log("Parabéns! Você alcançou o próximo nível.");
    clearEnemies();
    loadMixedEnemies(); 
    character.position.set(0, 0, 0); 
    speed = 0.15;

    const loader = new THREE.TextureLoader();
    loader.load('assets/background3/vermelho1.png', function(texture) {
        scene.background = texture;
    });
}

// Lógica de salto
function keyDown(data) {
    if (data.code == 'Space' && character.landed) {
        character.landed = false;
        character.y_v = 0.3; 
    }
}
window.addEventListener('keydown', keyDown)

// Colisões
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

// Pontuação
let score = 0; 
let scoreInterval; 

function startScore() {
    if (scoreInterval) {
        clearInterval(scoreInterval);
    }

    score = 0;
    document.getElementById('score-element').innerText = 'Score: ' + score;
    scoreInterval = setInterval(() => {
        score++;
        document.getElementById('score-element').innerText = 'Score: ' + score;
        if (score === 100) {
            goToNextLevel();
        }
        if (score === 215) {
            goToNextLevel1();
        }
    }, 500);
}

function stopScore() {
    clearInterval(scoreInterval);
}

// Top scores
function initializeTopScores() {
    if (!localStorage.getItem('topScores')) {
        localStorage.setItem('topScores', JSON.stringify([]));
    }
}

function updateTopScores(newScore) {
    console.log('Updating top scores with:', newScore); 
    let topScores = JSON.parse(localStorage.getItem('topScores'));
    topScores.push(newScore);
    topScores = topScores.sort((a, b) => b - a).slice(0, 5); 
    localStorage.setItem('topScores', JSON.stringify(topScores));
}

function createScoresTable() {
    let topScores = JSON.parse(localStorage.getItem('topScores'));
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const rankHeader = document.createElement('th');
    rankHeader.innerText = 'Rank';
    const scoreHeader = document.createElement('th');
    scoreHeader.innerText = 'Score';

    headerRow.appendChild(rankHeader);
    headerRow.appendChild(scoreHeader);
    thead.appendChild(headerRow);

    topScores.forEach((score, index) => {
        const row = document.createElement('tr');
        const rankCell = document.createElement('td');
        rankCell.innerText = index + 1;
        const scoreCell = document.createElement('td');
        scoreCell.innerText = score;
        row.appendChild(rankCell);
        row.appendChild(scoreCell);
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}

function displayGameOverScreen() {
    stopScore();
    updateTopScores(score); 

    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'game-over-screen';

    const gameOverText = document.createElement('p');
    gameOverText.className = 'game-over-text';
    gameOverText.innerText = 'Game Over!';
    gameOverScreen.appendChild(gameOverText);

    const scoresTable = createScoresTable(); 
    gameOverScreen.appendChild(scoresTable);
    
    document.body.appendChild(gameOverScreen);
}

const restartButton = document.getElementById('restart-button');

function clearEnemies() {
    enemies.forEach(enemy => {
        scene.remove(enemy);
    });
    enemies = []; 
}

function loadEnemies() {
    let numEnemies = 35; 
    let previousEnemyPosition = 0;

    for (let i = 0; i < numEnemies; i++) {
        const loader = new GLTFLoader();
        loader.load('assets/enemy/scene.gltf', function (gltf) {
            let enemy = gltf.scene;
            scene.add(enemy);
            let enemyPosition = previousEnemyPosition + 5 + Math.random() * 5;
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
    
    animationFrameId = requestAnimationFrame(animate);

    character.position.x += speed;

    if (isLoadMixedEnemiesActive) {
        enemies.forEach(enemy => {
            enemy.position.x -= 0.04;
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

    if (isFirstPersonView) {
        camera.position.copy(character.position).add(new THREE.Vector3(0, 2, 5)); 
        camera.lookAt(character.position);
    } 
    if (!isFirstPersonView){
        // Use os controles orbitais
        camera.position.x = character.position.x - 4;
        camera.position.y = character.position.y + 4;
        camera.position.z = character.position.z + 5;
        camera.lookAt(character.position);
    }

    renderer.render(scene, camera);
}

startScore(); 

function restartGame() {
    cancelAnimationFrame(animationFrameId);
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
        document.body.removeChild(gameOverScreen);
    }

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
