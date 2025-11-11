import { Actor, Collider, CollisionType, Color, Vector } from "excalibur";
import { KeyboardControl } from "../Components/KeyboardControl";
import { FogExplorerComponent } from "../Lib/fowSystem";

export class WalkingPlayer extends Actor {
  myCollider: Collider | undefined;
  maxVel: number;
  kc: KeyboardControl;
  fowChild: FowChildActor;

  constructor(startingTilePos: Vector) {
    super({ name: "player", pos: startingTilePos, color: Color.Red, radius: 20, z: 10000, collisionType: CollisionType.Active });
    this.maxVel = 100;
    this.kc = new KeyboardControl(125);
    this.addComponent(this.kc);
    this.fowChild = new FowChildActor();
    this.addChild(this.fowChild);
  }

  onInitialize(): void {
    this.kc.init(this);
  }
}

export class FowChildActor extends Actor {
  myCollider: Collider | undefined;
  fowExplorerComp: any;
  constructor() {
    super({ radius: 100, collisionType: CollisionType.Passive, color: Color.Transparent });
    this.fowExplorerComp = new FogExplorerComponent(true);
    this.addComponent(this.fowExplorerComp);
  }

  onInitialize(): void {
    this.myCollider = this.collider.get() as Collider;
  }
}
