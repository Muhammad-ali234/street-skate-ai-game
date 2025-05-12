// Helper function to calculate distance between two points (GDD Section 5.5)
function getDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) +
        Math.pow(point1.y - point2.y, 2) +
        Math.pow(point1.z - point2.z, 2)
    );
}

// Update score display (GDD Section 2.2)
function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

// Handle window resize (GDD Section 3.3)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// GDD Section 2.1: Check if player is near the rail
function isNearRail() {
    // Check if player is within 1 unit of the rail in x and y
    const dx = Math.abs(player.position.x - rail.position.x);
    const dy = Math.abs(player.position.y - (rail.position.y + 0.25));
    const dz = Math.abs(player.position.z - rail.position.z);
    return dx < 1 && dy < 1 && dz < 10; // Allow full rail length
}