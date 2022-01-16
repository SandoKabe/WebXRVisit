import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial} from "@babylonjs/core";

import { Environment } from "./environment";
import { Interaction } from "./interaction";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

class App {
    // General Entire Application
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    //Scene - related
    private _state: number = 0;
    private _gamescene: Scene;
    private _cutScene: Scene;
    private _environment;
    private _interaction;

    constructor() {
        this._canvas = this._createCanvas();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        this._main();
    }

    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    private async _main(): Promise<void> {
        // ADD
        //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
        var finishedLoading = false;
        await this._setUpGame().then(res =>{
            finishedLoading = true;
        });

        await this._goToGame();

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.CUTSCENE:
                    this._scene.render();
                    break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.LOSE:
                    this._scene.render();
                    break;
                default: break;
            }
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
   
    private async _setUpGame() {
        let scene = new Scene(this._engine);
        this._gamescene = scene;
    
        //...load assets
         //--CREATE ENVIRONMENT--
         const environment = new Environment(scene);
         this._environment = environment;
         //Load environment and character assets
         await this._environment.load(); //environment

         // Add interaction
         const interaction = new Interaction(scene);
         this._interaction = interaction;

    }

    private async _goToGame(){
        //--SETUP SCENE--
        this._scene.detachControl();
        let scene = this._gamescene;
        await this._interaction.set();

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Create mesh attach to camera in order to collide with other collider.
        let cameraChildBox = MeshBuilder.CreateBox("camera child box", {}, scene);
        cameraChildBox.scaling = new Vector3(0.01, 0.01, 0.01);
      
        // Create box collider
        const wireMat = new StandardMaterial("wireMat", scene);
        wireMat.alpha = 0;
        wireMat.wireframe = true;

        const hitBox = MeshBuilder.CreateBox("carbox", {width: 10, height: 10, depth: -10});
        hitBox.material = wireMat;
        hitBox.position = new Vector3(1, 2.2, -3.6);

        // Add event trigger
        let paintDescription = scene.getNodeByName("MonaDesc") as Mesh;

        scene.onBeforeRenderObservable.add(() => {
                if (cameraChildBox) {
                    if (cameraChildBox.intersectsMesh(hitBox))
                        paintDescription.isVisible = true;
                    else 
                        paintDescription.isVisible = false;
            
                }
        });

        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        //get rid of start scene, switch to gamescene and change states
        cameraChildBox.parent = scene.getNodeByName("Camera04"); //scene.activeCamera
        cameraChildBox.position = new Vector3(0,0,0);
        
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;

        //the game is ready, attach control back
        this._scene.attachControl();
    }

}
new App();