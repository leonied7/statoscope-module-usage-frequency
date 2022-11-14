import { resolve } from "node:path";
import Generator, { descriptor } from "./generator";
export default class ExtensionModuleUsageFrequency {
    generator = new Generator();
    moduleNames;
    moduleMap = new Map();
    constructor(moduleNames) {
        this.moduleNames = moduleNames;
    }
    getExtension() {
        return this.generator.get();
    }
    handleCompiler(compiler, context) {
        const trackableModules = new Map();
        compiler.hooks.done.tap("module-usage-frequency", (stats) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const statsObj = stats.toJson(compiler.options.stats);
            const modules = Array.from(statsObj.modules ?? []);
            modules.forEach((module) => {
                if (module.identifier) {
                    this.moduleMap.set(module.identifier.split("|")[0], module);
                }
                this.moduleNames.forEach((moduleName) => {
                    const moduleFullName = resolve(context, moduleName);
                    const module = modules.find(({ nameForCondition }) => nameForCondition === moduleFullName);
                    trackableModules.set(moduleName, module);
                });
            });
            trackableModules.forEach((module, moduleName) => {
                this.addAllModuleReasons(moduleName, module);
            });
        });
    }
    addAllModuleReasons(moduleName, module) {
        if (!module || this.generator.hasModuleReason(moduleName, module)) {
            return;
        }
        this.generator.addModuleReason(moduleName, module);
        for (const reason of module.reasons ?? []) {
            if (!reason.moduleIdentifier) {
                continue;
            }
            const module = this.moduleMap.get(reason.moduleIdentifier);
            this.addAllModuleReasons(moduleName, module);
        }
    }
}
export function makeReport(report, { moduleNames }) {
    return {
        ...report,
        view: {
            view: "table",
            data: `
      $modules: ${makeModuleNamesToString(moduleNames)};
      $extensionPayload: #.stats.__statoscope.extensions.[descriptor.name="${descriptor.name}"].payload;
      $modulesInfo: $modules.({
       $name: $;
       name: $name,
       count: $extensionPayload.[name=$name].reasons.size()
      });
      $moduleCount: $modulesInfo.reduce(=>$$ + $.count, 0);
      $modulesInfo.({
       name: $.name,
       count: $.count,
       percentage: 100 * $.count / $moduleCount
      })`,
            cols: [
                {
                    header: "Название модуля",
                    data: "name",
                    content: "text:$",
                },
                {
                    header: "Количество использований",
                    data: "count",
                    content: "text:$",
                },
                {
                    header: "Процент использований",
                    data: "percentage",
                    content: "text:$",
                },
            ],
        },
    };
}
function makeModuleNamesToString(moduleNames) {
    const modulesString = moduleNames
        .map((moduleName) => `'${moduleName}'`)
        .join(", ");
    return `[${modulesString}]`;
}
//# sourceMappingURL=index.js.map