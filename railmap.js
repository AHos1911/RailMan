      break;
    }
  }
  if (hoveredcar !== newhovered) {
    hoveredcar = newhovered;
    drawAll();
  }
});

// --- DRAGGING ---
let dragmode = null;
let lastDrag = null;
canvas.addEventListener('mousedown', function(e) {
  let {x: mx, y: my} = screenToWorld(e.clientX, e.clientY);
  for (let i=0; i<railcar.length; i++) {
    if (isPointInRailcar(mx, my, railcar[i])) {
      selectedcar = i;
      dragmode = "car";
      lastlocation = { x: railcar[i].x, y: railcar[i].y, spot: railcar[i].spot };
      return;
    }
  }
  dragmode = "pan";
  lastDrag = {x: e.clientX, y: e.clientY, cx: camerax, cy: cameray};
});
window.addEventListener('mouseup', function(e) {
  if (dragmode === "car" && selectedcar !== null) {
    // Check for valid spot
    let car = railcar[selectedcar];
    let threshold = car.radius * 1.5;
    let validSpot = null;
    for (let i = 0; i < placeholder.length; i++) {
      if (Math.hypot(car.x - placeholder[i].x, car.y - placeholder[i].y) < threshold) {
        validSpot = i;
        break;
      }
    }
    if (validSpot !== null) {
      car.x = placeholder[validSpot].x;
      car.y = placeholder[validSpot].y;
      car.spot = placeholder[validSpot].id;
      drawAll();
    } else {
      // Tween back to lastlocation
      tweenCarBack(selectedcar, lastlocation.x, lastlocation.y, lastlocation.spot);
    }
  }
  dragmode = null;
  selectedcar = null;
});
window.addEventListener('mousemove', function(e) {
  if (dragmode === "car" && selectedcar !== null) {
    let {x: mx, y: my} = screenToWorld(e.clientX, e.clientY);
    railcar[selectedcar].x = mx;
    railcar[selectedcar].y = my;
    railcar[selectedcar].spot = "";
    const threshold = railcar[selectedcar].radius * 1.5;
    for (let i = 0; i < placeholder.length; i++) {
      if (Math.hypot(mx - placeholder[i].x, my - placeholder[i].y) < threshold) {
        railcar[selectedcar].x = placeholder[i].x;
        railcar[selectedcar].y = placeholder[i].y;
        railcar[selectedcar].spot = placeholder[i].id;
      }
    }
    drawAll();
  } else if (dragmode === "pan") {
    camerax = lastDrag.cx + (e.clientX - lastDrag.x);
    cameray = lastDrag.cy + (e.clientY - lastDrag.y);
    clampCamera();
    drawAll();
  }
});

// --- TWEEN BACK ---
function tweenCarBack(carIdx, toX, toY, toSpot) {
  tweeningCar = railcar[carIdx];
  tweenStart = { x: tweeningCar.x, y: tweeningCar.y };
  tweenEnd = { x: toX, y: toY, spot: toSpot };
  tweenTime = 0;
  function animate() {
    tweenTime += 1/60;
    let t = Math.min(tweenTime / 0.4, 1); // 0.4s tween
    let ease = 1 - Math.pow(1 - t, 2);
    tweeningCar.x = tweenStart.x + (tweenEnd.x - tweenStart.x) * ease;
    tweeningCar.y = tweenStart.y + (tweenEnd.y - tweenStart.y) * ease;
    drawAll();
    if (t < 1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      tweeningCar.x = tweenEnd.x;
      tweeningCar.y = tweenEnd.y;
      tweeningCar.spot = tweenEnd.spot;
      tweeningCar = null;
      drawAll();
    }
  }
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animate();
}

// --- ZOOM TO MOUSE AND CONSTRAIN ---
canvas.addEventListener('wheel', function(event){
  event.preventDefault();
  let mouseX = event.clientX, mouseY = event.clientY;
  let {x: wx, y: wy} = screenToWorld(mouseX, mouseY);
  let zoomFactor = event.deltaY < 0 ? 1.15 : 1/1.15;
  let minZoom = Math.max(canvas.width / mapImage.naturalWidth, canvas.height / mapImage.naturalHeight);
  let newZoom = Math.max(minZoom, Math.min(zoom * zoomFactor, 4));
  camerax = mouseX - wx * newZoom;
  cameray = mouseY - wy * newZoom;
  zoom = newZoom;
  clampCamera();
  drawAll();
}, {passive:false});

function clampCamera() {
  let imgW = mapImage.naturalWidth * zoom;
  let imgH = mapImage.naturalHeight * zoom;
  if (imgW < canvas.width) camerax = (canvas.width - imgW) / 2;
  else camerax = Math.min(0, Math.max(camerax, canvas.width - imgW));
  if (imgH < canvas.height) cameray = (canvas.height - imgH) / 2;
  else cameray = Math.min(0, Math.max(cameray, canvas.height - imgH));
}

// --- RESIZE HANDLER ---
function resize() {
  canvasmap.width = canvas.width = window.innerWidth;
  canvasmap.height = canvas.height = window.innerHeight;
  fitImage();
  drawAll();
}
window.addEventListener('resize', resize);

// --- IMAGE LOAD AND FIRST DRAW ---
mapImage.onload = function() { resize(); };
resize();
