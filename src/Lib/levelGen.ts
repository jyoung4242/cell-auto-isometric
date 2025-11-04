import { PerlinGenerator } from "@excaliburjs/plugin-perlin";
import { Color, GraphicsGroup, IsometricMap, IsometricMapOptions, Random, Shape, vec } from "excalibur";
import { grassSprite, overlayArray, Resources } from "../resources";

export type WoodsMapOptions = IsometricMapOptions & {
  loops: number;
  lowLimit: number;
  highLimit: number;
};

export type Region = { x: number; y: number };
type Cell = { x: number; y: number };

export class LevelGen {
  width: number = 0;
  height: number = 0;
  loops: number = 0;
  map: number[] = [];
  rng: Random = new Random();
  lowLimit: number = 4;
  highLimit: number = 5;
  mapConfig: IsometricMapOptions | null = null;

  generator = new PerlinGenerator({
    seed: Date.now(), // random seed
    octaves: 1, // number of times noise is laid on itself
    frequency: 30, // number of times the pattern oscillates, higher is like zooming out
    amplitude: 0.9, // [0-1] amplitude determines the relative height of the peaks generated in the noise
    persistance: 0.3, // [0-1] he persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns, a low degree of persistance generates spiky patterns.
  });

  constructor() {}

  redrawMap(): IsometricMap | null {
    if (!this.mapConfig) return null;
    this.map = this.applyCellularAutomataRules();
    return this.drawMap();
  }

  drawMap(): IsometricMap | null {
    if (!this.mapConfig) return null;

    let iMap = new IsometricMap(this.mapConfig);

    // apply noise field to map

    let tileMapWidth = iMap.columns * iMap.tileWidth;
    let tileMapHeight = iMap.rows * iMap.tileHeight;

    let tIndex = 0;
    for (let tiles of iMap.tiles) {
      if (tIndex == 0) {
        tiles.data.set("mapwidth", tileMapWidth);
        tiles.data.set("mapheight", tileMapHeight);
      }

      if (this.map[tIndex] === 0) {
        let grassGG = new GraphicsGroup({ useAnchor: true, members: [grassSprite] });

        //random overly
        let nextRnd = this.rng.next();

        if (nextRnd > 0.7) {
          let rndSprite = this.rng.pickOne(overlayArray).clone();
          grassGG.members.push(rndSprite);
        }

        tiles.addGraphic(grassGG);
      } else {
        //tiles.addGraphic(waterSprite);
        let edgeTileGG = new GraphicsGroup({
          useAnchor: true,
          members: [
            {
              graphic: grassSprite,
              offset: vec(0, 50),
            },
            {
              graphic: Resources.tree.toSprite(),
              offset: vec(-6, 0),
            },
          ],
        });

        tiles.solid = true;
        tiles.addCollider(Shape.Polygon([vec(0, 17), vec(32, 0), vec(64, 17), vec(32, 32)]));
        tiles.addGraphic(edgeTileGG);
      }

      tIndex++;
    }

    iMap.updateColliders();
    let col = iMap.collider.get();
    console.log(col);

    return iMap;
  }

  getRegions() {
    return identifyRegions(this.map, this.width, this.height);
  }

  findRandomAvailableTile() {
    let availableTiles = this.map.map((tile, index) => {
      if (tile === 0) {
        return {
          index: index,
          x: index % this.width,
          y: Math.floor(index / this.width),
        };
      } else return false;
    });

    availableTiles = availableTiles.filter(tile => tile !== false);
    return this.rng.pickOne(availableTiles);
  }

  resolveRegions(): IsometricMap | null {
    let regions = [];
    regions = identifyRegions(this.map, this.width, this.height);
    this.map = resolveRegions(regions, this.map, this.width);
    return this.drawMap();
  }

  isTileInSmallRegion(index: number, smallRegionLimit: number) {
    const regions = identifyRegions(this.map, this.width, this.height);

    //get x/y for index
    let x = index % this.width;
    let y = Math.floor(index / this.width);

    for (let reg of regions) {
      if (reg.length >= smallRegionLimit) continue;
      for (let cell of reg) {
        if (cell.x == x && cell.y == y) {
          return true;
        }
      }
    }
    return false;
  }

  highlightSmallRegions(smallRegionLimit: number) {
    if (!this.mapConfig) return null;
    let iMap = new IsometricMap(this.mapConfig);

    // apply noise field to map

    let tileMapWidth = iMap.columns * iMap.tileWidth;
    let tileMapHeight = iMap.rows * iMap.tileHeight;

    let tIndex = 0;
    for (let tiles of iMap.tiles) {
      if (tIndex == 0) {
        tiles.data.set("mapwidth", tileMapWidth);
        tiles.data.set("mapheight", tileMapHeight);
      }

      if (this.map[tIndex] === 0) {
        tiles.addGraphic(grassSprite.clone());
      } else {
        //tiles.addGraphic(waterSprite);
        let edgeTileGG = new GraphicsGroup({
          useAnchor: true,
          members: [
            {
              graphic: grassSprite,
              offset: vec(0, 50),
            },
            {
              graphic: Resources.tree.toSprite(),
              offset: vec(-6, 0),
            },
          ],
        });
        tiles.addGraphic(edgeTileGG.clone());
      }

      //test for small region
      if (this.isTileInSmallRegion(tIndex, smallRegionLimit)) {
        tiles.getGraphics()[0].tint = Color.Red;
      }

      tIndex++;
    }

    return iMap;
  }

  randomColor(): Color {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return new Color(r, g, b);
  }

  highlightAllRegions() {
    const regions = identifyRegions(this.map, this.width, this.height);
    let regionColors = regions.map(() => this.randomColor());

    if (!this.mapConfig) return null;
    let iMap = new IsometricMap(this.mapConfig);

    // apply noise field to map

    let tileMapWidth = iMap.columns * iMap.tileWidth;
    let tileMapHeight = iMap.rows * iMap.tileHeight;

    let tIndex = 0;
    for (let tiles of iMap.tiles) {
      if (tIndex == 0) {
        tiles.data.set("mapwidth", tileMapWidth);
        tiles.data.set("mapheight", tileMapHeight);
      }

      if (this.map[tIndex] === 0) {
        tiles.addGraphic(grassSprite.clone());
      } else {
        //tiles.addGraphic(waterSprite);
        let edgeTileGG = new GraphicsGroup({
          useAnchor: true,
          members: [
            {
              graphic: grassSprite,
              offset: vec(0, 50),
            },
            {
              graphic: Resources.tree.toSprite(),
              offset: vec(-6, 0),
            },
          ],
        });
        tiles.addGraphic(edgeTileGG.clone());
      }

      //add tint depending on region tile is located and its color
      for (let i = 0; i < regions.length; i++) {
        for (let cell of regions[i]) {
          if (cell.x == tIndex % this.width && cell.y == Math.floor(tIndex / this.width)) {
            tiles.getGraphics()[0].tint = regionColors[i];
          }
        }
      }

      tIndex++;
    }

    return iMap;
  }

  cullSmallRegions(minRegionSize: number = 3): IsometricMap | null {
    if (!this.mapConfig) return null;

    const regions = identifyRegions(this.map, this.width, this.height);

    // Fill in small regions
    for (const region of regions) {
      if (region.length < minRegionSize) {
        for (const cell of region) {
          const index = coordToIndex(cell.x, cell.y, this.width);
          this.map[index] = 1; // Convert to wall/tree
        }
      }
    }

    return this.drawMap();
  }

  generateWoods(options: WoodsMapOptions): IsometricMap {
    this.mapConfig = options;
    this.width = options.columns;
    this.height = options.rows;
    this.loops = options.loops;
    this.lowLimit = options.lowLimit;
    this.highLimit = options.highLimit;

    this.map = this.initializeMap();

    this.generateMap();
    this.createBorder();
    let map = this.drawMap();
    if (!map) throw new Error("map is null");
    return map;
  }

  runFullMapScript(options: IsometricMapOptions) {
    this.mapConfig = options;
    this.width = options.columns;
    this.height = options.rows;
    this.loops = 5;
    this.lowLimit = 4;
    this.highLimit = 6;
    this.map = this.initializeMap();

    this.generateMap();
    for (let i = 0; i < this.loops; i++) {
      this.map = this.applyCellularAutomataRules();
    }
    this.cullSmallRegions(20);
    this.resolveRegions();
    this.createBorder();

    return this.drawMap();
  }

  private createBorder() {
    const numtiles = this.width * this.height;
    // Set edges to 1
    for (let i = 0; i < numtiles; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);

      // Check if position is on any edge
      if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
        this.map[i] = 1;
      }
    }
  }

  private initializeMap(): number[] {
    const numtiles = this.width * this.height;
    const map = new Array(numtiles).fill(0);
    return map;
  }

  private generateMap(): void {
    this.randomFillMap();

    // for (let i = 0; i < this.loops; i++) {
    //this.map = this.applyCellularAutomataRules();
    // }
  }

  private randomFillMap(): void {
    // print highst and lowest noise values
    let highest = 0;
    let lowest = 1;
    let averageArray = [];

    for (let i = 0; i < this.height * this.width; i++) {
      const y = Math.floor(i / this.width);
      const x = i % this.width;

      //use noise field to fill map
      if (this.generator) {
        const noiseVal = this.generator.noise(x / this.width, y / this.height);
        if (noiseVal > highest) highest = noiseVal;
        if (noiseVal < lowest) lowest = noiseVal;
        averageArray.push(noiseVal);
        if (noiseVal > 0.5) {
          this.map[i] = 1;
        } else {
          this.map[i] = 0;
        }
      }
    }
    console.log("noise table: ");
    console.log("highest: ", highest);
    console.log("lowest: ", lowest);
    console.log("mid point: ", (highest + lowest) / 2);
    console.log("average: ", averageArray.reduce((a, b) => a + b, 0) / averageArray.length);
    console.log("standard dev: ", this.standardDeviation(averageArray));
  }

  private standardDeviation(values: number[]): number {
    const n = values.length;
    if (n === 0) return 0;

    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / n;

    // Calculate variance (average of squared differences from mean)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

    // Standard deviation is square root of variance
    return Math.sqrt(variance);
  }

  private applyCellularAutomataRules(): number[] {
    const newMap = this.initializeMap();

    // for (let i = 0; i < this.height * this.width; i++) {
    //   for (let x = 0; x < this.width; x++) {
    //     const wallCount = this.countAdjacentWalls(i);
    //     if (this.map[i] === 1) {
    //       if (wallCount < this.lowLimit) {
    //         newMap[i] = 0; // Change to floor if there are less than 4 adjacent walls
    //       } else {
    //         newMap[i] = 1; // Remain wall
    //       }
    //     } else {
    //       if (wallCount >= this.highLimit) {
    //         newMap[i] = 1; // Change to wall if there are 5 or more adjacent walls
    //       } else {
    //         newMap[i] = 0; // Remain floor
    //       }
    //     }
    //   }
    // }
    for (let i = 0; i < this.height * this.width; i++) {
      const wallCount = this.countAdjacentWalls(i);

      if (this.map[i] === 1) {
        // Current cell is a wall
        newMap[i] = wallCount < this.lowLimit ? 0 : 1;
      } else {
        // Current cell is floor
        newMap[i] = wallCount >= this.highLimit ? 1 : 0;
      }
    }

    return newMap;
  }

  countAdjacentWalls(index: number): number {
    let map = this.map;
    let width = this.width;
    let height = this.height;
    let oob = "wall";
    let count = 0;

    const y = Math.floor(index / width);
    const x = index % width;
    let coinflip: boolean | null = null;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        //if (map[y + i][x + j] === 1) count++;

        const newY = y + i;
        const newX = x + j;
        if (newY >= 0 && newY < height && newX >= 0 && newX < width) {
          const adjacentIndex = newY * width + newX;
          if (map[adjacentIndex] === 1) count++;
        } else {
          switch (oob) {
            case "floor":
              break;
            case "wall":
              count++;
              break;
            case "random":
              coinflip = this.rng.bool();
              if (coinflip) count++;
              break;
            case "mirror":
              if (map[index] == 1) count++;
              break;
            default:
              count++; // Perceive out of bounds as wall
              break;
          }
        }
      }
    }
    return count;
  }
}

// Utility functions to convert between 1D and 2D coordinates
function indexToCoord(index: number, width: number): Cell {
  return { x: index % width, y: Math.floor(index / width) };
}

function coordToIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

export function identifyRegions(grid: number[], width: number, height: number): Cell[][] {
  const visited = new Array(grid.length).fill(false); // Initialize visited array
  const directions = [
    { x: 0, y: 1 }, // Right
    { x: 1, y: 0 }, // Down
    { x: 0, y: -1 }, // Left
    { x: -1, y: 0 }, // Up
  ];

  // Checks if the cell at a given index is valid for flood fill
  function isValid(index: number): boolean {
    const { x, y } = indexToCoord(index, width);
    return x >= 0 && x < width && y >= 0 && y < height && !visited[index] && grid[index] === 0;
  }

  // Flood fill function to explore and mark all connected cells in the same region
  function floodFill(index: number, region: Cell[]): void {
    const stack: number[] = [index];
    while (stack.length > 0) {
      const currentIndex = stack.pop()!;
      if (visited[currentIndex]) continue;
      visited[currentIndex] = true;
      const cell = indexToCoord(currentIndex, width);
      region.push(cell);

      // Check all adjacent cells
      for (const dir of directions) {
        const nx = cell.x + dir.x;
        const ny = cell.y + dir.y;
        const neighborIndex = coordToIndex(nx, ny, width);
        if (isValid(neighborIndex)) {
          stack.push(neighborIndex);
        }
      }
    }
  }

  const regions: Cell[][] = [];
  for (let index = 0; index < grid.length; index++) {
    if (grid[index] === 0 && !visited[index]) {
      const newRegion: Cell[] = [];
      floodFill(index, newRegion);
      regions.push(newRegion);
    }
  }
  return regions;
}

function findClosestCells(region1: Cell[], region2: Cell[]): [Cell, Cell] {
  let minDist = Infinity;
  let closestPair: [Cell, Cell] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];

  for (const cell1 of region1) {
    for (const cell2 of region2) {
      const dist = Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y); // Manhattan distance
      if (dist < minDist) {
        minDist = dist;
        closestPair = [cell1, cell2];
      }
    }
  }

  return closestPair;
}

// function createPath(grid: number[], width: number, start: Cell, end: Cell): void {
//   let { x: x0, y: y0 } = start;
//   let { x: x1, y: y1 } = end;

//   // Step 1: Move horizontally from start.x to end.x
//   while (x0 !== x1) {
//     grid[coordToIndex(x0, y0, width)] = 0; // Make the current cell walkable
//     if (x0 < x1) x0++; // Move right if x0 < x1
//     else if (x0 > x1) x0--; // Move left if x0 > x1
//   }

//   // Step 2: Move vertically from start.y to end.y
//   while (y0 !== y1) {
//     grid[coordToIndex(x0, y0, width)] = 0; // Make the current cell walkable
//     if (y0 < y1) y0++; // Move down if y0 < y1
//     else if (y0 > y1) y0--; // Move up if y0 > y1
//   }

//   // Ensure the end cell is also walkable
//   grid[coordToIndex(x1, y1, width)] = 0;
// }

function createPath(grid: number[], width: number, start: Cell, end: Cell): void {
  let { x: x0, y: y0 } = start;
  let { x: x1, y: y1 } = end;

  // Helper function to clear a 2-wide path at a given position
  function clearWide(x: number, y: number, isHorizontal: boolean): void {
    grid[coordToIndex(x, y, width)] = 0;

    if (isHorizontal) {
      // For horizontal movement, also clear the tile below
      if (y + 1 < grid.length / width) {
        grid[coordToIndex(x, y + 1, width)] = 0;
      }
    } else {
      // For vertical movement, also clear the tile to the right
      if (x + 1 < width) {
        grid[coordToIndex(x + 1, y, width)] = 0;
      }
    }
  }

  // Step 1: Move horizontally from start.x to end.x
  while (x0 !== x1) {
    clearWide(x0, y0, true);
    x0 += x0 < x1 ? 1 : -1;
  }

  // Step 2: Move vertically from start.y to end.y
  while (y0 !== y1) {
    clearWide(x0, y0, false);
    y0 += y0 < y1 ? 1 : -1;
  }

  // Ensure the end cell is also walkable (2-wide)
  clearWide(x1, y1, false);
}

function connectRegions(region1: Cell[], region2: Cell[], grid: number[], width: number): void {
  const [start, end] = findClosestCells(region1, region2);
  createPath(grid, width, start, end);
}

// export function resolveRegions(regions: Cell[][], grid: number[], width: number) {
//   //connect remaining regions
//   for (let i = 0; i < regions.length; i++) {
//     for (let j = i + 1; j < regions.length; j++) {
//       connectRegions(regions[i], regions[j], grid, width);
//     }
//   }

//   return grid;
// }

// Function to find the first walkable tile in the grid

// FIXED: Now connects regions sequentially instead of fully connected mesh
export function resolveRegions(regions: Cell[][], grid: number[], width: number): number[] {
  // Connect remaining regions sequentially (n-1 connections instead of n²)
  console.log("region count: ", regions.length);

  for (let i = 0; i < regions.length - 1; i++) {
    connectRegions(regions[i], regions[i + 1], grid, width);
  }

  return grid;
}

export function findFirstWalkableTile(grid: number[], width: number): Cell | null {
  for (let index = 0; index < grid.length; index++) {
    if (grid[index] === 0) {
      return indexToCoord(index, width);
    }
  }
  return null; // Return null if no walkable tile is found
}
