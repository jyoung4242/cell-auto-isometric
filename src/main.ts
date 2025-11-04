// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, Keys, Toaster, IsometricMapOptions } from "excalibur";
import { model, template } from "./UI/UI";
import { LevelGen } from "./Lib/levelGen";
import { loader } from "./resources";
import { WalkingPlayer } from "./Actors/walkingPlayer";

await UI.create(document.body, model, template).attached;

const game = new Engine({
  width: 1200, // the width of the canvas
  height: 800, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
  suppressPlayButton: true,
});

await game.start(loader);

let levGen = new LevelGen();

let woodsOptions: IsometricMapOptions = {
  name: "woods",
  tileHeight: 32,
  tileWidth: 64,
  rows: 100,
  columns: 100,
};

let myMap = levGen.runFullMapScript(woodsOptions);
if (!myMap) throw new Error("map is null");
// console.log(performance.now() - timestamp);
// let mapCenter = myMap.get(BodyComponent).globalPos.add(vec(0, myMap.tiles[0].data.get("mapheight") / 2));
// game.currentScene.camera.pos = mapCenter;
// game.currentScene.camera.zoom = 0.22;
game.add(myMap);

let cullingSize = 20;

game.input.keyboard.on("hold", evt => {
  let zoom = 1 / game.currentScene.camera.zoom;
  if (evt.key === Keys.W) {
    game.currentScene.camera.pos.y -= 5 * zoom;
  }
  if (evt.key === Keys.S) {
    game.currentScene.camera.pos.y += 5 * zoom;
  }
  if (evt.key === Keys.A) {
    game.currentScene.camera.pos.x -= 5 * zoom;
  }
  if (evt.key === Keys.D) {
    game.currentScene.camera.pos.x += 5 * zoom;
  }
});

game.input.keyboard.on("release", evt => {
  // console.log(evt.key);

  if (evt.key == Keys.Minus) {
    game.currentScene.camera.zoom -= 0.1;
  } else if (evt.key == Keys.Equal) {
    game.currentScene.camera.zoom += 0.1;
  } else if (evt.key == Keys.Space) {
    let myNewMap = levGen.redrawMap();
    //redraw map
    if (myNewMap == null) return;

    //@ts-ignore
    game.remove(myMap);
    game.add(myNewMap);
    console.log("CA pass: # regions:  ", levGen.getRegions().length);

    myMap = myNewMap;
  } else if (evt.key == Keys.Enter) {
    let myNewMap = levGen.resolveRegions();
    if (myNewMap == null) return;
    console.log("region resolve pass: # regions:  ", levGen.getRegions().length);

    //@ts-ignore
    game.remove(myMap);
    game.add(myNewMap);
    myMap = myNewMap;
  } else if (evt.key == Keys.Backslash) {
    let myNewMap = levGen.cullSmallRegions(cullingSize);

    console.log(`Culling pass (culling size = ${cullingSize}): number of regions`, levGen.getRegions().length);
    cullingSize++;

    if (myNewMap == null) return;
    //@ts-ignore
    game.remove(myMap);
    game.add(myNewMap);
    myMap = myNewMap;
  } else if (evt.key == Keys.Backspace) {
    console.log("highlighting map");
    let myNewMap = levGen.highlightAllRegions();
    if (myNewMap == null) return;
    //@ts-ignore
    game.remove(myMap);
    game.add(myNewMap);
    myMap = myNewMap;
    let toaster = new Toaster();
    toaster.toast("highlighting map complete");
    setTimeout(() => toaster.dispose(), 3000);
  }
});

let startingTile = levGen.findRandomAvailableTile();
if (!startingTile) throw new Error("starting tile is null");

let playerTile = myMap.getTile(startingTile.x, startingTile.y);
if (!playerTile) throw new Error("player tile is null");

//get vector of starting tile

let player = new WalkingPlayer(playerTile.pos.clone());
game.add(player);
game.currentScene.camera.strategy.lockToActor(player);
game.currentScene.camera.zoom = 1.5;

console.log(myMap);
