import { Actor, Collider, CollisionType, Color, Vector } from "excalibur";
import { KeyboardControl } from "../Components/KeyboardControl";

export class WalkingPlayer extends Actor {
  myCollider: Collider | undefined;
  maxVel: number;
  kc: KeyboardControl;

  constructor(startingTilePos: Vector) {
    super({ name: "player", pos: startingTilePos, color: Color.Red, radius: 20, z: 10000, collisionType: CollisionType.Active });
    this.maxVel = 100;
    this.kc = new KeyboardControl(175);
    this.addComponent(this.kc);
  }

  onInitialize(): void {
    this.kc.init(this);
  }
}
