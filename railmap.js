window.addEventListener('mouseup', function(e) {
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
});
