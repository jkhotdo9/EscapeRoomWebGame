class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentRoom = "room1";
        this.coldWindAudio = null;

        this.roomIntroPlayed = {
            room2: false,
            room3: false,
            room4: false,
            room5: false
        };

        // Player state
        this.health = 3;
        this.inventory = []; // Will store objects like {name, sprite, used}

        //killer stuff
        this.room4KillerTimer = 0;
        this.room4KillerDelay = 1; // seconds
        this.room4KillerSpawned = false;

        // set true to unlock door for easier testing, false to lock it
        this.debugDoorUnlocks = {
            room1ToRoom2: false,   // Door from room 1 to room 2
            room2ToRoom3: false,   // Door from room 2 to room 3
            room3ToRoom4: false,  // Door from room 3 to room 4 
            room4ToRoom5: true   // This should always be set to true
        };

        // Puzzle progress tracking
        this.puzzleStates = {
            room1: { door1Open: false, hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false },
            room2: { door2Open: false, pipeObtained: false, lockBroken: false, lockPosition: null, introPlayed: false, saidGoodbyeToShiannel: false, nudgedToShiannel: false },
            room3: {
                door3Open: false,
                snowflakeMedallion: false,
                candleMedallion: false,
                leafMedallion: false,
                hasCandleCodex: false,
                talkedAboutCandles: false,
                candlesArranged: false,
                candleOrder: ["yellow", "blue", "green", "purple", "pink"],
                medallionDoor: false,
                medallionSlots: [null, null, null],
                // codex drop
                codexDropped: false,
                codexPickedUp: false,
                codexPos: null,
                medallionDialoguePlayed: false,
            },
            room5: {
                bookshelfClosed: false,
                room5DialoguePlayed: false,
                talkedToShiannel: false,
                talkedToVictor: false,
                talkedToJin: false,
                postTalkSequencePlayed: false,
                ghostRevealPlayed: false
            }
        };

        // NPC dialogue tracking
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0, stage: 0 },
            victor: { met: false, dialogueIndex: 0, stage: 0 },
            jin: { met: false, dialogueIndex: 0, stage: 0 }
        };

        this.lily = new Lily(this.game, 2000, 500);

        // ===== BGM STATE =====
        this.roomBGM = null;
        this.roomBGMName = null;

        // ===== DIALOGUE UI =====
        // DialogueBox is defined in DialogueBox.js
        this.dialogueBox = new DialogueBox(this.game);
        this.dialogueBox.isPopup = true;
        // Used only to prevent repeat-triggering on hold
        this.wasEPressed = false;

        // Track dialogue open/close state to prevent E carryover into doors
        this.wasDialogueActive = false;

        // Added: Shiannel "E to Talk" prompt handle
        this.shiannelPrompt = null;

        // Added: single source of truth for Shiannel position in room2
        this.shiannelPos = { x: 1210, y: 150 };

        // Victor/Jin "E to Talk" prompt handles (room3)
        this.victorPrompt = null;
        this.jinPrompt = null;
        this.codexPrompt = null;

        // Single source of truth for Victor/Jin positions in room3 (default)
        this.victorPos = { x: 955, y: 510 };
        this.jinPos = { x: 300, y: 495 };

        //Room5 NPC talk prompts
        this.room5ShiannelPrompt = null;
        this.room5VictorPrompt = null;
        this.room5JinPrompt = null;

        //Room5 NPC positions
        this.room5ShiannelPos = { x: 570, y: 100 };
        this.room5VictorPos = { x: 1210, y: 250 };
        this.room5JinPos = { x: 1140, y: 450 };

        // Codex spawn tracking
        this.codexEntitySpawned = false;

    }


    loadRoom(roomName, spawnX, spawnY) {

        // Stop intro audio whenever a room loads
        if (this.game.introAudio && !this.game.introAudio.paused) {
            this.game.introAudio.pause();
            this.game.introAudio.currentTime = 0;
        }

        // stops cold wind from playing in other rooms
        SOUND_MANAGER.stop("./SFX/Room2/BitterColdWind.mp3");

        // stops Clair De Lune from playing when entering other rooms from room 2
        SOUND_MANAGER.stop("./SFX/Room2/ClairDeLuneMuffled.mp3");

        // stops footsteps of lily when entering another room
        if (this.lily && this.lily.walkLoopAudio) {
            this.lily.walkLoopAudio.pause();
            this.lily.walkLoopAudio.currentTime = 0;
            this.lily.isLooping = false;
            this.lily.wasMoving = false;
        }

        // stops killer footsteps
        const killer = this.game.entities.find(e => e instanceof Killer);
        if (killer && killer.killerWalkAudio) {
            killer.killerWalkAudio.pause();
            killer.killerWalkAudio.currentTime = 0;
        }

        this.clearEntities();
        this.currentRoom = roomName;

        // BGM applicator
        const bgmMap = {
            room1: "./bgm/House of Souls Room1.mp3",
            //room2: "./bgm/House of Souls Room2.mp3",
            room3: "./bgm/House of Souls Room3.mp3",
            room4: "./bgm/House of Souls Room4.mp3",
            //room5: "./bgm/House of Souls Room5.mp3", -- leave it as comment
        };

        const nextBGM = bgmMap[roomName] || null;

        // Stop previous BGM if switching rooms
        if (nextBGM !== this.roomBGMName) {
            if (this.roomBGM) {
                this.roomBGM.pause();
                this.roomBGM.currentTime = 0;
                this.roomBGM = null;
            }

            this.roomBGMName = nextBGM;

            if (nextBGM) {
                this.roomBGM = new Audio(nextBGM);
                this.roomBGM.loop = true;
                this.roomBGM.muted = !!this.game.muted;
                this.roomBGM.volume = (typeof this.game.musicVolume === "number")
                    ? this.game.musicVolume
                    : 0.4; // does not even change it? 
                this.roomBGM.play().catch(() => { });
            }
        }

        if (roomName === "room1") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room1/PlantRoomBackground.png", 1380, 882)
            );

            // Interactive objects
            this.game.addEntity(new RosePainting(this.game, 375, 70));
            this.game.addEntity(new Bookshelf(this.game, 805, 440));
            this.game.addEntity(new KeyPad(this.game, 1025, 150));

            // Decorative objects
            this.game.addEntity(new DecorativeSprite(this.game, 1, 200, "./Sprites/Room1/Bed.png", 300, 300, true, { x: 0, y: 0, w: 40, h: 180 }));
            this.game.addEntity(new DecorativeSprite(this.game, 17, 355, "./Sprites/FillerFurniture/SideTable.png", 90, 80));
            this.game.addEntity(new DecorativeSprite(this.game, 30, 345, "./Sprites/Room1/Plant1.png", 40, 60, true, {}, false, 500));
            this.game.addEntity(new DecorativeSprite(this.game, 50, 400, "./Sprites/Room1/Plant2.png", 40, 70));
            this.game.addEntity(new DecorativeSprite(this.game, 170, 400, "./Sprites/FillerFurniture/BigRedRug.png", 400, 200, false, { x: 0, y: 0, w: 400, h: 200 }, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 55, 520, "./Sprites/Room1/PlantCluster1.png", 520, 600, true, { x: 80, y: 250, w: 200, h: 500 }));
            this.game.addEntity(new DecorativeSprite(this.game, -40, 450, "./Sprites/Room1/PlantCluster2.png", 500, 600, true, { x: 50, y: 70, w: 400, h: 200 }));
            this.game.addEntity(new DecorativeSprite(this.game, 860, 425, "./Sprites/Room1/PlantCluster3.png", 500, 600, true, { x: 400, y: 120, w: 400, h: 50 }));
            this.game.addEntity(new DecorativeSprite(this.game, 1010, 440, "./Sprites/FillerFurniture/Bookshelf.png", 210, 250, true, { x: 0, y: 80, w: 0, h: 150 }, false));
            this.game.addEntity(new DecorativeSprite(this.game, 1275, 300, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200, true, { x: -20, y: 0, w: 0, h: 0 }, true));

            // invisible walls
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 200)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

            // Door to room2
            let door1Open = this.puzzleStates.room1.door1Open || this.debugDoorUnlocks.room1ToRoom2;
            let room1To2Door = new Door(this.game, 1105, 65, 157, 187, "room2", 600, 650,
                "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door1Open, 1.0);
            this.game.addEntity(room1To2Door);
        }

        if (roomName === "room2") {

            // // BItter cold wind plays and will cont until user leaves room 2
            SOUND_MANAGER.playLoop("./SFX/Room2/BitterColdWind.mp3", this.game);

            this.game.addEntity(
                new Background(this.game, "./Sprites/Room2/TheGalleryBackground.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 558, 800, 270, 175, "room1", 1100, 150, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room2 -> room1

            let door2Open = this.puzzleStates.room2.door2Open || this.debugDoorUnlocks.room2ToRoom3;
            let room2To3Door = new Door(this.game, 975, 18, 155, 187, "room3", 600, 700,
                "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", !door2Open, 1.0);
            this.game.addEntity(room2To3Door);

            // added shiannel
            this.game.addEntity(new Shiannel(this.game, 740, 150, true, "crouch"));

            // Added: keep shiannelPos synced with Shiannel spawn position
            this.shiannelPos = { x: 640, y: 180 };

            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 645, 560, 230)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 827, 645, 550, 230)); // bottom right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

            // frames
            this.game.addEntity(new GenericFrame(this.game, 50, 390, "./Sprites/Room2/CatFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 175, 390, "./Sprites/Room2/DogFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 300, 390, "./Sprites/Room2/FlowerFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 425, 390, "./Sprites/Room2/HouseFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 875, 390, "./Sprites/Room2/IslandFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 1000, 390, "./Sprites/Room2/PepeFrame.png", 100, 100, 480));
            this.game.addEntity(new GenericFrame(this.game, 1250, 390, "./Sprites/Room2/SkeletonFrame.png", 100, 100, 480));
            this.game.addEntity(new MusicNoteFrame(this.game, 1125, 390, 100, 100));

            // decorative sprites
            this.game.addEntity(new DecorativeSprite(this.game, -20, 455, "./Sprites/Room2/longredrug.png", 660, 500, false, { x: 0, y: 0, w: 660, h: 500 }, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 820, 455, "./Sprites/Room2/longredrug.png", 640, 500, false, { x: 0, y: 0, w: 640, h: 500 }, false, 250));
            this.game.addEntity(new DecorativeSprite(this.game, 5, 160, "./Sprites/FillerFurniture/OldCouchSide.png", 100, 200));

            // wall
            this.game.addEntity(new DecorativeSprite(this.game, 0, 330, "./Sprites/Room2/Room2InvisWall.png", 563, 150, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));
            this.game.addEntity(new DecorativeSprite(this.game, 831, 330, "./Sprites/Room2/Room2InvisWall.png", 550, 150, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));

            // lock on door
            this.game.addEntity(new FrozenLock(this.game, 1090, 95));
        }

        if (roomName === "room3") {
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room3/TheCellsBackground.png", 1380, 882)
            );

            // decorative sprites
            this.game.addEntity(new DecorativeSprite(this.game, 150, 135, "./Sprites/Room3/TableWithBlood.png", 220, 135, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 1275, 620, "./Sprites/FillerFurniture/SideToilet.png", 95, 110, true, { x: 20, y: 50, w: 60, h: 80 }, true));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 672, "./Sprites/FillerFurniture/LilStool.png", 60, 60, true));
            this.game.addEntity(new DecorativeSprite(this.game, 982, 135, "./Sprites/FillerFurniture/SideTable.png", 242, 122, true));
            this.game.addEntity(new DecorativeSprite(this.game, 25, 150, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 1255, 150, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 2, 482, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 1280, 482, "./Sprites/Room3/ClusterCandles.png", 100, 100, true, { x: 0, y: 0, w: 0, h: 40 },));

            // doors
            this.game.addEntity(new Door(this.game, 550, 815, 265, 150, "room2", 950, 100, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room3 -> room2

            let door3Open = this.puzzleStates.room3.door3Open || this.debugDoorUnlocks.room3ToRoom4;
            let room3To4Door = new Door(this.game, 610, 30, 155, 187, "room4", 250, 700,
                "./Sprites/Room3/BlankMedallionDoor.png", "./Sprites/Room3/OpenMedallionDoor.png", !door3Open, 1.0);
            this.game.addEntity(room3To4Door);

            // added victor and jin
            this.game.addEntity(new Victor(this.game, 955, 510, true));
            this.game.addEntity(new Jin(this.game, 300, 495, true));

            // Reset codex spawn state when entering room3
            this.codexEntitySpawned = false;

            // sync talk prompt positions with NPC spawn
            this.victorPos = { x: 955, y: 510 };
            this.jinPos = { x: 300, y: 495 };

            // interactable objects
            this.game.addEntity(new PigHead(this.game, 210, 110));
            this.game.addEntity(new CandleTable(this.game, 982, 155));
            this.game.addEntity(new MedallionDoor(this.game, 610, 30));

            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 385, 435, 400)); // jailcell left
            this.game.addEntity(new InvisibleCollider(this.game, 945, 385, 450, 400)); // jailcell right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 680, 550, 230)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 815, 680, 560, 230)); // bottom right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left
        }

        if (roomName === "room4") {
            this.game.addEntity(new Background(this.game, "./Sprites/Room4/LibraryBackground.png", 1380, 882));
            // Reset killer spawn state
            this.room4KillerTimer = 0;
            this.room4KillerSpawned = false;

            this.game.addEntity(new Door(this.game, 232, 800, 228, 187, "room3", 600, 100, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room4 -> room3
            let room4To5Door = (new Door(this.game, 1072, 800, 228, 187, "room5", 150, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room4 -> room5

            this.game.addEntity(room4To5Door);

            //wall
            this.game.addEntity(new DecorativeSprite(this.game, 640, 300, "./Sprites/Room4/TopHalfOfBookShelf.png", 420, 115, true, { x: 0, y: 40, w: 0, h: 10 }, true, 400));
            // invisible wall
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 440, 450)); // top left
            this.game.addEntity(new InvisibleCollider(this.game, 1225, 150, 130, 70)); // top right
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 1300, 150, 100, 410)); // right mid
            this.game.addEntity(new InvisibleCollider(this.game, 640, 400, 420, 300)); // center bot
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 0, 645, 235, 230)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 460, 660, 620, 230)); // bottom mid
            this.game.addEntity(new InvisibleCollider(this.game, 1295, 660, 100, 225)); // bottom right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left
        }

        if (roomName === "room5") {

            for (let i = this.game.entities.length - 1; i >= 0; i--) {
                if (this.game.entities[i] instanceof Killer) {
                    this.game.entities.splice(i, 1);
                }
            }
            this.game.addEntity(
                new Background(this.game, "./Sprites/Room5/FinalRoom.png", 1380, 882)
            );

            this.game.addEntity(new Door(this.game, 110, 800, 275, 187, "room4", 1100, 700, "./Sprites/Room1/lockedDORE.png", "./Sprites/Room1/openDORE.png", false, 0.0)); // room5 -> room4


            console.log("room5DialoguePlayed on entry:", this.puzzleStates.room5.room5DialoguePlayed);
            this.game.addEntity(new Door(this.game, 700, 18, 450, 180, "ending", 0, 0, "./Sprites/Room5/FinalDoorLocked.png", "./Sprites/Room5/FinalDoorOpen.png", true, 1.0)); // room5 -> ending screen

            // Add NPCs: Shiannel, Victor and Jin
            this.game.addEntity(new Shiannel(this.game, 570, 100, true, "idle"));
            this.game.addEntity(new Victor(this.game, 1210, 250, true));
            this.game.addEntity(new Jin(this.game, 1140, 450, true));

            // Sync Room5 NPC positions
            this.room5ShiannelPos = { x: 570, y: 100 };
            this.room5VictorPos = { x: 1210, y: 250 };
            this.room5JinPos = { x: 1140, y: 450 };

            // interactable 
            // old thy booketh shelf
            //this.game.addEntity(new DecorativeSprite(this.game, 386, 420, "./Sprites/FillerFurniture/BackOfBookshelf.png", 220, 240, true, { x: 0, y: 0, w: 0, h: 40 },));  
            this.game.addEntity(new PushableBookshelf(this.game, 386, 430));

            // decorative sprites
            this.game.addEntity(new DecorativeSprite(this.game, 10, 350, "./Sprites/FillerFurniture/SideOfBookshelf.png", 82, 300, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 90, "./Sprites/FillerFurniture/SideOfBookshelf.png", 82, 300, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 10, 220, "./Sprites/FillerFurniture/SideOfBookshelf.png", 82, 300, true, { x: 0, y: 0, w: 0, h: 40 },));
            this.game.addEntity(new DecorativeSprite(this.game, 95, 10, "./Sprites/FillerFurniture/Bookshelf.png", 210, 220, true, { x: 0, y: 0, w: 0, h: 70 },));
            this.game.addEntity(new DecorativeSprite(this.game, 308, 10, "./Sprites/FillerFurniture/Bookshelf.png", 210, 220, true, { x: 0, y: 0, w: 0, h: 70 },));
            this.game.addEntity(new DecorativeSprite(this.game, 150, 300, "./Sprites/FillerFurniture/BigRedRug.png", 330, 180, false, { x: 0, y: 0, w: 0, h: 40 }, false, 250));

            // invisible walls
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1380, 150)); // top
            this.game.addEntity(new InvisibleCollider(this.game, 1380, 0, 1, 822)); // right
            this.game.addEntity(new InvisibleCollider(this.game, 0, 825, 1380, 2)); // bottom
            this.game.addEntity(new InvisibleCollider(this.game, 385, 615, 1000, 250)); // bottom center
            this.game.addEntity(new InvisibleCollider(this.game, 0, 620, 115, 250)); // bottom left
            this.game.addEntity(new InvisibleCollider(this.game, 0, 0, 1, 822)); // left

        }

        if (roomName === "ending") {
            this.showEndingScreen();
            return;
        }

        // Position Lily at spawn point
        this.lily.x = spawnX;
        this.lily.y = spawnY;
        this.lily.velocity = { x: 0, y: 0 };
        this.game.addEntity(this.lily);
        this.game.addEntity(this.dialogueBox);

        this.game.addEntity(new HealthUI(this.game));

        // Prevent instant retriggering of interaction key
        this.game.E = false;
        this.wasEPressed = false;

        // Close dialogue on room change
        this.dialogueBox.close();

        // Added: remove Shiannel prompt on room change
        if (this.shiannelPrompt) {
            this.shiannelPrompt.removeFromWorld = true;
            this.shiannelPrompt = null;
        }

        // Remove Room5 prompts on room change
        if (this.room5ShiannelPrompt) { this.room5ShiannelPrompt.removeFromWorld = true; this.room5ShiannelPrompt = null; }
        if (this.room5VictorPrompt) { this.room5VictorPrompt.removeFromWorld = true; this.room5VictorPrompt = null; }
        if (this.room5JinPrompt) { this.room5JinPrompt.removeFromWorld = true; this.room5JinPrompt = null; }

        if (roomName === "room1" && !this.puzzleStates.room1.introPlayed) {
            this.puzzleStates.room1.introPlayed = true;
            this.game.examining = true;

            this.dialogueBox.startSequence(
                [
                    "Where am I?",
                    "The last thing I remember was walking to my car... and then everything went dark.",

                ],
                "./Sprites/UI/LilyPortrait.png",
                "Lily",
                () => {
                    // plays right after "The last thing I remember" line
                    SOUND_MANAGER.play("./SFX/Room1/WomanScream.mp3", this.game);

                    this.dialogueBox.startSequence(
                        [
                            "[A scream echoes in a nearby room]",
                        ],
                        "./Sprites/UI/LilyPortrait.png",
                        "Lily",
                        () => {
                            this.dialogueBox.startSequence(
                                [
                                    "What was that?! Oh god, I have to find a way out of here!"
                                ],
                                "./Sprites/UI/LilyPortrait.png",
                                "Lily",
                                () => {
                                    this.game.examining = false;
                                }
                            );
                        }
                    );
                }
            );
        }

        // Room 2 intro dialogue (play once per full game run)
        if (roomName === "room2" && !this.puzzleStates.room2.introPlayed) {

            this.puzzleStates.room2.introPlayed = true;

            // Lock movement during intro
            this.game.examining = true;

            this.dialogueBox.startSequence(
                [
                    "Brr, it is freezing in here!",
                    "[Tucked in at the furthest corner, was a figure huddled in a ball]",
                    "It that a... girl?",
                    "Oh god, shes not dead is she?",
                    "I should make sure she's okay."
                ],
                "./Sprites/UI/LilyPortrait.png",
                "Lily",
                () => {
                    this.game.examining = false;
                }
            );
        }
        if (roomName === "room3" && !this.roomIntroPlayed.room3) {

            this.roomIntroPlayed.room3 = true;
            this.game.examining = true;

            this.dialogueBox.startSequence(
                [
                    { speaker: "Lily", text: "What the…" },
                    { speaker: "", text: "[Upon entering the room, Lily sees two figures within dilapidated cells that faced opposite of one another]" },
                    { speaker: "Lily", text: "Oh my god, are you guys okay?!" },
                    { speaker: "Victor", text: "A survivor? You made it through the other rooms!" },
                    { speaker: "Victor", text: "We've been trying to find a way out, but we're stuck. I’m Victor. That guy over there is Jin." },
                    { speaker: "Jin", text: "Hey, it is good to see another survivor." },
                    // { speaker: "Lily", text: "I am glad to see I am not alone in this house… But how do we get out of this room?" },
                    //{ speaker: "Victor", text: "Through the medallion door. Here, I managed to find one before the killer locked us up." },
                    { speaker: "Lily", text: "Hi... How do I get you guys out?" },
                    { speaker: "Victor", text: "Don’t worry about us. You should just focus on trying to get out of this room." },
                    { speaker: "Lily", text: "Okay..." }
                ],
                null,
                null,
                () => {
                    this.game.examining = false;
                }
            );
        }

        if (roomName === "room4" && !this.roomIntroPlayed.room4) {

            this.roomIntroPlayed.room4 = true;
            this.game.examining = true;

            this.dialogueBox.startSequence(
                [
                    { speaker: "Lily", text: "... Huh?" },
                    { speaker: "Lily", text: "Why do I feel uneasy all of a sudden?" }
                ],
                "./Sprites/UI/LilyPortrait.png",
                null,
                () => {
                    this.game.examining = false;
                }
            );
        }

        if (roomName === "room5" && !this.roomIntroPlayed.room5) {

            this.roomIntroPlayed.room5 = true;

            this.room5IntroFinished = false;
            this.room5KillerSpawned = false;
            this.room5KillerTimer = 0;

            this.game.examining = true;

            this.dialogueBox.startSequence(
                [
                    { speaker: "Shiannel", text: "Hurry, don't let him get in! Go to the right of the bookshelf and press 'E' three times to block the doorway!" }
                ],
                "./Sprites/UI/ShiannelPortrait.png",
                null,
                () => {
                    this.game.examining = false;

                    this.room5IntroFinished = true;
                }
            );

            if (this.puzzleStates.room5) {
                this.puzzleStates.room5.bookshelfClosed = false;
            }
        }
    }

    // Inventory helpers
    addToInventory(itemName, spritePath) {
        this.inventory.push({ name: itemName, sprite: spritePath, used: false });
    }

    removeFromInventory(itemName) {
        this.inventory = this.inventory.filter(i => i.name !== itemName);
    }

    markItemAsUsed(itemName) {
        const item = this.inventory.find(i => i.name === itemName);
        if (item) item.used = true;
    }

    hasItem(itemName) {
        const item = this.inventory.find(i => i.name === itemName);
        return item && !item.used;
    }

    getItem(itemName) {
        return this.inventory.find(i => i.name === itemName);
    }

    // Added: map internal npc keys to display names
    getNPCDisplayName(npcName) {
        const map = {
            shiannel: "Shiannel",
            victor: "Victor",
            jin: "Jin"
        };
        return map[npcName] || "";
    }

    // NPC DIALOGUE (start-only)
    // DialogueBox handles advancing lines via E while active.
    startNPCDialogue(npcName, dialogueLines) {
        if (!Array.isArray(dialogueLines) || dialogueLines.length === 0) return;
        const displayName = this.getNPCDisplayName(npcName);

        // Mark met (optional)
        const npc = this.npcStates[npcName];
        if (npc) npc.met = true;

        this.game.examining = true;
        this.dialogueBox.startSequence(dialogueLines, null, displayName, () => {
            this.game.examining = false;
        });
    }
    // Basic distance check
    isNear(x, y, range = 90) {
        const dx = (this.lily.x - x);
        const dy = (this.lily.y - y);
        return (dx * dx + dy * dy) <= (range * range);
    }

    tryStartRoom5PostTalkSequence() {
        const r5 = this.puzzleStates.room5;
        if (!r5) return;

        // blocks re-playing
        if (r5.postTalkSequencePlayed) return;

        // runs after 3 dialogues
        if (!(r5.talkedToShiannel && r5.talkedToVictor && r5.talkedToJin)) return;

        r5.postTalkSequencePlayed = true;

        this.game.examining = true;

        this.dialogueBox.startSequence(
            [
                { speaker: "Lily", text: "Thanks, guys!" },
                { speaker: "Lily", text: "Is this... the exit door? Did we actually make it?" },
                { speaker: "Shiannel", text: "Yes... let's get you home." },
                { speaker: "Lily", text: "Me?" }
            ],
            null,
            null,
            () => {
                this.revealRoom5GhostsAndFinalDialogue();
            }
        );
    }

    revealRoom5GhostsAndFinalDialogue() {
        const r5 = this.puzzleStates.room5;
        if (!r5 || r5.ghostRevealPlayed) return;
        r5.ghostRevealPlayed = true;

        // Remove room5 talk prompts immediately
        if (this.room5ShiannelPrompt) { this.room5ShiannelPrompt.removeFromWorld = true; this.room5ShiannelPrompt = null; }
        if (this.room5VictorPrompt) { this.room5VictorPrompt.removeFromWorld = true; this.room5VictorPrompt = null; }
        if (this.room5JinPrompt) { this.room5JinPrompt.removeFromWorld = true; this.room5JinPrompt = null; }

        // Find original NPC entities
        const shi = this.game.entities.find(e => e instanceof Shiannel);
        const vic = this.game.entities.find(e => e instanceof Victor);
        const jin = this.game.entities.find(e => e instanceof Jin);

        // Cache positions (fallback to stored positions if entity not found)
        const shiX = shi ? shi.x : this.room5ShiannelPos.x;
        const shiY = shi ? shi.y : this.room5ShiannelPos.y;

        const vicX = vic ? vic.x : this.room5VictorPos.x;
        const vicY = vic ? vic.y : this.room5VictorPos.y;

        const jinX = jin ? jin.x : this.room5JinPos.x;
        const jinY = jin ? jin.y : this.room5JinPos.y;

        // Remove original NPCs from world
        if (shi) shi.removeFromWorld = true;
        if (vic) vic.removeFromWorld = true;
        if (jin) jin.removeFromWorld = true;

        SOUND_MANAGER.play("./SFX/Room5/whoosh.mp3", this.game);

        //ghost frames
        const ghostCfg = {
            frames: 2,
            startX: 0,
            startY: 0,
            frameWidth: 284,
            frameHeight: 380,
            frameDuration: 0.5,
            scale: 0.4
        };

        this.game.addEntity(
            new GhostNPC(this.game, shiX, shiY, "./Sprites/Room5/Ghost_ShiannelSpreadSheet.png", {
                frames: 2, startX: 0, startY: 0, frameWidth: 345,
                frameHeight: 390, frameDuration: 0.5, scale: 0.4
            })
        );

        this.game.addEntity(
            new GhostNPC(this.game, vicX, vicY, "./Sprites/Room5/Ghost_VictorSpreadSheet.png", ghostCfg)
        );

        this.game.addEntity(
            new GhostNPC(this.game, jinX, jinY, "./Sprites/Room5/Ghost_JinSpreadSheet.png", ghostCfg)
        );

        // Lock player while final dialogue plays
        this.game.examining = true;

        this.dialogueBox.startSequence(
            [
                { speaker: "Lily", text: "!?!" },
                { speaker: "Lily", text: "What the... You guys are..." },
                { speaker: "Ghost Victor", text: "We are ghosts." },
                { speaker: "Ghost Jin", text: "We were survivors like you..." },
                { speaker: "Ghost Victor", text: "That's why we strive to help any new survivors he brings here." },
                { speaker: "Lily", text: "But... h-how? You all looked real, looked alive..." },
                { speaker: "Ghost Shiannel", text: "I'm sorry we lied to you..." },
                { speaker: "Lily", text: "I... I don't want to leave you guys." },
                { speaker: "Ghost Victor", text: "You must... Who else is going to help if he brings more survivors?" },
                { speaker: "Lily", text: "..." },
                { speaker: "Lily", text: "I'm going to put an end to this..." },
                { speaker: "Lily", text: "Thank you... for helping me. I will make sure you can finally rest." }
            ],
            null,
            null,
            () => { this.game.examining = false; }
        );
    }

    update() {

        const inventoryOpen = this.game.entities.some(e => e instanceof InventoryUI);
        // Inventory toggle
        if (!inventoryOpen) {
            if (this.game.I && !this.wasIPressed && !this.game.examining) {
                this.game.addEntity(new InventoryUI(this.game));
                this.game.examining = true;
                this.wasIPressed = true;
            } else if (!this.game.I) {
                this.wasIPressed = false;
            }
        }

        // Dialogue carryover block
        if (!this.dialogueBox.active && this.wasDialogueActive) {
            this.game.E = false;
            this.wasEPressed = false;
        }
        this.wasDialogueActive = this.dialogueBox.active;

        // Dialogue is open, skips all
        if (this.dialogueBox.active) {
            this.wasEPressed = !!this.game.E;
            return;
        }

        // ===== NPC talk trigger (start-only). Trigger once per key press. =====
        if (this.game.E && !this.wasEPressed && !this.dialogueBox.active) {
            let triggeredNPC = false;

            // ROOM 2: Shiannel
            if (this.currentRoom === "room2") {
                if (this.isNear(this.shiannelPos.x, this.shiannelPos.y, 120)) {

                    if (this.shiannelPrompt) {
                        this.shiannelPrompt.removeFromWorld = true;
                        this.shiannelPrompt = null;
                    }

                    const shi = this.npcStates.shiannel;

                    // stage control
                    if (this.puzzleStates.room2.lockBroken) {
                        shi.stage = 2;
                    } else if (this.puzzleStates.room2.pipeObtained && shi.stage === 1) {
                        shi.stage = 1; // keep at 1 but serve different dialogue below
                    }

                    // Consume E immediately so it does not retrigger
                    this.game.E = false;

                    try {
                        this.game.examining = true;

                        const shiannelEntity = this.game.entities.find(e => e instanceof Shiannel);

                        if (shi.stage === 0) {

    const dialogue = Shiannel.getDialogue(0);

    this.dialogueBox.startSequence(dialogue.intro, null, null, () => {

        if (shiannelEntity) shiannelEntity.pose = "idle";

        this.dialogueBox.startSequence(dialogue.main, null, null, () => {

            shi.stage = 1;
            shi.met = true;

            SOUND_MANAGER.play("./SFX/Room2/ClairDeLuneMuffled.mp3", this.game);

            this.game.examining = false;
        });

    });

} else {

                            this.dialogueBox.startSequence(
                                Shiannel.getDialogue(shi.stage),
                                "./Sprites/UI/ShiannelPortrait.png",
                                null,
                                () => {
                                    shi.met = true;
                                    this.game.examining = false;
                                    // if this was the goodbye dialogue, mark it done
                                    if (shi.stage === 2) {
                                        this.puzzleStates.room2.saidGoodbyeToShiannel = true;
                                    }
                                }
                            );
                        }

                    } catch (err) {
                        console.error("Shiannel dialogue error:", err);
                        this.game.examining = false;
                        this.dialogueBox.close();
                    }
                }
            }

            // ROOM 3: Victor / Jin
            if (this.currentRoom === "room3") {
                const victorState = this.npcStates.victor;
                const jinState = this.npcStates.jin;
                const r3 = this.puzzleStates.room3;

                // Victor
                if (this.victorPos && this.isNear(this.victorPos.x, this.victorPos.y, 220) && victorState.stage < 2) {

                    if (this.victorPrompt) {
                        this.victorPrompt.removeFromWorld = true;
                        this.victorPrompt = null;
                    }

                    this.game.E = false;
                    this.game.examining = true;

                    // Stage logic based on candle interaction and codex status
                    if (r3.talkedAboutCandles && !r3.hasCandleCodex && victorState.stage === 0) {
                        victorState.stage = 1;
                    }

                    if (r3.hasCandleCodex && victorState.stage < 2) {
                        victorState.stage = 2;
                    }

                    this.dialogueBox.startSequence(
                        Victor.getDialogue(victorState.stage),
                        "./Sprites/UI/VictorPortrait.png",
                        "Victor",
                        () => {
                            victorState.met = true;
                            this.game.examining = false;

                            // After stage 2 dialogue, reveal the medallion
                            if (victorState.stage === 2) {
                                const victor = this.game.entities.find(e => e instanceof Victor);
                                if (victor) victor.medallionTaken = false;
                                SOUND_MANAGER.play("./SFX/Room3/MedallionDrop.mp3", this.game);
                            }
                        }
                    );

                    triggeredNPC = true;
                }

                // Jin
                else if (this.isNear(this.jinPos.x, this.jinPos.y, 120) && !r3.codexDropped) {

                    if (this.jinPrompt) {
                        this.jinPrompt.removeFromWorld = true;
                        this.jinPrompt = null;
                    }

                    this.game.E = false;
                    this.game.examining = true;

                    // switch Jin to codex dialogue (stage 1)
                    if (r3.talkedAboutCandles && !r3.hasCandleCodex && jinState.stage === 0) {
                        jinState.stage = 1;
                    }

                    this.dialogueBox.startSequence(
                        Jin.getDialogue(jinState.stage),
                        "./Sprites/UI/JinPortrait.png",
                        "Jin",
                        () => {
                            // Give codex once after stage 1 dialogue (renewed)
                            if (jinState.stage === 1 && !r3.codexDropped) {
                                r3.codexDropped = true;
                                jinState.stage = 2;
                                SOUND_MANAGER.play("./SFX/Room1/PaperRustling.mp3", this.game);
                            }
                            jinState.met = true;
                            this.game.examining = false;
                        }
                    );

                    triggeredNPC = true;
                }
            }
            // ROOM 5: Shiannel / Victor / Jin
            if (this.currentRoom === "room5") {
                const r5 = this.puzzleStates.room5;
                // Shiannel
                if (this.isNear(this.room5ShiannelPos.x, this.room5ShiannelPos.y, 120)) {
                    this.game.E = false;
                    this.game.examining = true;
                    if (!r5.ghostRevealPlayed) {
                    this.dialogueBox.startSequence(
                        [
                            { speaker: "Shiannel", text: "You did it, Lily!" },
                            { speaker: "Shiannel", text: "We're so happy you made it!" }
                        ],
                        null,
                        "Shiannel",
                        () => {
                            this.npcStates.shiannel.met = true;
                            this.game.examining = false;

                            this.puzzleStates.room5.talkedToShiannel = true;
                            this.tryStartRoom5PostTalkSequence();
                        }
                    );

                    triggeredNPC = true;
                } else {
                    this.dialogueBox.startSequence(
                        [
                            { speaker: "Ghost Shiannel", text: "You did it, Lily!" },
                            { speaker: "Ghost Shiannel", text: "We're so happy you made it!" }
                        ],
                        null,
                        "Ghost Shiannel",
                        () => {
                            this.game.examining = false;
                        }
                    );
                }
                }

                // Victor (use actual entity position, better from left side)
                else {
                    if (this.isNear(this.room5VictorPos.x - 40, this.room5VictorPos.y + 20, 150)) {
                        this.game.E = false;
                        this.game.examining = true;
                        if (!r5.ghostRevealPlayed) {
                        this.dialogueBox.startSequence(
                            [
                                { speaker: "Victor", text: "I'm impressed... Well done... Well done..."}
                            ],
                            null,
                            "Victor",
                            () => {
                                this.npcStates.victor.met = true;
                                this.game.examining = false;

                                this.puzzleStates.room5.talkedToVictor = true;
                                this.tryStartRoom5PostTalkSequence();
                            }
                        );

                        triggeredNPC = true;
                    } else {
                        this.dialogueBox.startSequence(
                            [
                                { speaker: "Ghost Victor", text: "I'm impressed... Well done... Well done..."}
                            ],
                            null,
                            "Ghost Victor",
                            () => {
                                this.game.examining = false;
                            }
                        );
                    }
                    }

                    // Jin (only check if Victor did NOT trigger)
                    else if (this.isNear(this.room5JinPos.x - 60, this.room5JinPos.y, 120)) {
                        this.game.E = false;
                        this.game.examining = true;
                        if (!r5.ghostRevealPlayed) {
                        this.dialogueBox.startSequence(
                            [
                                { speaker: "Jin", text: "You solved the puzzles like a pro! You were much quicker than we were!" }
                            ],
                            null,
                            "Jin",
                            () => {
                                this.npcStates.jin.met = true;
                                this.game.examining = false;

                                this.puzzleStates.room5.talkedToJin = true;
                                this.tryStartRoom5PostTalkSequence();
                            }
                        );

                        triggeredNPC = true;
                    } else {
                        this.dialogueBox.startSequence(
                            [
                                { speaker: "Ghost Jin", text: "You solved the puzzles like a pro! You were much quicker than we were!" }
                            ],
                            null,
                            "Ghost Jin",
                            () => {
                                this.game.examining = false;
                            }
                        );
                    }
                    }
                }
            }
            if (triggeredNPC) this.game.E = false;
        }

        if (this.game.E) {
            this.wasEPressed = true; // mark E as handled this press
        } else {
            this.wasEPressed = false; // E was released, reset
        }

        //Prompt updates

        // Room2 Shiannel prompt
        if (!this.dialogueBox.active && this.currentRoom === "room2") {
            const nearShiannel = this.isNear(this.shiannelPos.x, this.shiannelPos.y, 120);

            if (nearShiannel) {
                if (!this.shiannelPrompt) {
                    this.shiannelPrompt = new TalkPrompt(
                        this.game,
                        this.shiannelPos.x + 163,
                        this.shiannelPos.y - 40,
                        "E to Talk"
                    );
                    this.game.addEntity(this.shiannelPrompt);
                }
            } else {
                if (this.shiannelPrompt) {
                    this.shiannelPrompt.removeFromWorld = true;
                    this.shiannelPrompt = null;
                }
            }
        } else {
            if (this.shiannelPrompt) {
                this.shiannelPrompt.removeFromWorld = true;
                this.shiannelPrompt = null;
            }
        }

        // Room3 Victor/Jin prompts
if (!this.dialogueBox.active && this.currentRoom === "room3") {

    const r3 = this.puzzleStates.room3;

    const nearVictor = this.isNear(this.victorPos.x, this.victorPos.y, 220) && this.npcStates.victor.stage < 2;
    const nearJin = this.isNear(this.jinPos.x, this.jinPos.y, 120) && !r3.codexDropped;

    // Victor prompt
    if (nearVictor) {
        if (!this.victorPrompt) {
            this.victorPrompt = new TalkPrompt(
                this.game,
                this.victorPos.x + 55,
                this.victorPos.y - 20,
                "E to Talk"
            );
            this.game.addEntity(this.victorPrompt);
        }
    } else {
        if (this.victorPrompt) {
            this.victorPrompt.removeFromWorld = true;
            this.victorPrompt = null;
        }
    }

    // Jin prompt
    if (nearJin) {
        if (!this.jinPrompt) {
            this.jinPrompt = new TalkPrompt(
                this.game,
                this.jinPos.x + 55,
                this.jinPos.y - 20,
                "E to Talk"
            );
            this.game.addEntity(this.jinPrompt);
        }
    } else {
        if (this.jinPrompt) {
            this.jinPrompt.removeFromWorld = true;
            this.jinPrompt = null;
        }
    }

    // Codex prompt
    const codexExists = r3.codexDropped && !r3.codexPickedUp && r3.codexPos;

    if (codexExists) {
        const nearCodex = this.isNear(r3.codexPos.x, r3.codexPos.y, 120);

        if (nearCodex) {
            if (!this.codexPrompt) {
                this.codexPrompt = new TalkPrompt(
                    this.game,
                    r3.codexPos.x + 20,
                    r3.codexPos.y - 25,
                    "Press E to take"
                );
                this.game.addEntity(this.codexPrompt);
            }
        } else {
            if (this.codexPrompt) {
                this.codexPrompt.removeFromWorld = true;
                this.codexPrompt = null;
            }
        }
    } else {
        if (this.codexPrompt) {
            this.codexPrompt.removeFromWorld = true;
            this.codexPrompt = null;
        }
    }
}
        else {
            // Not in room3, remove all room3 prompts
            if (this.victorPrompt) {
                this.victorPrompt.removeFromWorld = true;
                this.victorPrompt = null;
            }
            if (this.jinPrompt) {
                this.jinPrompt.removeFromWorld = true;
                this.jinPrompt = null;
            }
            if (this.codexPrompt) {
                this.codexPrompt.removeFromWorld = true;
                this.codexPrompt = null;

            }
        }
        //Room5 NPC Talk Prompts
        if (!this.dialogueBox.active && this.currentRoom === "room5") {

            const nearShi = this.isNear(this.room5ShiannelPos.x, this.room5ShiannelPos.y, 120);
            const nearVic = this.isNear(this.room5VictorPos.x - 60, this.room5VictorPos.y, 150);
            const nearJin = this.isNear(this.room5JinPos.x - 60, this.room5JinPos.y, 120);

            // Shiannel
            if (nearShi) {
                if (!this.room5ShiannelPrompt) {
                    this.room5ShiannelPrompt = new TalkPrompt(
                        this.game,
                        this.room5ShiannelPos.x + 55,
                        this.room5ShiannelPos.y - 20,
                        "E to Talk"
                    );
                    this.game.addEntity(this.room5ShiannelPrompt);
                }
            } else if (this.room5ShiannelPrompt) {
                this.room5ShiannelPrompt.removeFromWorld = true;
                this.room5ShiannelPrompt = null;
            }

            // Victor
            if (nearVic) {
                if (!this.room5VictorPrompt) {
                    this.room5VictorPrompt = new TalkPrompt(
                        this.game,
                        this.room5VictorPos.x + 55,
                        this.room5VictorPos.y - 20,
                        "E to Talk"
                    );
                    this.game.addEntity(this.room5VictorPrompt);
                }
            } else if (this.room5VictorPrompt) {
                this.room5VictorPrompt.removeFromWorld = true;
                this.room5VictorPrompt = null;
            }

            // Jin
            if (nearJin) {
                if (!this.room5JinPrompt) {
                    this.room5JinPrompt = new TalkPrompt(
                        this.game,
                        this.room5JinPos.x + 55,
                        this.room5JinPos.y - 20,
                        "E to Talk"
                    );
                    this.game.addEntity(this.room5JinPrompt);
                }
            } else if (this.room5JinPrompt) {
                this.room5JinPrompt.removeFromWorld = true;
                this.room5JinPrompt = null;
            }

        } else {
            if (this.room5ShiannelPrompt) { this.room5ShiannelPrompt.removeFromWorld = true; this.room5ShiannelPrompt = null; }
            if (this.room5VictorPrompt) { this.room5VictorPrompt.removeFromWorld = true; this.room5VictorPrompt = null; }
            if (this.room5JinPrompt) { this.room5JinPrompt.removeFromWorld = true; this.room5JinPrompt = null; }
        }
        // Room 4 Killer Spawn Logic
        if (this.currentRoom === "room4" && !this.room4KillerSpawned) {
            this.room4KillerTimer += this.game.clockTick;


            if (this.room4KillerTimer >= this.room4KillerDelay) {
                const killer = new Killer(this.game, 50, 500, this.lily);
                this.game.addEntity(killer);
                this.room4KillerSpawned = true;
            }
        }

        // Room3 Codex Drop Spawn
        if (this.currentRoom === "room3") {

            const r3 = this.puzzleStates.room3;

            if (r3.codexDropped && !r3.codexPickedUp && !this.codexEntitySpawned) {

                // codex drop location
                const dropX = this.jinPos.x + 130;
                const dropY = this.jinPos.y + 140;

                // location save for prompt
                r3.codexPos = { x: dropX, y: dropY };

                const codex = new CodexPickup(this.game, dropX, dropY);
                this.game.entities.push(codex);
                this.codexEntitySpawned = true;
            }
        }
    }


    takeDamage() {
        if (this.health <= 0) return; // Already dead

        SOUND_MANAGER.play("./SFX/HeartDeplete.mp3", this.game);
        this.health--;

        if (this.health <= 0) {
            // Player died womp womp
            this.showDeathScreen();
        }
    }

    showDeathScreen() {
        // Stop all music
        if (this.roomBGM) {
            this.roomBGM.pause();
            this.roomBGM.currentTime = 0;
            this.roomBGM = null;
            this.roomBGMName = null;
        }

        // stops killer footsteps
        const killer = this.game.entities.find(e => e instanceof Killer);
        if (killer && killer.killerWalkAudio) {
            killer.killerWalkAudio.pause();
            killer.killerWalkAudio.currentTime = 0;
        }

        // stops lily footsteps
        if (this.lily && this.lily.walkLoopAudio) {
            this.lily.walkLoopAudio.pause();
            this.lily.walkLoopAudio.currentTime = 0;
            this.lily.isLooping = false;
            this.lily.wasMoving = false;
        }

        SOUND_MANAGER.play("./SFX/UIScreens/BloodSplatterDeathScreen.mp3", this.game);

        // play death music after 1 second of the blood splater
        setTimeout(() => {
            SOUND_MANAGER.play("./SFX/Room2/ClairDeLuneMuffled.mp3", this.game);
        }, 1000);

        this.clearEntities();

        // Show death screen
        this.game.addEntity(new DeathScreen(this.game));
    }

    showEndingScreen() {
        // Stop room BGM
        if (this.roomBGM) {
            this.roomBGM.pause();
            this.roomBGM.currentTime = 0;
            this.roomBGM = null;
            this.roomBGMName = null;
        }
        console.log("in showEndingScreen method")

        // music for ending screen
        SOUND_MANAGER.play("./SFX/UIScreens/WalkingOnGrass.mp3", this.game);

        setTimeout(() => {
            SOUND_MANAGER.play("./SFX/UIScreens/WinMusic2.mp3", this.game);
        }, 1200);

        // Clear entities and show ending
        this.clearEntities();
        this.game.addEntity(new EndingScreen(this.game));
    }

    clearEntities() {
        this.game.entities = [];
    }

    resetGame() {

        // Reset health
        this.health = 3;

        //reset debug (if player has debug mode on)
        this.game.debug = false;
        const debugCheckbox = document.getElementById("debugToggle");
        if (debugCheckbox) {
            debugCheckbox.checked = this.game.debug;
        }

        // Clear inventory
        this.inventory = [];

        // Reset all puzzle states
        this.puzzleStates = {
            room1: { door1Open: false, hasKey: false, bookUnlocked: false, paperTaken: false, codeEntered: false },
            room2: { door2Open: false, pipeObtained: false, lockBroken: false, lockPosition: null, introPlayed: false, saidGoodbyeToShiannel: false, nudgedToShiannel: false },
            room3: {
                snowflakeMedallion: false,
                candleMedallion: false,
                leafMedallion: false,
                hasCandleCodex: false,
                talkedAboutCandles: false,
                candlesArranged: false,
                candleOrder: ["yellow", "blue", "green", "purple", "pink"],
                medallionDoor: false,
                medallionSlots: [null, null, null],
                door3Open: false,
                codexDropped: false,
                codexPickedUp: false,
                codexPos: null,
                medallionDialoguePlayed: false,
            },
            room5: {
                bookshelfClosed: false,
                room5DialoguePlayed: false,
                talkedToShiannel: false,
                talkedToVictor: false,
                talkedToJin: false,
                postTalkSequencePlayed: false,
                ghostRevealPlayed: false
            }
        };

        // Reset NPC dialogue
        this.npcStates = {
            shiannel: { met: false, dialogueIndex: 0, stage: 0 },
            victor: { met: false, dialogueIndex: 0, stage: 0 },
            jin: { met: false, dialogueIndex: 0, stage: 0 }
        };


        // dialogue reset

        this.roomIntroPlayed = { room2: false, room3: false, room4: false, room5: false };

        this.lily = new Lily(this.game, 2000, 500);

        // Load Room 1
        this.loadRoom("room1", 220, 175); // this is lilys initial spawn point in room 1

    }
}