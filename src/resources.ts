// resources.ts
import { ImageSource, Loader, SpriteSheet } from "excalibur";
import groundSpriteSheeet from "./Assets/ground-sheet-64x48px.png"; // replace this
import tree from "./Assets/tree-80x.png";
import overlay from "./Assets/overlay.png";

export const Resources = {
  groundSS: new ImageSource(groundSpriteSheeet),
  tree: new ImageSource(tree),
  overlay: new ImageSource(overlay),
};

export const groundSS = SpriteSheet.fromImageSource({
  image: Resources.groundSS,
  grid: {
    rows: 2,
    columns: 2,
    spriteHeight: 38,
    spriteWidth: 64,
  },
});

export const overlaySS = SpriteSheet.fromImageSource({
  image: Resources.overlay,
  grid: {
    rows: 2,
    columns: 7,
    spriteHeight: 16,
    spriteWidth: 16,
  },
});

export const grassSprite = groundSS.getSprite(0, 0);
export const waterSprite = groundSS.getSprite(0, 1);
export const fogSprite = groundSS.getSprite(1, 1);

export const overlayArray = [
  overlaySS.getSprite(0, 0),
  overlaySS.getSprite(1, 0),
  overlaySS.getSprite(2, 0),
  overlaySS.getSprite(3, 0),
  overlaySS.getSprite(4, 0),
  overlaySS.getSprite(5, 0),
  overlaySS.getSprite(6, 0),
  overlaySS.getSprite(0, 1),
  overlaySS.getSprite(1, 1),
  overlaySS.getSprite(2, 1),
];

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
