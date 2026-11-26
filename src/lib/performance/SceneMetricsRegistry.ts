export interface SceneDebugMetrics {
  id: string;
  active: boolean;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  width: number;
  height: number;
  dpr: number;
}

class SceneMetricsRegistryImpl {
  private scenes = new Map<string, SceneDebugMetrics>();

  update(metrics: SceneDebugMetrics) {
    this.scenes.set(metrics.id, metrics);
  }

  remove(id: string) {
    this.scenes.delete(id);
  }

  getAll(): SceneDebugMetrics[] {
    return Array.from(this.scenes.values());
  }

  getTotals() {
    let drawCalls = 0;
    let triangles = 0;
    let geometries = 0;
    let textures = 0;
    let activeRenderers = 0;
    for (const s of this.scenes.values()) {
      if (s.active) activeRenderers++;
      drawCalls += s.drawCalls;
      triangles += s.triangles;
      geometries += s.geometries;
      textures += s.textures;
    }
    return { activeRenderers, drawCalls, triangles, geometries, textures };
  }
}

export const sceneMetricsRegistry = new SceneMetricsRegistryImpl();
