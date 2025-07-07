// --- RailMan Yard Visualization ---

// --- Data Arrays ---

// Placeholder spots for cars
const placeholder = [
  { x: 910, y: 1050, open: 1, id: "SW1", rotation: -7 },
  { x: 990, y: 1030, open: 1, id: "SW2", rotation: -7 },
  { x: 1070, y: 1010, open: 1, id: "SW3", rotation: -7 },
  { x: 1150, y: 990, open: 1, id: "SW4", rotation: -7 },
  { x: 1230, y: 970, open: 1, id: "SW5", rotation: -7 },
  { x: 1310, y: 950, open: 1, id: "SW6", rotation: -7 },
  { x: 1390, y: 930, open: 1, id: "SW7", rotation: -7 },

  { x: 1200, y: 1200, open: 1, id: "SE1", rotation: 7 },
  { x: 1280, y: 1220, open: 1, id: "SE2", rotation: 7 },
  { x: 1360, y: 1240, open: 1, id: "SE3", rotation: 7 },
  { x: 1440, y: 1260, open: 1, id: "SE4", rotation: 7 },
  { x: 1520, y: 1280, open: 1, id: "SE5", rotation: 7 },
];

// Status types for cars
const railstatus = [
  { text: "MT", color: "#888888" },
  { text: "WASH", color: "#7bb3e3" },
  { text: "LOAD", color: "#ed8246" },
  { text: "SPOT", color: "#f9e66c" },
  { text: "BAD", color: "#d05555" },
  { text: "HOLD", color: "#b5c76c" }
];

// Example railcars
const railcar = [
  { x: 0, y: 0, radius: 25, id:"CCLX1236", product:"026550-000", spot:"SE2", status:5 },
  { x: 0, y: 0, radius: 25, id:"CCLX1337", product:"026550-000", spot:"SE3", status:3 },
  { x: 0, y: 0, radius: 25, id:"CCLX1372", product:"026550-000", spot:"SE4", status:2 },
  { x: 0, y: 0, radius: 25, id:"CCLX1671", product:"026550-000", spot:"SW1", status:0 },
  { x: 0, y: 0, radius: 25, id:"CCLX1420", product:"026550-000", spot:"SW2", status:1 }
];

// --- Canvas/State Variables ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasmap = document.getElementById('canvasmap');
const ctxmap = canvasmap.getContext('2d');

let dragmode = null;
let selectedcar = null;
let lastlocation = { x: 0, y: 0, spot: null };
let hovercar = null;
let panX = 0, panY = 0, zoom = 1;

let mapImage = new Image();
let mapLoaded = false;
mapImage.src = 'railmap.jpg';
mapImage.onload = function() {
  mapLoaded = true;
  drawAll();
};

// --- Utility Functions ---

function resizeCanvas() {
  canvas.width = canvasmap.width = window.innerWidth;
  canvas.height = canvasmap.height = window.innerHeight;
  drawAll();
}

// Place cars at their initial spots
function initSpots() {
  for (const car of railcar) {
    const spot = placeholder.find(p => p.id === car.spot);
    if (spot) {
      car.x = spot.x;
      car.y = spot.y;
    }
  }
}

// --- Drawing Functions ---

function drawAll() {
  // Draw the map image as the background on canvasmap
  ctxmap.clearRect(0, 0, canvasmap.width, canvasmap.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctxmap.save();
  ctxmap.translate(panX, panY);
  ctxmap.scale(zoom, zoom);
  if (mapLoaded) {
    ctxmap.drawImage(mapImage, 0, 0);
  }
  ctxmap.restore();

  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(zoom, zoom);

  // Draw placeholders
  for (const spot of placeholder) {
    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.rotate(spot.rotation * Math.PI / 180);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 2;
    ctx.strokeRect(-30, -12, 60, 24);
    ctx.restore();
  }

  // Draw railcars
  for (let i = 0; i < railcar.length; i++) {
    const car = railcar[i];
    const spot = placeholder.find(p => p.id === car.spot);
    const rotation = spot ? spot.rotation : 0;
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = railstatus[car.status].color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 18, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = (i === hovercar) ? '#000' : '#444';
    ctx.lineWidth = (i === hovercar) ? 4 : 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(car.id, 0, 5);
    ctx.font = '12px sans-serif';
    ctx.fillText(railstatus[car.status].text, 0, -12);
    ctx.restore();
  }

  ctx.restore();
}

// --- Interaction Logic ---

canvas.addEventListener('mousedown', function(e) {
  const [mx, my] = screenToWorld(e.offsetX, e.offsetY);
  for (let i = 0; i < railcar.length; i++) {
    const car = railcar[i];
    if (Math.hypot(mx - car.x, my - car.y) < car.radius) {
      dragmode = "car";
      selectedcar = i;
      lastlocation = { x: car.x, y: car.y, spot: car.spot };
      return;
    }
  }
  dragmode = "pan";
  selectedcar = null;
  panStart = { x: e.clientX - panX, y: e.clientY - panY };
});

canvas.addEventListener('mousemove', function(e) {
  const [mx, my] = screenToWorld(e.offsetX, e.offsetY);
  let found = null;
  for (let i = 0; i < railcar.length; i++) {
    const car = railcar[i];
    if (Math.hypot(mx - car.x, my - car.y) < car.radius) {
      found = i;
    }
  }
  if (found !== hovercar) {
    hovercar = found;
    drawAll();
  }
  if (dragmode === "car" && selectedcar !== null) {
    const car = railcar[selectedcar];
    car.x = mx;
    car.y = my;
    drawAll();
  }
  if (dragmode === "pan" && panStart) {
    panX = e.clientX - panStart.x;
    panY = e.clientY - panStart.y;
    drawAll();
  }
});

canvas.addEventListener('mouseleave', function() {
  if (hovercar !== null) {
    hovercar = null;
    drawAll();
  }
});

canvas.addEventListener('mouseup', function(e) {
  if (dragmode === "car" && selectedcar !== null) {
    // Check for valid spot
    let car = railcar[selectedcar];
    let threshold = car.radius * 1.5;
    let validSpot = null;
    for (let i = 0; i < placeholder.length; i++) {
      if (Math.hypot(car.x - placeholder[i].x, car.y - placeholder[i].y) < threshold) {
        // Check if spot is already taken by another car
        const spotId = placeholder[i].id;
        const occupied = railcar.some((rc, idx) => idx !== selectedcar && rc.spot === spotId);
        if (!occupied) {
          validSpot = i;
        }
        break; // Only allow one spot per drop
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
  panStart = null;
});

// Disallow multiple cars per spot
function tweenCarBack(idx, x, y, spot) {
  const car = railcar[idx];
  const steps = 10;
  const dx = (x - car.x) / steps;
  const dy = (y - car.y) / steps;
  let count = 0;
  function anim() {
    if (count < steps) {
      car.x += dx;
      car.y += dy;
      drawAll();
      count++;
      requestAnimationFrame(anim);
    } else {
      car.x = x;
      car.y = y;
      car.spot = spot;
      drawAll();
    }
  }
  anim();
}

// --- Zoom/Pan ---

canvas.addEventListener('wheel', function(e) {
  e.preventDefault();
  const mx = (e.offsetX - panX) / zoom;
  const my = (e.offsetY - panY) / zoom;
  const factor = (e.deltaY < 0) ? 1.1 : 0.9;
  zoom *= factor;
  panX = e.offsetX - mx * zoom;
  panY = e.offsetY - my * zoom;
  drawAll();
}, { passive: false });

function screenToWorld(sx, sy) {
  return [ (sx - panX) / zoom, (sy - panY) / zoom ];
}

// --- Initialization ---

window.addEventListener('resize', resizeCanvas);

let panStart = null;
resizeCanvas();
initSpots();
drawAll();
