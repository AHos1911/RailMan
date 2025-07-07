// --- DATA ARRAYS (unchanged) ---
const placeholder = [
    { x: 910, y: 1050, open: 1, id: "SW1",  rotation: -7 },
    { x: 1150, y: 1020, open: 1, id: "SW2",  rotation: -7 },
    { x: 555, y: 1219,  open: 1, id: "SE1",  rotation: -7 },
    { x: 795, y: 1187,  open: 1, id: "SE2",  rotation: -8 },
    { x: 1035, y: 1150, open: 1, id: "SE3",  rotation: -9 },
    { x: 1275, y: 1102, open: 1, id: "SE4",  rotation: -12 },
    { x: 1510, y: 1045, open: 1, id: "SE5",  rotation: -13 },
    { x: 1750, y: 990,  open: 1, id: "SE6",  rotation: -11 },
    { x: 1990, y: 940,  open: 1, id: "SE7",  rotation: -9 },
    { x: 2230, y: 900,  open: 1, id: "SE8",  rotation: -7 },
    { x: 2500, y: 865,  open: 1, id: "LOAD", rotation: -6 },
    { x: 2785, y: 830,  open: 1, id: "N1",   rotation: -6 },
    { x: 3030, y: 800,  open: 1, id: "N2",   rotation: -6 },
    { x: 3280, y: 775,  open: 1, id: "N3",   rotation: -6 },
    { x: 3530, y: 745,  open: 1, id: "N4",   rotation: -6 },
    { x: 3730, y: 745,  open: 1, id: "N5",   rotation: -6 }
];

const railcar = [
    { x: 0,  y: 0,  radius: 25, id:"CCLX1236",  product:"026550-000", spot:"SE2", status:5},
    { x: 0,  y: 0,  radius: 25, id:"CCLX1236",  product:"026550-000", spot:"SE3", status:3},
    { x: 0,  y: 0,  radius: 25, id:"UTLX31600", product:"011440-000", spot:"LOAD", status:2},
    { x: 0,  y: 0,  radius: 25, id:"PROX1600",  product:"011440-000", spot:"SE5", status:0},
    { x: 0,  y: 0,  radius: 25, id:"CCLX1202",  product:"026550-000", spot:"SE6", status:0},
    { x: 0,  y: 0,  radius: 25, id:"GATX23452", product:"026550-000", spot:"SE7", status:0},
    { x: 0,  y: 0,  radius: 25, id:"PROX23423", product:"026550-000", spot:"SE8", status:3},
    { x: 0,  y: 0,  radius: 25, id:"CCLX9123",  product:"026430-000", spot:"SW1", status:4}
];

const railstatus = [
  { text: "MT",    color: "#888888"},
  { text: "WASH",  color: "#4444FF"},
  { text: "LOAD",  color: "orange"},
  { text: "SHIP",  color: "green"},
  { text: "HOLD",  color: "red"},
  { text: "REJ",   color: "purple"}
];

// --- MAP IMAGE ---
const mapImage = new Image();
mapImage.src = 'railmap.jpg';

// --- CANVAS SETUP ---
const canvasmap = document.getElementById('canvasmap');
const ctxmap = canvasmap.getContext('2d');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- STATE ---
let zoom = 1, camerax = 0, cameray = 0;
let hoveredcar = null, selectedcar = null, lastlocation = {x:0, y:0, spot:""};
let tweeningCar = null;
let tweenStart = null, tweenEnd = null, tweenTime = 0;
let animationFrame = null;

// --- FIT MAP TO SCREEN ---
function fitImage() {
  if (!mapImage.naturalWidth || !mapImage.naturalHeight) return;
  let scaleX = canvas.width / mapImage.naturalWidth;
  let scaleY = canvas.height / mapImage.naturalHeight;
  zoom = Math.max(scaleX, scaleY);
  let imgW = mapImage.naturalWidth * zoom;
  let imgH = mapImage.naturalHeight * zoom;
  camerax = (canvas.width - imgW) / 2;
  cameray = (canvas.height - imgH) / 2;
}

// --- INIT RAILCAR POSITIONS (based on spot) ---
for (let i = 0; i < railcar.length; i++) {
  let idx = placeholder.findIndex(s => s.id == railcar[i].spot);
  if (idx !== -1) {
    railcar[i].x = placeholder[idx].x;
    railcar[i].y = placeholder[idx].y;
  }
}

// --- DRAW FUNCTIONS (unchanged) ---
function drawMap() {
  ctxmap.setTransform(1,0,0,1,0,0);
  ctxmap.clearRect(0, 0, canvasmap.width, canvasmap.height);
  ctxmap.setTransform(zoom, 0, 0, zoom, camerax, cameray);
  ctxmap.filter = 'opacity(.5)';
  if (mapImage.complete && mapImage.naturalWidth)
    ctxmap.drawImage(mapImage, 0, 0);
  ctxmap.filter = 'none';
}
function drawPlaceholders() {
  for (let i = 0; i < placeholder.length; i++) {
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, camerax, cameray);
    ctx.translate(placeholder[i].x, placeholder[i].y);
    ctx.rotate(placeholder[i].rotation * Math.PI/180);
    ctx.strokeStyle = "#E4E4E4";
    ctx.lineWidth = 66; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-82, 0); ctx.lineTo(82, 0); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-82, 0, 30, 0, Math.PI*2); ctx.fillStyle = "#DDDDDD"; ctx.fill();
    ctx.fillStyle = "#CCCCCC";
    ctx.textAlign = "center";
    ctx.font = "bold 20pt Arial";
    ctx.fillText(placeholder[i].id, 0, 10);
    ctx.restore();
  }
}
function drawRailcars() {
  for (let i = 0; i < railcar.length; i++) {
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, camerax, cameray);
    ctx.translate(railcar[i].x, railcar[i].y);
    let spot = placeholder.find(s=>s.id==railcar[i].spot);
    if (spot) ctx.rotate(spot.rotation * Math.PI/180);
    ctx.filter = "blur(4px)";
    ctx.beginPath(); ctx.moveTo(-75,5); ctx.lineTo(85,5);
    ctx.lineWidth = 60; ctx.lineCap = "round"; ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.stroke();
    ctx.filter = "none";
    ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(80, 0);
    ctx.lineWidth = 60; ctx.strokeStyle = "#000"; ctx.stroke();
    ctx.beginPath(); ctx.arc(-80, 0, 25, 0, Math.PI*2); ctx.fillStyle = railstatus[railcar[i].status].color; ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(-80, 0, 22, 0, Math.PI*2);
    ctx.fillStyle = hoveredcar==i ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = hoveredcar==i ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0)";
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font = "bold 10pt Arial";
    ctx.fillText(railstatus[railcar[i].status].text, -80+25-25, 5);
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 14pt Arial";
    ctx.fillText(railcar[i].id, -80+25+60, -10);
    ctx.font = "bold 10pt Arial";
    ctx.fillText(railcar[i].product, -80+25+60, 5);
    ctx.fillText(railcar[i].spot, -80+25+60, 20);
    ctx.restore();
  }
}
function drawAll() {
  drawMap();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlaceholders();
  drawRailcars();
}

// --- COORDINATE UTILS ---
function screenToWorld(x, y) {
  return {
    x: (x - camerax) / zoom,
    y: (y - cameray) / zoom
  };
}

// --- RAILCAR HITTEST (BAR+HEAD, ROTATED) ---
function isPointInRailcar(px, py, car) {
  // Find rotation
  let spot = placeholder.find(s=>s.id==car.spot);
  let rot = spot ? spot.rotation * Math.PI/180 : 0;
  // Transform (px,py) to railcar local coordinates
  let dx = px - car.x;
  let dy = py - car.y;
  let cos = Math.cos(-rot), sin = Math.sin(-rot);
  let localX = dx * cos - dy * sin;
  let localY = dx * sin + dy * cos;
  // Bar: rectangle from x=-80 to x=80, y=-30 to y=+30 (60px wide)
  if (localX >= -80 && localX <= 80 && Math.abs(localY) <= 30) return true;
  // Head: circle at x=-80, y=0, r=25
  let hx = localX + 80, hy = localY;
  if (Math.hypot(localX + 80, localY) <= 25) return true;
  return false;
}

// --- HOVER ---
canvas.addEventListener('mousemove', function(e) {
  let {x: mx, y: my} = screenToWorld(e.clientX, e.clientY);
  let newhovered = null;
  for (let i=0; i<railcar.length; i++) {
    if (isPointInRailcar(mx, my, railcar[i])) {
      newhovered = i;
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
