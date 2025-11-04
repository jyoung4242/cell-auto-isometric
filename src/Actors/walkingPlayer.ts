import { Actor, CollisionType, Color, Vector } from "excalibur";
import { KeyboardControl } from "../Components/KeyboardControl";

export class WalkingPlayer extends Actor {
  maxVel: number;
  kc: KeyboardControl;
  colliders: any[] = [];

  constructor(startingTilePos: Vector) {
    super({ name: "player", pos: startingTilePos, color: Color.Red, radius: 16, z: 10000, collisionType: CollisionType.Active });
    this.maxVel = 100;
    this.kc = new KeyboardControl(50);
    this.addComponent(this.kc);
  }

  onInitialize(): void {
    this.kc.init(this);
  }
}
