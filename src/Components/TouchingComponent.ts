import { Actor, CollisionContact, CollisionStartEvent, Component, IsometricMap } from "excalibur";

type Side = "left" | "right" | "top" | "bottom";

type contact = {
  side: Side;
  who: Actor | IsometricMap;
  contact: CollisionContact;
};

/**
 * Tracks which entities are touching this entity currently.
 *
 * left, right, top, and bottom will contain active or fixed entities,
 * while passives will contain passive entities.
 */
export class TouchingComponent extends Component {
  type = "touching";

  private contacts = new Map<
    string,
    {
      contact: CollisionContact;
      actor: Actor | IsometricMap;
      side: Side;
    }
  >();

  left = new Set<contact>();
  right = new Set<contact>();
  top = new Set<contact>();
  bottom = new Set<contact>();

  /**
   * Entities that are touching this entity but are not solid. They are
   * not tracked by side because they can move through the entity.
   */
  passives = new Set<Actor | IsometricMap>();

  onAdd(owner: Actor): void {
    // collect up all of the collisionstart/end events for each frame
    owner.on("collisionstart", (ev: CollisionStartEvent) => {
      let other: Actor | IsometricMap = ev.other.owner as Actor | IsometricMap;

      if (other.collider) {
        const side = ev.side.toLowerCase() as "left" | "right" | "top" | "bottom";
        this.contacts.set(ev.contact.id, {
          contact: ev.contact,
          actor: other,
          side,
        });
        this.updateSides();
      }
    });

    owner.on("collisionend", ev => {
      // eslint-disable-next-line no-unused-vars
      let otherActor: Actor | IsometricMap = ev.other.owner as Actor | IsometricMap;
      this.contacts.delete(ev.lastContact.id);
      this.updateSides();
    });
  }

  public clear() {
    this.contacts.clear();
    this.updateSides();
  }

  private updateSides() {
    this.left.clear();
    this.right.clear();
    this.top.clear();
    this.bottom.clear();

    for (const { side, actor, contact } of this.contacts.values()) {
      this[side].add({ who: actor, side, contact });
    }
  }
}
