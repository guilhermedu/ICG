

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

var game = document.querySelector('.game')
game.appendChild(renderer.domElement)

// Settings
var levelLength = 100

// Plane
const geometryPlane = new THREE.BoxGeometry(1, 1, 1)
const materialPlane = new THREE.MeshPhongMaterial({
	color: 0xffffff
})
var plane = new THREE.Mesh(geometryPlane, materialPlane)
plane.scale.x = 1000    
plane.scale.z = 3
plane.position.y = -0.5
plane.receiveShadow = true
scene.add(plane)

// Character
const characterBox = new THREE.BoxGeometry(1, 1, 1)
const characterMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff
})
var character = new THREE.Mesh(characterBox, characterMaterial)
character.position.y = 0.5
character.x_v = 0
character.y_v = 0
character.landed = true
character.gravity = 0.01
character.castShadow = true;


scene.add(character)

// Block
const enemyGeometry = new THREE.BoxGeometry(1, 1, 1)
const enemyMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff
})
var enemy = new THREE.Mesh(enemyGeometry, enemyMaterial)

enemy.scale.y = 2
enemy.position.x = 3
enemy.position.y = 1

scene.add(enemy)

// enemy2
const enemyGeometry2 = new THREE.BoxGeometry(1, 1, 1)
const enemyMaterial2 = new THREE.MeshPhongMaterial({
	color: 0xffffff
})
var enemy2 = new THREE.Mesh(enemyGeometry2, enemyMaterial2)

enemy2.scale.y = 1  
enemy2.position.x = 2
enemy2.position.y = 1

scene.add(enemy2)

// Light
const pointLight = new THREE.PointLight(0x0000ff, 1, 50)
pointLight.position.set(3, 3, 3)
pointLight.castShadow = true
scene.add(pointLight)

// Light
const pointLight1 = new THREE.PointLight(0xff0000, 1, 50)
pointLight1.position.set(-3, 3, -3)      
scene.add(pointLight1)

//light
const light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(0, 1, 0);
scene.add(light); 
         

// Camera
camera.rotation.y = 105
camera.rotation.y = 135

scene.add(camera)

// Progress bar
var progress = 0
var progressBar = document.getElementById('progressBar')

// Init
render()
setInterval(gameController, 16)

// Music
window.focus()
window.addEventListener(
	'focus',
	new Audio('./music/Creeds - Push Up (Lyrics) _ Tiktok_mNrzmpA8JU4.mp3').play()
)

// Fix wrong size of a game when resized
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize, false)



// Key Controller
function keyDown(data) {

    switch (data.code) {
        case 'KeyA':
            character.position.z -= 0.5
            break
        case 'KeyD':
            character.position.z += 0.5
            break
    }
    if (
        (data.code == 'Space' || data.code == 'Click') &&
        character.landed == true
    ) {
        character.landed = false
        character.y_v += 0.21
    }
}

window.addEventListener('keydown', keyDown)

function gameController() {
	// Camera
	camera.lookAt(character.position)

	camera.position.x = character.position.x - 2
	camera.position.y = character.position.y + 2
	camera.position.z = character.position.z + 3

	// Progress bar
	progress = (character.position.x / levelLength) * progressBar.max
	progressBar.value = progress

	// caracter is off the plane
	if (character.position.z < plane.position.z - plane.geometry.parameters.depth  ||
		character.position.z > plane.position.z + plane.geometry.parameters.depth ) {
		// Apply downward force
		character.position.y -= 1;
	
		// Show lose message
		document.getElementById('loseMessage').style.display = 'block';
		document.getElementById('restartButton').style.display = 'block';d
	}

	// characterMoveController
	character.position.x += 0.01

	character.landed = false

	scene.children.forEach((object) => {
		if (object == character || object == camera || object.type == 'PointLight')
			return

		if (
			object.position.x + object.scale.x / 2 <=
				character.position.x - character.scale.x / 2 ||
			object.position.x - object.scale.x / 2 >=
				character.position.x + character.scale.x / 2 ||
			object.position.y + object.scale.y / 2 <=
				character.position.y - character.scale.y / 2 ||
			object.position.y - object.scale.y / 2 >=
				character.position.y + character.scale.y / 2
		)
			return

		if (character.y_v <= 0) character.y_v = 0

		character.landed = true
	})

	character.rotation.z = character.rotation.z - 0.04

	if (!character.landed) character.y_v -= character.gravity
	if (character.landed) character.rotation.z = 0

	character.position.y += character.y_v
}

// Render world
function render() {
	renderer.render(scene, camera)

	requestAnimationFrame(render)
}




function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}


// Restart button
document.getElementById('restartButton').addEventListener('click', function() {
    // Hide lose message
	document.getElementById('loseMessage').style.display = 'none';
    // This is just an example, you will need to replace this with your actual game reset logic
    resetGame();
});

function resetGame() {
    // Reset character's position
    character.position.x = 0;
    character.position.y = 0.5;
    character.position.z = 0;

    // Reset character's velocityddddd
    character.y_v = 0;

    // Reset character's rotation
    character.rotation.x = 0;
    character.rotation.y = 0;
    character.rotation.z = 0;

    // Reset landed state
    character.landed = false;
}