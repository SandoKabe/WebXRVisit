import { Scene, Vector3, Color3, Texture, PBRMetallicRoughnessMaterial, MeshBuilder, StandardMaterial,  Quaternion, } from "@babylonjs/core";

export class Interaction {
    private _scene: Scene;


    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async set(){
        this._setInteraction();
    }

    private _setInteraction() {
        let _this = this;

        // Load description painting
        let monaDesc = MeshBuilder.CreatePlane("Mona Desc", {size: 10, width: 10, height: 10}, _this._scene);

        let materialPlane = new StandardMaterial("texturePlane", this._scene);
        materialPlane.diffuseTexture = new Texture("./sprites/monaDesc.jpg", this._scene);
        monaDesc.material = materialPlane;

        monaDesc.parent = null;
        monaDesc.name = "MonaDesc";
        monaDesc.isVisible = false;
        monaDesc.scaling = new Vector3(0.1, 0.1, 0.1);
        monaDesc.position = new Vector3(1, 2.2, -3.6);
        let rotation = new Quaternion(0, 180, 0);
        monaDesc.rotation = rotation.toEulerAngles();

    }
}


