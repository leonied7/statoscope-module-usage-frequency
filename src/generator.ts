import { StatsModule } from "webpack";
import {
  Extension,
  ExtensionDescriptor,
} from "@statoscope/stats/spec/extension";

export type Payload = {
  name: string;
  reasons: StatsModule[];
}[];
export type Format = Extension<Payload>;

export const descriptor: ExtensionDescriptor = {
  name: "stats-extension-module-usage-frequency",
  version: "1.0.0",
};

export default class Generator {
  modulesMap: Record<string, Map<string, StatsModule>> = {};

  get(): Format {
    return {
      descriptor,
      payload: Object.entries(this.modulesMap).map(([moduleName, reasons]) => {
        return { name: moduleName, reasons: Array.from(reasons.values()) };
      }),
    };
  }

  addModuleReason(moduleName: string, reason: StatsModule): void {
    if (!reason.identifier) {
      console.warn(`empty identifier`, reason);
      return;
    }
    if (!this.modulesMap[moduleName]) {
      this.modulesMap[moduleName] = new Map<string, StatsModule>();
    }
    this.modulesMap[moduleName].set(reason.identifier, reason);
  }

  hasModuleReason(moduleName: string, reason: StatsModule): boolean {
    if (!reason.identifier) {
      console.warn(`empty identifier`, reason);
      return false;
    }
    return this.modulesMap[moduleName]?.has(reason.identifier);
  }
}
