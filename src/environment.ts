import { Scene, Mesh, Vector3, Color3, SceneLoader, PBRMetallicRoughnessMaterial, GizmoManager, PointerEventTypes, UtilityLayerRenderer, WebXRDefaultExperience } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    // XR property
    private _xr: WebXRDefaultExperience;
    private scalePainting = []; 
    private positionPainting = [];
    

    constructor(scene: Scene) {
        this._scene = scene;

        this.scalePainting.push(new Vector3(0.25, 0.25, 0.25));
        this.positionPainting.push(new Vector3(-0.3, 2.2, -3.6));

    }

    //What we do once the environment assets have been imported
    //handles setting the necessary flags for collision and trigger meshes,
    //sets up the painting objects
    public async load() {
    
        const assets = await this._loadAsset();
    }


    //Load all necessary meshes for the environment
    public async _loadAsset() {
        //loads game environment

        let _this = this;

        SceneLoader.Append("https://www.babylonjs.com/Scenes/Espilit/", "Espilit.babylon", this._scene, async function (result) {
           let xr = await result.createDefaultXRExperienceAsync({floorMeshes: [result.getMeshByName("Sols")]});

           _this._xr = xr;

           // Décaler le foreach après la gestion des load items pour set Item
           let env = result.meshes[0];
           let allMeshes = result.meshes;//.getChildMeshes();

            //loads painting mesh
            const res = await SceneLoader.ImportMeshAsync("", "./models/mona_lisa_painting/", "scene.gltf", result);

            //extract the actual painting mesh from the root of the mesh that's imported, dispose of the root
            let mona = res.meshes[0].getChildren()[0] as Mesh;
            mona.name = "Mona";

            _this._setItems({
                env: env,
                allMeshes: allMeshes,
                mona: mona as Mesh,
            });

        });
    }
    

   public _setItems(assets: { env: import("@babylonjs/core").AbstractMesh; allMeshes: any[]; mona: Mesh;}) 
    {
        //Loop through all environment meshes that were imported
        assets.allMeshes.forEach(m => {

            if (m.name == "T30" || m.name == "T33"){

                m.isVisible = false;

            }

        });

        // Setting painting
        assets.mona.parent = null;
        assets.mona.name = "Mona";
        assets.mona.isVisible = false;
        assets.mona.scaling = this.scalePainting[0];
        assets.mona.position = this.positionPainting[0];

        // Restrict Gizmo to only Painting
        let utilLayer = new UtilityLayerRenderer(this._scene);
        let gizmoManager = new GizmoManager(this._scene, 1, utilLayer, utilLayer);
        gizmoManager.attachableMeshes = [assets.mona];
        gizmoManager.attachToMesh(assets.mona);
        gizmoManager.usePointerToAttachGizmos = true;
        gizmoManager.boundingBoxGizmoEnabled = true;

        let enabled = false;

        this._scene.onPointerObservable.add((eventData) => {
            if (eventData.type === PointerEventTypes.POINTERDOUBLETAP) {
                if (!enabled) {
                    gizmoManager.positionGizmoEnabled = false;
                    gizmoManager.rotationGizmoEnabled = false;
                    gizmoManager.scaleGizmoEnabled = false;
                    gizmoManager.boundingBoxGizmoEnabled = false;
                    enabled = true;
                } else {
                    enabled = false;
                }
            } 
            
        });

        // Instead of motion controllers, use xr events.
        // This is enabled for Hololens and other non-gamepad-enabled contexts. 
        const onSqueeze = (event) => {
            if (event.inputSource.handedness === 'right') {
                if (!enabled) {
                    gizmoManager.boundingBoxGizmoEnabled = false;
                    enabled = true;
                } else {
                    enabled = false;
                    gizmoManager.boundingBoxGizmoEnabled = true;
                }
            } else {
                gizmoManager.boundingBoxGizmoEnabled = !gizmoManager.boundingBoxGizmoEnabled;
            }
        }

        this._xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
            this._xr.baseExperience.sessionManager.session.addEventListener('squeeze', onSqueeze);
        });

        this._xr.baseExperience.sessionManager.onXRSessionEnded.add(() => {
            this._xr.baseExperience.sessionManager.session.removeEventListener('squeeze', onSqueeze);
        });
    }

}
    




