// resources.ts
import { ImageSource, Loader, SpriteSheet } from "excalibur";
import groundSpriteSheeet from "./Assets/ground-sheet-64x48px.png"; // replace this
import tree from "./Assets/tree-80x.png";

export const Resources = {
  groundSS: new ImageSource(groundSpriteSheeet),
  tree: new ImageSource(tree),
};

export const groundSS = SpriteSheet.fromImageSource({
  image: Resources.groundSS,
  grid: {
    rows: 2,
    columns: 1,
    spriteHeight: 38,
    spriteWidth: 64,
  },
});

export const grassSprite = groundSS.getSprite(0, 0);
export const waterSprite = groundSS.getSprite(0, 1);

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
