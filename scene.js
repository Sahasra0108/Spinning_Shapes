// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const shapesGroup = new THREE.Group();
scene.add(shapesGroup);

// Function to create a random color
function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

// Create multiple shapes (cylinder, cube, sphere, dodecahedron) with different colors and add to the group
const geometries = [
  new THREE.CylinderGeometry(1, 1, 2, 32),
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.DodecahedronGeometry(1.5),
];

geometries.forEach((geometry, index) => {
  const material = new THREE.MeshStandardMaterial({
    color: getRandomColor(),
    roughness: 0.5,
    metalness: 0.5,
  });
  const shape = new THREE.Mesh(geometry, material);
  shape.position.set(
    Math.cos((index * Math.PI * 2) / geometries.length) * 5,
    0,
    Math.sin((index * Math.PI * 2) / geometries.length) * 5
  );
  shapesGroup.add(shape);
});

// Position the camera
camera.position.z = 10;

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// Setup post-processing
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

// Create UnrealBloomPass for glow effect
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);

// Create GlitchPass for glitch effect
const glitchPass = new THREE.GlitchPass();
composer.addPass(glitchPass);

 
// Create OutlinePass for outlining selected objects
const outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.visibleEdgeColor.set(0xff0000); // Set outline color to red
outlinePass.edgeStrength = 10; // Set the edge strength
outlinePass.edgeGlow = 0.5; // Set the edge glow
outlinePass.edgeThickness = 1; // Set the edge thickness
composer.addPass(outlinePass);

// Animation loop
let lastColorChangeTime = 0;
const colorChangeInterval = 2000; // Color change interval in milliseconds

const animate = function (timestamp) {
  requestAnimationFrame(animate);

  // Calculate time difference since the last color change
  const delta = timestamp - lastColorChangeTime;

  // Rotate each shape individually
  shapesGroup.children.forEach((shape) => {
    shape.rotation.x += 0.02;
    shape.rotation.y += 0.02;
  });

  // Change colors at regular intervals
  if (delta >= colorChangeInterval) {
    shapesGroup.children.forEach((shape) => {
      shape.material.color.copy(getRandomColor());
    });
    lastColorChangeTime = timestamp;
  }

  // Update the outline pass to highlight all shapes in the group
  outlinePass.selectedObjects = shapesGroup.children;

  // Render the scene with post-processing effects
  composer.render();

  // Rotate the entire group
  shapesGroup.rotation.y += 0.01;
};

animate();
