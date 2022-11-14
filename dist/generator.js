"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptor = void 0;
exports.descriptor = {
    name: "stats-extension-module-usage-frequency",
    version: "1.0.0",
};
class Generator {
    modulesMap = {};
    get() {
        return {
            descriptor: exports.descriptor,
            payload: Object.entries(this.modulesMap).map(([moduleName, reasons]) => {
                return { name: moduleName, reasons: Array.from(reasons.values()) };
            }),
        };
    }
    addModuleReason(moduleName, reason) {
        if (!reason.identifier) {
            console.warn(`empty identifier`, reason);
            return;
        }
        if (!this.modulesMap[moduleName]) {
            this.modulesMap[moduleName] = new Map();
        }
        this.modulesMap[moduleName].set(reason.identifier, reason);
    }
    hasModuleReason(moduleName, reason) {
        if (!reason.identifier) {
            console.warn(`empty identifier`, reason);
            return false;
        }
        return this.modulesMap[moduleName]?.has(reason.identifier);
    }
}
exports.default = Generator;
//# sourceMappingURL=generator.js.map