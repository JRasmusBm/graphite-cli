"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const config_1 = require("../../../lib/config");
const telemetry_1 = require("../../../lib/telemetry");
const utils_1 = require("../../../lib/utils");
const args = {
    set: {
        demandOption: false,
        default: false,
        type: "number",
        alias: "s",
        describe: "Override the max age of branches (behind trunk) Graphite log will show.",
    },
};
exports.command = "max-days-behind-trunk";
exports.description = "Graphite will display branches that lag up to this many days behind trunk. e.g. If this is set to 90, Graphite log will show all stacks up to 90 days behind trunk.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        if (argv.set) {
            config_1.repoConfig.setLogMaxDaysShownBehindTrunk(argv.set);
        }
        else {
            utils_1.logInfo(config_1.repoConfig.getLogMaxDaysShownBehindTrunk().toString());
        }
    }));
});
exports.handler = handler;
//# sourceMappingURL=log_max_days_behind_trunk.js.map