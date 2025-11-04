import { Actor, Component, Engine, Entity, Keys } from "excalibur";

export class KeyboardControl extends Component {
  heldDirections: string[] = [];
  speed: number = 100;
  engine: Engine | null | undefined = null;
  constructor(speed: number) {
    super();
    this.speed = speed;
  }

  init(owner: Actor) {
    this.owner = owner;
    this.engine = owner.scene?.engine;
  }

  onAdd(owner: Entity): void {
    this.owner?.on("preupdate", this.update.bind(this));
  }

  onRemove(previousOwner: Entity): void {
    this.owner?.off("preupdate", this.update.bind(this));
    this.heldDirections = [];
  }

  update() {
    //gaurd conditions
    if (!this.owner || !this.engine) return;
    const keyboard = this.engine.input.keyboard;
    if (!keyboard) return;

    if (this.owner && this.engine && this.owner instanceof Actor) {
      if (keyboard.isHeld(Keys.Left) || keyboard.isHeld(Keys.A)) {
        if (!this.heldDirections.includes("left")) {
          this.heldDirections.push("left");
        }
      } else {
        const index = this.heldDirections.indexOf("left");
        if (index !== -1) this.heldDirections.splice(index, 1);
      }

      if (keyboard.isHeld(Keys.Right) || keyboard.isHeld(Keys.D)) {
        if (!this.heldDirections.includes("right")) {
          this.heldDirections.push("right");
        }
      } else {
        const index = this.heldDirections.indexOf("right");
        if (index !== -1) this.heldDirections.splice(index, 1);
      }

      if (keyboard.isHeld(Keys.Up) || keyboard.isHeld(Keys.W)) {
        if (!this.heldDirections.includes("up")) {
          this.heldDirections.push("up");
        }
      } else {
        const index = this.heldDirections.indexOf("up");
        if (index !== -1) this.heldDirections.splice(index, 1);
      }

      if (keyboard.isHeld(Keys.Down) || keyboard.isHeld(Keys.S)) {
        if (!this.heldDirections.includes("down")) {
          this.heldDirections.push("down");
        }
      } else {
        const index = this.heldDirections.indexOf("down");
        if (index !== -1) this.heldDirections.splice(index, 1);
      }
    }

    if (this.owner && this.owner instanceof Actor) {
      // Default to zero
      this.owner.vel.x = 0;
      this.owner.vel.y = 0;

      // Apply the LAST held direction (most recent input wins)
      const lastHorizontal = [...this.heldDirections].reverse().find(d => d === "left" || d === "right");
      const lastVertical = [...this.heldDirections].reverse().find(d => d === "up" || d === "down");

      if (lastHorizontal === "left") this.owner.vel.x = -this.speed;
      else if (lastHorizontal === "right") this.owner.vel.x = this.speed;

      if (lastVertical === "up") this.owner.vel.y = -this.speed;
      else if (lastVertical === "down") this.owner.vel.y = this.speed;
    }
  }
}
