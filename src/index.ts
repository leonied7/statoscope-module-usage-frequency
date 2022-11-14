import { Compiler, StatsModule } from "webpack";
import { resolve } from "node:path";
import { Report } from "@statoscope/types/types/custom-report";
import { StatsExtensionWebpackAdapter } from "@statoscope/webpack-model/dist";
import Generator, { Format, Payload, descriptor } from "./generator";

export default class ExtensionModuleUsageFrequency
  implements StatsExtensionWebpackAdapter<Payload>
{
  generator = new Generator();
  moduleNames: string[];
  moduleMap = new Map<string, StatsModule>();

  constructor(moduleNames: string[]) {
    this.moduleNames = moduleNames;
  }

  getExtension(): Format {
    return this.generator.get();
  }

  handleCompiler(compiler: Compiler, context: string): void {
    const trackableModules = new Map<string, StatsModule | undefined>();
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
          const module = modules.find(
            ({ nameForCondition }) => nameForCondition === moduleFullName
          );
          trackableModules.set(moduleName, module);
        });
      });

      trackableModules.forEach((module, moduleName) => {
        this.addAllModuleReasons(moduleName, module);
      });
    });
  }

  addAllModuleReasons(
    moduleName: string,
    module: StatsModule | undefined
  ): void {
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

export function makeReport(
  report: Omit<Report<unknown, unknown>, "data" | "view">,
  { moduleNames }: { moduleNames: string[] }
): Report<unknown, unknown> {
  return {
    ...report,
    view: {
      view: "table",
      data: `
      $modules: ${makeModuleNamesToString(moduleNames)};
      $extensionPayload: #.stats.__statoscope.extensions.[descriptor.name="${
        descriptor.name
      }"].payload;
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

function makeModuleNamesToString(moduleNames: string[]) {
  const modulesString = moduleNames
    .map((moduleName) => `'${moduleName}'`)
    .join(", ");
  return `[${modulesString}]`;
}
