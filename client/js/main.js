var World = require('three-world'),
    THREE = require('three'),
    Leap  = require('leapjs'),
    Controls = require('./kinetic-controls');

// Setup 3D environment
var worldWidth = 2048, worldDepth = 2048;

var anchor = new THREE.Object3D();
anchor.rotation.order = 'YXZ';

World.init({ambientLightColor: 0, farPlane: 4000, renderCallback: function() { anchor.rotation.y += Math.PI / 200; Controls.update(); }});
var cam = World.getCamera();
cam.position.set(0, 250, 1000);
cam.rotation.x = -Math.PI/10;

var light = new THREE.PointLight(0xffffee, 1, 4000);
light.position.set(0, 500 , 0);
World.add(light);

anchor.add(cam);
World.add(anchor);

Controls.init(cam, anchor, 0);

var material = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});

var geometry = new THREE.PlaneBufferGeometry( 1024, 1024, worldWidth - 1, worldDepth - 1 );
geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

var terrain = new THREE.Mesh(geometry, material);

var vertices = geometry.attributes.position.array;
var colorBuffer = new Float32Array( vertices.length );

var colors = [
  [0.25, 0.25, 0.25],
  [0.5 , 0.5 , 0.5 ],
  [0.75, 0.75, 0.75],
  [1.0 , 1.0 , 1.0 ],
  [0.75, 0.75, 0.75],
  [0.5 , 0.5 , 0.5 ],
  [0.5 , 0.25, 0.25],
  [0.75, 0.0 , 0.25],
  [0.75, 0.0 , 0.5 ],
  [1.0 , 0.0 , 0.75],
  [1.0 , 0.0 , 1.0 ],
  [0.75, 0.75, 1.0 ],
  [0.5 , 0.5 , 1.0 ],
  [0.25, 0.25, 1.0 ],
  [0.0 , 0.0 , 1.0 ],
  [0.0 , 0.25, 1.0 ],
  [0.0 , 0.5 , 1.0 ],
  [0.0 , 0.75, 1.0 ],
  [0.0 , 1.0 , 1.0 ],
  [0.25, 1.0 , 0.75],
  [0.5 , 1.0 , 0.5 ],
  [0.75, 1.0 , 0.25],
  [1.0 , 1.0 , 0.0 ],
  [1.0 , 0.75, 0.0 ],
  [1.0 , 0.5 , 0.0 ],
  [1.0 , 0.25, 0.0 ],
  [1.0 , 0.0 , 0.0 ],
];

var colorStep = Math.ceil((max-median) / (2*colors.length));

// Parse the JSON

var tStart = new Date();
var i = 0, v = 0;

for(var t=0; t<tuples.length; t+=2) {
  for(var r=0;r<tuples[t+1]; r++) {
    vertices[v + 1] = tuples[t] - min;
    var cIndex = Math.floor((tuples[t] - min) / colorStep) % colors.length;

    if(cIndex < 0) cIndex = 0;
    else if(cIndex > colors.length - 1) cIndex = colors.length - 1;

    colorBuffer[v]     = colors[cIndex][0];
    colorBuffer[v + 1] = colors[cIndex][1];
    colorBuffer[v + 2] = colors[cIndex][2];

    v += 3;
  }
}

var tParsing = (new Date() - tStart);
console.log('Parsing finished in ' + tParsing + ' ms');

geometry.addAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));
geometry.computeBoundingBox();
terrain.position.y = -1 * geometry.boundingBox.max.y;
World.add(terrain);

var tRendering = (new Date() - tStart);
console.log('Rendering after ' + tRendering + ' ms');

var loader = document.getElementById('loading');
if(loader && loader.parentNode) loader.parentNode.removeChild(loader);

World.getRenderer().domElement.style.display = 'block';

World.start();

var stats = document.createElement('div');
stats.textContent = 'Parsed in ' + (tParsing / 1000).toFixed(2) + 's Rendered after ' + (tRendering / 1000).toFixed(2) + 's';
document.body.appendChild(stats);

var previousHandPos = null, previousRotation = null;

var Z_AXIS_VECTOR = new THREE.Vector3(0, 0, 1),
    directionVector = new THREE.Vector3();

Leap.loop(function(frame){
  if(frame.hands.length > 0) {
    var hand = frame.hands[0];
    if(hand.pinchStrength < 0.75) {
      previousHandPos  = null;
      previousRotation = null;
    } else {

      directionVector.set(
        hand.direction[0],
        hand.direction[1],
        hand.direction[2]
      );

      if(previousHandPos === null) {
        previousHandPos = hand.palmPosition;
      }

      if(previousRotation === null) {
        previousRotation = Z_AXIS_VECTOR.angleTo(directionVector) / 10;
      }

      terrain.position.x += (hand.palmPosition[0] - previousHandPos[0]);
      terrain.position.y += (hand.palmPosition[1] - previousHandPos[1]);
      terrain.position.z += (hand.palmPosition[2] - previousHandPos[2]);

      var angle = Z_AXIS_VECTOR.angleTo(directionVector) / 10;
      terrain.rotation.y += angle - previousRotation;

      previousHandPos  = hand.palmPosition;
      previousRotation = angle;
    }
  }
});
