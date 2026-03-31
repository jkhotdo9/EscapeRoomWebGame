class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Debug and volume stuff
        this.debug = false;
        this.muted = false;
        this.musicVolume = 0.3; // the ACTUAL music vol 
        this.sfxVolume = 0.45

        // Keyboard flags (used by gameplay and TitleScreen)
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.enter = false;
        this.E = false;
        this.I = false;

        // Track whether keyboard is being used
        this.keyboardActive = false;

        //this prevents movement while viewing interactive objects like the rose painting aka pauses the rest ... ?
        // BUG: IT DONT WORK THO
        this.examining = false;

        this.mouseDown = false; 
        this.mouseUp = false;   
        this.activePopup = null;


    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    }

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    }

    startInput() {
        const that = this;

        const getXandY = e => ({
            x: (e.clientX - this.ctx.canvas.getBoundingClientRect().left) * (1380 / this.ctx.canvas.getBoundingClientRect().width),
            y: (e.clientY - this.ctx.canvas.getBoundingClientRect().top) * (882 / this.ctx.canvas.getBoundingClientRect().height)
        });

        // Make canvas focusable so it can receive keyboard events reliably
        this.ctx.canvas.tabIndex = 1;
        this.ctx.canvas.style.outline = "none";

        // Focus the canvas so ArrowUp does not get eaten by the browser/page
        this.ctx.canvas.addEventListener("mousedown", () => this.ctx.canvas.focus());
        this.ctx.canvas.focus();

        function keydownListener(e) {
            that.keyboardActive = true;

            // Prevent browser scrolling with arrow keys and space
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
                e.preventDefault();
            }

            // Keep both APIs in sync:
            // 1) boolean flags (that.up, that.down, etc.)
            // 2) key map (that.keys["ArrowUp"], that.keys["Enter"], etc.)
            that.keys[e.key] = true;

            switch (e.code) {
                case "ArrowLeft":
                case "KeyA":
                    that.left = true;
                    break;

                case "ArrowRight":
                case "KeyD":
                    that.right = true;
                    break;

                case "ArrowUp":
                case "KeyW":
                    that.up = true;
                    break;

                case "ArrowDown":
                case "KeyS":
                    that.down = true;
                    break;

                case "KeyE":
                    that.E = true;
                    break;

                case "KeyI":
                    that.I = true;
                    break;

                case "Enter":
                    that.enter = true;
                    break;
            }
        }

        function keyUpListener(e) {
            that.keyboardActive = false;

            that.keys[e.key] = false;

            switch (e.code) {
                case "ArrowLeft":
                case "KeyA":
                    that.left = false;
                    break;

                case "ArrowRight":
                case "KeyD":
                    that.right = false;
                    break;

                case "ArrowUp":
                case "KeyW":
                    that.up = false;
                    break;

                case "ArrowDown":
                case "KeyS":
                    that.down = false;
                    break;

                case "KeyE":
                    that.E = false;
                    break;

                case "KeyI":
                    that.I = false;
                    break;

                case "Enter":
                    that.enter = false;
                    break;
            }
        }

        // Keyboard
        this.ctx.canvas.addEventListener("keydown", keydownListener);
        this.ctx.canvas.addEventListener("keyup", keyUpListener);

        // Keep references (if other code expects them)
        that.keydown = keydownListener;
        that.keyup = keyUpListener;

        // Mouse move
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.debug) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        // Left click
        this.ctx.canvas.addEventListener("click", e => {
            if (this.debug) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);

            // Clicking also focuses canvas, helps keyboard input
            this.ctx.canvas.focus();
        });

        // Add these event listeners (after the existing click listener)
        this.ctx.canvas.addEventListener("mousedown", e => {
            this.mouseDown = true;
            this.mouseUp = false;
        });

        this.ctx.canvas.addEventListener("mouseup", e => {
            this.mouseDown = false;
            this.mouseUp = true;
            
            // Reset mouseUp after one frame
            setTimeout(() => {
                this.mouseUp = false;
            }, 50);
        });


        // Mouse wheel
        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.debug) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent scrolling
            this.wheel = e;
        });

        // Right click context menu
        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.debug) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent context menu
            this.rightclick = getXandY(e);
        });
    }

    addEntity(entity) {
        this.entities.push(entity);
        //these comments are for the depth issues
        //this.entities.sort((a, b) => (a.depth ?? (a.y ?? 0)) - (b.depth ?? (b.y ?? 0)));
        //let worldEntities = this.entities.filter(e => !e.isPopup);
        //worldEntities.sort((a, b) => (a.depth ?? (a.y ?? 0)) - (b.depth ?? (b.y ?? 0)));
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw world entities sorted by depth
        let worldEntities = this.entities.filter(e => !e.isPopup);
        worldEntities.sort((a, b) => (a.depth ?? (a.y ?? 0)) - (b.depth ?? (b.y ?? 0)));
        for (let entity of worldEntities) {
            entity.draw(this.ctx, this);
        }

        // Draw ALL popups on top (in case multiple are open)
        let popups = this.entities.filter(e => e.isPopup);
        for (let popup of popups) {
            popup.draw(this.ctx, this);
        }
    }

    update() {
        let entitiesCount = this.entities.length;

        // Update scene manager FIRST
        if (this.sceneManager) {
            this.sceneManager.update(); 
        }
        
        // updates all entities (including pop ups like inventory and interactables)
        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (entity && !entity.removeFromWorld) {
                entity.update();
            }
        }

        // remove entities that should be gone 
        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i] && this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}
