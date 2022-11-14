import { StatsModule } from "webpack";
import { Extension, ExtensionDescriptor } from "@statoscope/stats/spec/extension";
export declare type Payload = {
    name: string;
    reasons: StatsModule[];
}[];
export declare type Format = Extension<Payload>;
export declare const descriptor: ExtensionDescriptor;
export default class Generator {
    modulesMap: Record<string, Map<string, StatsModule>>;
    get(): Format;
    addModuleReason(moduleName: string, reason: StatsModule): void;
    hasModuleReason(moduleName: string, reason: StatsModule): boolean;
}
