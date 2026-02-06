export type SpatialHashEntry = {
  id: string;
  position: { x: number; y: number };
};

export class SpatialHash {
  private readonly cellSize: number;
  private cells = new Map<string, Set<string>>();
  private entries = new Map<string, SpatialHashEntry>();
  private entryCells = new Map<string, string>();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  upsert(entry: SpatialHashEntry): void {
    this.entries.set(entry.id, entry);
    const cellKey = this.toCellKey(entry.position);
    const previousCell = this.entryCells.get(entry.id);
    if (previousCell && previousCell !== cellKey) {
      this.cells.get(previousCell)?.delete(entry.id);
    }
    this.entryCells.set(entry.id, cellKey);
    let cell = this.cells.get(cellKey);
    if (!cell) {
      cell = new Set();
      this.cells.set(cellKey, cell);
    }
    cell.add(entry.id);
  }

  remove(id: string): void {
    const cellKey = this.entryCells.get(id);
    if (cellKey) {
      this.cells.get(cellKey)?.delete(id);
      this.entryCells.delete(id);
    }
    this.entries.delete(id);
  }

  queryRadius(center: { x: number; y: number }, radius: number): SpatialHashEntry[] {
    const results: SpatialHashEntry[] = [];
    const minCellX = Math.floor((center.x - radius) / this.cellSize);
    const maxCellX = Math.floor((center.x + radius) / this.cellSize);
    const minCellY = Math.floor((center.y - radius) / this.cellSize);
    const maxCellY = Math.floor((center.y + radius) / this.cellSize);
    const radiusSq = radius * radius;

    for (let cx = minCellX; cx <= maxCellX; cx += 1) {
      for (let cy = minCellY; cy <= maxCellY; cy += 1) {
        const cell = this.cells.get(`${cx},${cy}`);
        if (!cell) {
          continue;
        }
        for (const id of cell) {
          const entry = this.entries.get(id);
          if (!entry) {
            continue;
          }
          const dx = entry.position.x - center.x;
          const dy = entry.position.y - center.y;
          if (dx * dx + dy * dy <= radiusSq) {
            results.push(entry);
          }
        }
      }
    }

    return results;
  }

  private toCellKey(position: { x: number; y: number }): string {
    const cx = Math.floor(position.x / this.cellSize);
    const cy = Math.floor(position.y / this.cellSize);
    return `${cx},${cy}`;
  }
}
