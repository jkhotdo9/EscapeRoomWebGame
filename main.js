const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// Queue only image assets

// general assets
ASSET_MANAGER.queueDownload("./Sprites/Room1/lockedDORE.png"); //same asset used for each room, do i need to queue multiple then?
ASSET_MANAGER.queueDownload("./Sprites/Room1/openDORE.png"); //same asset used for each room, do i need to queue multiple then?

// UI Hearts and Portraits
ASSET_MANAGER.queueDownload("./Sprites/UI/Heart.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/EmptyHeart.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/FrostyHeart.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/FrostyHeartEmpty.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/Inventory.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/LilyPortrait.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/ShiannelPortrait.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/VictorPortrait.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/JinPortrait.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/ShiannelGhostPortrait.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/VictorGhostPortrait.png");
ASSET_MANAGER.queueDownload("./Sprites/UI/JinGhostPortrait.png");

// room 1
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png");
ASSET_MANAGER.queueDownload("./Sprites/LilySpriteSheet2_0.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantRoomBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Bed.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Plant2.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster1.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster2.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/PlantCluster3.png");
// interactive objects

// rose painting
ASSET_MANAGER.queueDownload("./Sprites/Room1/RosePaintingWithKey.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/RosePaintingNoKey.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/RosePaintingZoom.png");
// bookshelf
ASSET_MANAGER.queueDownload("./Sprites/Room1/DiamondKey.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/BookshelfWithBook.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/BookshelfWithOpenBook.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/LockedDiamondBook.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/OpenDiamondBook.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/067Codex.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Room1Note.png");
// keypad
ASSET_MANAGER.queueDownload("./Sprites/Room1/pixelPinpadWhite.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/pixelPinpadRed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/pixelPinpadGreen.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/KeypadZoomBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/DigitSpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button0Normal.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button0Pressed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button2Normal.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button2Pressed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button3Normal.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button3Pressed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button6Normal.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button6Pressed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button7Normal.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button7Pressed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button9Normal.png");
ASSET_MANAGER.queueDownload("./Sprites/Room1/Button9Pressed.png");


// room 2

// frames
ASSET_MANAGER.queueDownload("./Sprites/Room2/CatFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/DogFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/FlowerFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/HouseFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/IslandFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/PepeFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/SkeletonFrame.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/MusicNoteFrameClosed.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/MusicNoteFrameOpen.png");

// frozen lock
ASSET_MANAGER.queueDownload("./Sprites/Room2/pixelFrozenLock2.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/pixelBrokenFrozenLock.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/FrozenLock.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/BrokenLock.png");

ASSET_MANAGER.queueDownload("./Sprites/Room2/TheGalleryBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/LilRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/OldCouchSide.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/Shiannel_SpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/Room2InvisWall.png");
ASSET_MANAGER.queueDownload("./Sprites/Room2/longredrug.png");

// pipe
ASSET_MANAGER.queueDownload("./Sprites/Room2/Pipe.png");


// room 3

ASSET_MANAGER.queueDownload("./Sprites/Room3/PinkCandle.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/PurpleCandle.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/BlueCandle.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/GreenCandle.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/YellowCandle.png");

ASSET_MANAGER.queueDownload("./Sprites/Room3/PigHead_Medallion.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/PigHeadEmptyMouth.png");

ASSET_MANAGER.queueDownload("./Sprites/Room3/SnowflakeMedallion.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/LeafMedallion.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/CandleMedallion.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/Codex.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/Room3Codex.png");

ASSET_MANAGER.queueDownload("./Sprites/Room3/TheCellsBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/TableWithBlood.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideToilet.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/LilStool.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/Alive_VictorSpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/Alive_JinSpriteSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/BlankMedallionDoor.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/OpenMedallionDoor.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/CompletedMedallionDoor.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/zoomedInCandleTable.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/zoomedInMedallionDoor.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/BarLeft.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/BarRight.png");

ASSET_MANAGER.queueDownload("./Sprites/Room3/ClusterCandles.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/ClusterCandles.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/ClusterCandles.png");
ASSET_MANAGER.queueDownload("./Sprites/Room3/ClusterCandles.png");


// room 4
ASSET_MANAGER.queueDownload("./Sprites/Room4/Killer_Spritesheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room4/LibraryBackground.png");
ASSET_MANAGER.queueDownload("./Sprites/Room4/TopHalfOfBookShelf.png");

// room 5
ASSET_MANAGER.queueDownload("./Sprites/Room5/FinalRoom.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png")
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/Bookshelf.png")
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideOfBookshelf.png")
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/SideOfBookshelf.png")
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BigRedRug.png");
ASSET_MANAGER.queueDownload("./Sprites/FillerFurniture/BackOfBookshelf.png");

ASSET_MANAGER.queueDownload("./Sprites/Room5/FinalDoorLocked.png");
ASSET_MANAGER.queueDownload("./Sprites/Room5/FinalDoorOpen.png");

ASSET_MANAGER.queueDownload("./Sprites/Room5/Ghost_ShiannelSpreadSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room5/Ghost_VictorSpreadSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Room5/Ghost_JinSpreadSheet.png");


//title screens
ASSET_MANAGER.queueDownload("./Sprites/Start/TitleScreen.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/LightningSheet.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Jin_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Lily_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Shiannel_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/Victor_start.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/StartSign.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/ControlsSign.png");
ASSET_MANAGER.queueDownload("./Sprites/Start/SelectorSign.png");
ASSET_MANAGER.queueDownload("./Sprites/EndGameScreens/DeathScreen.png");
ASSET_MANAGER.queueDownload("./Sprites/EndGameScreens/EscapedScreen.png");
ASSET_MANAGER.queueDownload("./Sprites/EndGameScreens/MainMenuButton.png");
ASSET_MANAGER.queueDownload("./Sprites/EndGameScreens/PlayAgainButton.png");



// SFX (which is managed outside of AssetManager --> inside SoundManager duhh)

// General SFX
SOUND_MANAGER.load("./SFX/OpeningDoor.mp3");
SOUND_MANAGER.load("./SFX/HeartDeplete.mp3");

// TODO: walking sounds on wooden floor 
SOUND_MANAGER.load("./SFX/WalkingOnWood1.mp3");
SOUND_MANAGER.load("./SFX/KillerWalk2.mp3");
SOUND_MANAGER.load("./SFX/KillerWalk22.mp3");

// Room 1
SOUND_MANAGER.load("./SFX/Room1/WomanScream.mp3", 0.4);
SOUND_MANAGER.load("./SFX/Room1/KeyOnPainting.mp3", 0.8);
SOUND_MANAGER.load("./SFX/Room1/BookOpening.mp3", 0.8);
SOUND_MANAGER.load("./SFX/Room1/KeyUnlock.mp3");
SOUND_MANAGER.load("./SFX/Room1/PaperRustling.mp3", 0.8);
SOUND_MANAGER.load("./SFX/Room1/KeypadButtonBeep.mp3");
SOUND_MANAGER.load("./SFX/Room1/RightCode.mp3");
SOUND_MANAGER.load("./SFX/Room1/WrongCode.mp3");

// Room 2
SOUND_MANAGER.load("./SFX/Room2/BitterColdWind.mp3", 0.2);
SOUND_MANAGER.load("./SFX/Room2/LockedPaintings.mp3");
SOUND_MANAGER.load("./SFX/Room2/OpeningClassicalPainting.mp3");
SOUND_MANAGER.load("./SFX/Room2/PickingUpMetalPipe.mp3");
SOUND_MANAGER.load("./SFX/Room2/FrozenLockBreaking.mp3");
SOUND_MANAGER.load("./SFX/Room2/ClairDeLuneMuffled.mp3"); // the classical music 

// Room 3
SOUND_MANAGER.load("./SFX/Room3/DraggingCandles.mp3");
SOUND_MANAGER.load("./SFX/Room3/MedallionDrop.mp3");
SOUND_MANAGER.load("./SFX/Room3/PickUpCoin.mp3");
SOUND_MANAGER.load("./SFX/Room3/PigheadGuts.mp3");
SOUND_MANAGER.load("./SFX/Room3/PlacingMedallionInSlot.mp3");

// Room 4


// Room 5
SOUND_MANAGER.load("./SFX/Room5/BookshelfSliding.mp3");
SOUND_MANAGER.load("./SFX/Room5/whoosh.mp3");


// UI SCREENS (win, lose)
// You Escaped
SOUND_MANAGER.load("./SFX/UIScreens/WinMusic2.mp3");
SOUND_MANAGER.load("./SFX/UIScreens/WalkingOnGrass.mp3");

// You Died
SOUND_MANAGER.load("./SFX/UIScreens/BloodSplatterDeathScreen.mp3");

// Character 8 bit voices
// voices 
SOUND_MANAGER.load("./SFX/CharacterVoices/lily.mp3");
SOUND_MANAGER.load("./SFX/CharacterVoices/shiannel.mp3");
SOUND_MANAGER.load("./SFX/CharacterVoices/victor.mp3");
SOUND_MANAGER.load("./SFX/CharacterVoices/jin.mp3");



ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    gameEngine.init(ctx);
    const sceneManager = new SceneManager(gameEngine);
    gameEngine.sceneManager = sceneManager;

    // BGM setup (managed outside AssetManager)
    const BGM_PATH = "./bgm/House of Souls Intro.mp3";
    const introAudio = new Audio(BGM_PATH);
    introAudio.loop = true;
    introAudio.volume = 0.65;
    introAudio.preload = "auto";

    // Attach to gameEngine for global access
    gameEngine.introAudio = introAudio;

    let bgmStarted = false;

    // Start music inside a user interaction event due to browser autoplay policies
    const startBGMOnce = () => {
        if (bgmStarted) return;

        introAudio.muted = false;
        introAudio.volume = 0.65;

        const playPromise = introAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                bgmStarted = true;
                console.log("BGM started successfully.");
            }).catch(error => {
                console.log("BGM play blocked:", error);
            });
        }
    };

    // Start BGM on first canvas click
    canvas.addEventListener("click", startBGMOnce, { once: true });
    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") startBGMOnce();
    }, { once: true });

    //volume, debug, mute part
    const debugToggle = document.getElementById("debugToggle");
    const muteBtn = document.getElementById("muteBtn");
    const musicSlider = document.getElementById("volumeSlider");
    const sfxSlider = document.getElementById("sfxSlider");

    debugToggle.addEventListener("change", () => {
        gameEngine.debug = debugToggle.checked;
    });

    muteBtn.addEventListener("click", () => {
        gameEngine.muted = !gameEngine.muted;

        // Apply to intro audio
        if (gameEngine.introAudio) gameEngine.introAudio.muted = gameEngine.muted;

        // Apply to room BGM (if it exists)
        if (gameEngine.sceneManager && gameEngine.sceneManager.roomBGM) {
            gameEngine.sceneManager.roomBGM.muted = gameEngine.muted;
        }

        muteBtn.textContent = gameEngine.muted ? "Unmute" : "Mute";
    });

    sfxSlider.addEventListener("input", () => {
        gameEngine.sfxVolume = Number(sfxSlider.value);
    });

    musicSlider.addEventListener("input", () => {
        gameEngine.musicVolume = Number(musicSlider.value);

        // Apply to intro audio
        if (gameEngine.introAudio) gameEngine.introAudio.volume = gameEngine.musicVolume;

        // Apply to room BGM (if it exists)
        if (gameEngine.sceneManager && gameEngine.sceneManager.roomBGM) {
            gameEngine.sceneManager.roomBGM.volume = gameEngine.musicVolume;
        }
    });

    gameEngine.addEntity(new StartSplashScreen(gameEngine));
    gameEngine.start();
});