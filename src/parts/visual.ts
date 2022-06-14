import {Composite } from "matter-js";
import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { BoxGeometry } from "three/src/geometries/BoxGeometry";
import { MeshToonMaterial } from "three/src/materials/MeshToonMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Color } from 'three/src/math/Color';
import { PointLight } from 'three/src/lights/PointLight';
import { Param } from "../core/param";

export class Visual extends Canvas {

  private _con: Object3D;
  private _item:Array<Mesh> = [];
  private _pLight:PointLight;

  constructor(opt: any) {
    super(opt);

    // ライト
    this._pLight = new PointLight(0xffffff, 1, 0);
    this.mainScene.add(this._pLight);
    this._pLight.position.set( 100, 200, -100 );

    this._con = new Object3D()
    this.mainScene.add(this._con)

    const seg = 32
    const geo = new BoxGeometry(1, 1, 1, seg, seg, seg);
    const mat = [
      new MeshToonMaterial({
        color:0xf6003c,
        gradientMap: null,
        depthTest:false,
      }),
      new MeshToonMaterial({
        color:0x260033,
        gradientMap: null,
        depthTest:false,
      }),
      new MeshToonMaterial({
        color:0x1f640a,
        gradientMap: null,
        depthTest:false,
      }),
      new MeshToonMaterial({
        color:0x08D9D6,
        gradientMap: null,
        depthTest:false,
      }),
      new MeshToonMaterial({
        color:0xF5E0A3,
        gradientMap: null,
        depthTest:false,
      }),
    ]

    const num = Conf.instance.ITEM_NUM * Conf.instance.STACK_NUM;
    for(let i = 0; i < num; i++) {
      const b = new Mesh(
        geo,
        mat[~~(i / Conf.instance.ITEM_NUM) % mat.length]
        // Util.instance.randomArr(mat)
      )
      this._con.add(b)
      this._item.push(b)
    }

    this._resize()
  }


  public updatePos(stack:Array<Composite>): void {
    // 物理演算結果をパーツに反映
    let key = 0;
    const offsetX = -this.renderSize.width * 0.5
    const offsetY = this.renderSize.height * 0.5

    stack.forEach((val) => {
      val.bodies.forEach((val2) => {
        const item = this._item[key++];
        const pos = val2.position

        item.position.x = pos.x + offsetX
        item.position.y = pos.y * -1 + offsetY

        item.rotation.z = val2.angle * -1;
        // item.visible = (i2 != val.bodies.length - 1)
      })
    })

  }


  protected _update(): void {
    super._update()

    this._item.forEach((val) => {
      const s = Conf.instance.ITEM_SIZE * 2 * Func.instance.val(0.75, 1);
      val.scale.set(s * 10, s * 10, s * 10);
      // val.rotation.y += 0.01
      // val.rotation.x += 0.01
    })


    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = new Color(Param.instance.main.bg.value)
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
