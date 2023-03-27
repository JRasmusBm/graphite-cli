import type { ApplyPreviewsFuncType, PreviewContext } from "../previews";
import type { Hash } from "../types";

import { CommitPreview } from "../previews";
import { SucceedableRevset } from "../types";
import { Operation } from "./Operation";

export class HideOperation extends Operation {
  constructor(private source: Hash) {
    super();
  }

  static opName = "Hide";

  getArgs() {
    return ["hide", "--rev", SucceedableRevset(this.source)];
  }

  makePreviewApplier(
    _context: PreviewContext
  ): ApplyPreviewsFuncType | undefined {
    const func: ApplyPreviewsFuncType = (tree, previewType) => {
      if (tree.info.hash === this.source) {
        return {
          info: tree.info,
          children: tree.children,
          previewType: CommitPreview.HIDDEN_ROOT,
          childPreviewType: CommitPreview.HIDDEN_DESCENDANT,
        };
      }
      return {
        info: tree.info,
        children: tree.children,
        previewType,
        childPreviewType: previewType,
      };
    };
    return func;
  }

  makeOptimisticApplier(
    context: PreviewContext
  ): ApplyPreviewsFuncType | undefined {
    const { treeMap } = context;
    const originalSourceNode = treeMap.get(this.source);
    if (originalSourceNode == null) {
      return undefined;
    }

    const func: ApplyPreviewsFuncType = (
      tree,
      previewType,
      childPreviewType
    ) => {
      if (tree.info.hash === this.source) {
        return {
          info: null,
        };
      }
      return {
        info: tree.info,
        children: tree.children,
        previewType,
        childPreviewType,
      };
    };
    return func;
  }
}
