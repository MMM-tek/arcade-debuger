//% color="#cf0000" icon="\uf121" block="Debugger Pro"
namespace Debugger {
    let showCollisions = false;
    let showFPS = false;
    let showInput = false;
    let showTilemap = false;

    let frameCount = 0;
    let fps = 0;
    let lastTime = game.runtime();

    /** 
     * Show/Hide hitboxes, coordinates and direction lines
     */
    //% block="show hitboxes %on"
    //% on.shadow="toggleOnOff"
    export function setHitboxes(on: boolean) { showCollisions = on; }

    /** 
     * Show/Hide FPS meter
     */
    //% block="show FPS meter %on"
    //% on.shadow="toggleOnOff"
    export function setFPS(on: boolean) { showFPS = on; }

    /** 
     * Show/Hide controller overlay
     */
    //% block="show input overlay %on"
    //% on.shadow="toggleOnOff"
    export function setInput(on: boolean) { showInput = on; }

    /** 
     * Highlight tilemap walls in yellow
     */
    //% block="show tilemap walls %on"
    //% on.shadow="toggleOnOff"
    export function setTilemap(on: boolean) { showTilemap = on; }

    scene.createRenderable(1000, function (target: Image, camera: scene.Camera) {
        const scene = game.currentScene();

        // --- 5. FPS METER ---
        if (showFPS) {
            frameCount++;
            let currentTime = game.runtime();
            if (currentTime - lastTime >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
            }
            target.fillRect(0, 0, 42, 10, 15);
            target.print("FPS: " + fps, 2, 2, 5);
        }

        // --- 2. INPUT OVERLAY (Corrected A/B) ---
        if (showInput) {
            const bx = 2, by = 105;
            target.fillRect(bx + 4, by, 4, 12, 13);
            target.fillRect(bx, by + 4, 12, 4, 13);
            if (controller.up.isPressed()) target.fillRect(bx + 4, by, 4, 4, 4);
            if (controller.down.isPressed()) target.fillRect(bx + 4, by + 8, 4, 4, 4);
            if (controller.left.isPressed()) target.fillRect(bx, by + 4, 4, 4, 4);
            if (controller.right.isPressed()) target.fillRect(bx + 8, by + 4, 4, 4, 4);

            // Button B (Left)
            target.fillCircle(bx + 20, by + 8, 3, controller.B.isPressed() ? 2 : 13);
            target.print("B", bx + 18, by - 2, 1);

            // Button A (Right)
            target.fillCircle(bx + 30, by + 8, 3, controller.A.isPressed() ? 7 : 13);
            target.print("A", bx + 28, by - 2, 1);
        }

        // --- 6. TILEMAP WALLS ---
        if (showTilemap && scene.tileMap) {
            const tm = scene.tileMap;
            const sCol = Math.floor(camera.drawOffsetX / tm.scale);
            const sRow = Math.floor(camera.drawOffsetY / tm.scale);
            for (let c = sCol; c <= sCol + 11; c++) {
                for (let r = sRow; r <= sRow + 9; r++) {
                    if (tm.isObstacle(c, r)) {
                        target.drawRect((c * tm.scale) - camera.drawOffsetX, (r * tm.scale) - camera.drawOffsetY, tm.scale, tm.scale, 5);
                    }
                }
            }
        }

        // --- 1, 2 & 3. HITBOXES & WHITE DIRECTION LINE ---
        if (showCollisions) {
            for (let item of scene.allSprites) {
                if (item instanceof Sprite) {
                    const s = item as Sprite;
                    if (s.flags & sprites.Flag.Destroyed) continue;

                    const ox = s.left - camera.drawOffsetX;
                    const oy = s.top - camera.drawOffsetY;
                    const cx = s.x - camera.drawOffsetX;
                    const cy = s.y - camera.drawOffsetY;

                    // Box color: Green if hitting floor, Red otherwise
                    let color = s.isHittingTile(CollisionDirection.Bottom) ? 7 : 2;
                    target.drawRect(ox, oy, s.width, s.height, color);

                    // --- 1. WHITE DIRECTION LINE (Vector) ---
                    // Only draw if moving (speed > 1)
                    if (Math.abs(s.vx) > 1 || Math.abs(s.vy) > 1) {
                        // Line from center to velocity direction (scaled down)
                        target.drawLine(cx, cy, cx + (s.vx / 4), cy + (s.vy / 4), 1);
                        // Small white pixel at the tip of the line
                        target.setPixel(cx + (s.vx / 4), cy + (s.vy / 4), 1);
                    }

                    // Labels
                    target.print(s.kind().toString(), ox, oy - 10, 5);
                    target.print(Math.round(s.x) + "," + Math.round(s.y), ox, oy + s.height + 2, 9);
                }
            }
        }
    });
}
