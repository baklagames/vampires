export type GridPoint = {
  x: number;
  y: number;
};

export type Heuristic = (from: GridPoint, to: GridPoint) => number;

export type MovementCost = {
  straight: number;
  diagonal?: number;
};

export type PathfindingOptions = {
  allowDiagonal: boolean;
  movementCost: MovementCost;
  heuristic: Heuristic;
  maxIterations?: number;
};

export type PathfindingGrid = {
  width: number;
  height: number;
  isWalkable: (x: number, y: number) => boolean;
};

type PathNode = {
  x: number;
  y: number;
  g: number;
  f: number;
  parentKey?: string;
};

export const createGridFromMatrix = (
  walkable: boolean[][],
): PathfindingGrid => {
  const height = walkable.length;
  const width = height > 0 ? walkable[0].length : 0;

  return {
    width,
    height,
    isWalkable: (x, y) => {
      if (x < 0 || y < 0 || y >= height || x >= width) {
        return false;
      }

      const row = walkable[y];
      return Boolean(row?.[x]);
    },
  };
};

export const createManhattanHeuristic =
  (straightCost: number): Heuristic =>
  (from, to) =>
    (Math.abs(from.x - to.x) + Math.abs(from.y - to.y)) * straightCost;

export const createDiagonalHeuristic =
  (straightCost: number, diagonalCost: number): Heuristic =>
  (from, to) => {
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    const min = Math.min(dx, dy);
    const max = Math.max(dx, dy);

    return diagonalCost * min + straightCost * (max - min);
  };

export const findPath = (
  grid: PathfindingGrid,
  start: GridPoint,
  goal: GridPoint,
  options: PathfindingOptions,
): GridPoint[] | null => {
  const { allowDiagonal, movementCost, heuristic, maxIterations } = options;
  const { diagonal } = movementCost;

  if (allowDiagonal && diagonal === undefined) {
    throw new Error("Diagonal movement requires a diagonal movement cost.");
  }

  if (
    !grid.isWalkable(start.x, start.y) ||
    !grid.isWalkable(goal.x, goal.y)
  ) {
    return null;
  }

  const openSet = new Map<string, PathNode>();
  const closedSet = new Map<string, PathNode>();

  const startKey = `${start.x},${start.y}`;
  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    f: heuristic(start, goal),
  };

  openSet.set(startKey, startNode);

  let iterations = 0;

  while (openSet.size > 0) {
    if (maxIterations !== undefined && iterations >= maxIterations) {
      return null;
    }

    iterations += 1;

    let current: PathNode | undefined;
    let currentKey = "";

    for (const [key, node] of openSet.entries()) {
      if (!current || node.f < current.f) {
        current = node;
        currentKey = key;
      }
    }

    if (!current) {
      return null;
    }

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(current, closedSet);
    }

    openSet.delete(currentKey);
    closedSet.set(currentKey, current);

    for (const neighbor of getNeighbors(current, allowDiagonal)) {
      if (!grid.isWalkable(neighbor.x, neighbor.y)) {
        continue;
      }

      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const stepCost = isDiagonalStep(current, neighbor)
        ? diagonal ?? movementCost.straight
        : movementCost.straight;
      const tentativeG = current.g + stepCost;

      const existing = openSet.get(neighborKey);
      if (!existing || tentativeG < existing.g) {
        const updated: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g: tentativeG,
          f: tentativeG + heuristic(neighbor, goal),
          parentKey: currentKey,
        };

        openSet.set(neighborKey, updated);
      }
    }
  }

  return null;
};

const reconstructPath = (
  goalNode: PathNode,
  closedSet: Map<string, PathNode>,
): GridPoint[] => {
  const path: GridPoint[] = [];
  let current: PathNode | undefined = goalNode;

  while (current) {
    path.push({ x: current.x, y: current.y });
    if (!current.parentKey) {
      break;
    }

    current = closedSet.get(current.parentKey);
  }

  return path.reverse();
};

const getNeighbors = (node: GridPoint, allowDiagonal: boolean): GridPoint[] => {
  const neighbors: GridPoint[] = [
    { x: node.x + 1, y: node.y },
    { x: node.x - 1, y: node.y },
    { x: node.x, y: node.y + 1 },
    { x: node.x, y: node.y - 1 },
  ];

  if (!allowDiagonal) {
    return neighbors;
  }

  return neighbors.concat([
    { x: node.x + 1, y: node.y + 1 },
    { x: node.x - 1, y: node.y + 1 },
    { x: node.x + 1, y: node.y - 1 },
    { x: node.x - 1, y: node.y - 1 },
  ]);
};

const isDiagonalStep = (from: GridPoint, to: GridPoint): boolean =>
  from.x !== to.x && from.y !== to.y;
