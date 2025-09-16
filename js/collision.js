(function () {
  // Reuse SAT objects to avoid per-frame allocations
  const vCircle = new SAT.Vector(0, 0);
  const circle = new SAT.Circle(vCircle, 1);

  const vBox = new SAT.Vector(0, 0);
  let boxPoly = new SAT.Box(vBox, 1, 1).toPolygon();

  function circleVsBox(px, py, pr, ox, oy, os) {
    if (
      !Number.isFinite(px) ||
      !Number.isFinite(py) ||
      !Number.isFinite(pr) ||
      pr <= 0
    )
      return false;
    if (
      !Number.isFinite(ox) ||
      !Number.isFinite(oy) ||
      !Number.isFinite(os) ||
      os <= 0
    )
      return false;

    const half = os / 2;

    // Update reused SAT objects
    vCircle.x = px;
    vCircle.y = py;
    circle.r = pr;
    vBox.x = ox - half;
    vBox.y = oy - half;

    // Resize existing polygon to the new box dimensions
    boxPoly = new SAT.Box(vBox, os, os).toPolygon();

    return SAT.testPolygonCircle(boxPoly, circle);
  }

  window.COLLIDE = {
    playerWithObstacle(player, obstacle) {
      return circleVsBox(
        player.x,
        player.y,
        player.radius,
        obstacle.x,
        obstacle.y,
        obstacle.size
      );
    },
  };
})();
