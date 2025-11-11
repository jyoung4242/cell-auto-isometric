import { Actor, Color, CollisionType, Vector } from "excalibur";

export class Followinplayer extends Actor {
  playerToFollow: Actor;
  constructor(followingPlayer: Actor, startingTilePos: Vector) {
    super({
      name: "player",
      pos: startingTilePos,
      color: Color.Red,
      radius: 20,
      z: 10000,
      collisionType: CollisionType.Active,
    });
    this.playerToFollow = followingPlayer;
  }

  onInitialize(): void {
    this.actions.follow(this.playerToFollow, 150);
  }
}
