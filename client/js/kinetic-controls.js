module.exports = (function() {
  var instance = {}, hammertime, cam, camAnchor, minZ = 0;
  var swingX = 0, swingY = 0, wasMoved = false;

  instance.init = function(camera, cameraAnchor, minCamZ) {
    var hammertime = new Hammer(document.body, {});

    cam = camera;
    camAnchor = cameraAnchor;
    minZ = minCamZ;

    hammertime.get('pinch').set({ enable: true });

    hammertime.on('pan', function(e) {
      var turnY = -Math.PI * 0.02 * (e.deltaX / window.innerWidth),
          turnX = -Math.PI * 0.02 * (e.deltaY / window.innerHeight);

      if(camAnchor) {
        camAnchor.rotation.y += turnY;
        camAnchor.rotation.x += turnX;
      } else {
        cam.rotation.y += turnY;
        cam.rotation.x += turnX;
      }
      swingX = turnX;
      swingY = turnY;

      wasMoved = true;
    });

    hammertime.on('pinchmove', function(e) {
      if(e.scale >= 1.0 && camera.position.z <= minZ) return;

      camera.position.z += (1 - e.scale) * 2;
      wasMoved = true;
    });

    document.body.addEventListener('wheel', function(e) {
      if(e.wheelDelta) { // Chrome
        if(e.wheelDelta > 0 && camera.position.z <= minZ) return;
        camera.position.z -= e.wheelDelta / 12;
      } else if(e.deltaY) { // Firefox / IE
        if(e.deltaY < 0 && camera.position.z <= minZ) return;
        camera.position.z += Math.max(Math.min(e.deltaY, 5), -5);
      }

      wasMoved = true;
      e.stopPropagation();
      e.preventDefault();
    });
  };

  instance.update = function() {
    if(!camAnchor) camAnchor = cam;

    if(swingX !== 0) {
      camAnchor.rotation.x += swingX;
      if(swingX < -0.001) {
        swingX += 0.001;
      } else if(swingX > 0.001) {
        swingX -= 0.001;
      } else {
        swingX = 0;
      }
    }

    if(swingY !== 0) {
      camAnchor.rotation.y += swingY;
      if(swingY < -0.001) {
        swingY += 0.001;
      } else if(swingY > 0.001) {
        swingY -= 0.001;
      } else {
        swingY = 0;
      }
    }
  };

  instance.wasMoved = function() { return wasMoved; };

  return instance;
})();
