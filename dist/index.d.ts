import { Compiler, StatsModule } from "webpack";
import { Report } from "@statoscope/types/types/custom-report";
import { StatsExtensionWebpackAdapter } from "@statoscope/webpack-model/dist";
import Generator, { Format, Payload } from "./generator";
export default class ExtensionModuleUsageFrequency implements StatsExtensionWebpackAdapter<Payload> {
    generator: Generator;
    moduleNames: string[];
    moduleMap: Map<string, StatsModule>;
    constructor(moduleNames: string[]);
    getExtension(): Format;
    handleCompiler(compiler: Compiler, context: string): void;
    addAllModuleReasons(moduleName: string, module: StatsModule | undefined): void;
}
export declare function makeReport(report: Omit<Report<unknown, unknown>, "data" | "view">, { moduleNames }: {
    moduleNames: string[];
}): Report<unknown, unknown>;
