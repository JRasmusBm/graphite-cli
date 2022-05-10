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
exports.commitCreateAction = void 0;
const preconditions_1 = require("../lib/preconditions");
const addAll_1 = require("../lib/utils/addAll");
const commit_1 = require("../lib/utils/commit");
const fix_1 = require("./fix");
function commitCreateAction(opts, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.addAll) {
            addAll_1.addAll();
        }
        preconditions_1.ensureSomeStagedChangesPrecondition(context);
        commit_1.commit({ message: opts.message });
        yield fix_1.rebaseUpstack(context);
    });
}
exports.commitCreateAction = commitCreateAction;
//# sourceMappingURL=commit_create.js.map