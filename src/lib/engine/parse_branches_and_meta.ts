import { getMergeBase } from '../git/merge_base';
import { TSplog } from '../utils/splog';
import { TCachedMeta } from './cached_meta';
import {
  deleteMetadataRef,
  readMetadataRef,
  TMeta,
  writeMetadataRef,
} from './metadata_ref';

export type TBranchToParse = {
  branchName: string;
  branchRevision: string;
} & TMeta;

function getAllBranchesAndMeta(
  args: {
    pruneMeta?: boolean;
    gitBranchNamesAndRevisions: Record<string, string>;
    metaRefNames: string[];
  },
  splog: TSplog
): TBranchToParse[] {
  const branchesWithMeta = new Set(
    args.metaRefNames.filter((branchName) => {
      if (args.gitBranchNamesAndRevisions[branchName]) {
        return true;
      }
      if (!args.pruneMeta) {
        return false;
      }
      // Clean up refs whose branch is missing
      splog.logDebug(`Deleting metadata for missing branch: ${branchName}`);
      deleteMetadataRef(branchName);
      return false;
    })
  );

  return Object.keys(args.gitBranchNamesAndRevisions).map((branchName) => ({
    branchName,
    branchRevision: args.gitBranchNamesAndRevisions[branchName],
    ...(branchesWithMeta.has(branchName) ? readMetadataRef(branchName) : {}),
  }));
}

export function parseBranchesAndMeta(
  args: {
    pruneMeta?: boolean;
    gitBranchNamesAndRevisions: Record<string, string>;
    metaRefNames: string[];
    trunkName: string | undefined;
  },
  splog: TSplog
): Record<string, TCachedMeta> {
  const branchesToParse = getAllBranchesAndMeta(args, splog);

  const allBranchNames = new Set(
    branchesToParse.map((meta) => meta.branchName)
  );
  const parsedBranches: Record<string, TCachedMeta> = {};

  splog.logDebug('Validating branches...');
  while (branchesToParse.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const current = branchesToParse.shift()!;
    const {
      branchName,
      branchRevision,
      parentBranchName,
      parentBranchRevision,
      prInfo,
    } = current;

    if (branchName === args.trunkName) {
      splog.logDebug(`trunk: ${branchName}`);
      parsedBranches[branchName] = {
        validationResult: 'TRUNK',
        branchRevision: branchRevision,
        children: [],
      };
      continue;
    }

    // Check parentBranchName
    if (
      !parentBranchName ||
      parentBranchName === branchName ||
      !allBranchNames.has(parentBranchName)
    ) {
      splog.logDebug(
        `bad parent name: ${branchName}\n\t${parentBranchName ?? 'missing'}`
      );
      parsedBranches[branchName] = {
        validationResult: 'BAD_PARENT_NAME',
        branchRevision,
        prInfo,
        children: [],
      };
      continue;
    }

    // If parent hasn't been checked yet, we'll come back to this branch
    if (typeof parsedBranches[parentBranchName] === 'undefined') {
      branchesToParse.push(current);
      continue;
    }

    parsedBranches[parentBranchName].children.push(branchName);

    // Check if the parent is valid (or trunk)
    if (
      !['VALID', 'TRUNK'].includes(
        parsedBranches[parentBranchName].validationResult
      )
    ) {
      splog.logDebug(`invalid parent: ${branchName}`);
      parsedBranches[branchName] = {
        validationResult: 'INVALID_PARENT',
        parentBranchName,
        parentBranchRevision,
        branchRevision,
        prInfo,
        children: [],
      };
      continue;
    }

    // If we make it here, we just need to validate the parent branch revision!
    const result = validateOrFixParentBranchRevision(
      {
        ...current,
        parentBranchCurrentRevision:
          parsedBranches[parentBranchName].branchRevision,
      } as TBranchToParseWithValidatedParent,
      splog
    );

    parsedBranches[branchName] = {
      ...{
        parentBranchName,
        branchRevision,
        prInfo,
        children: [],
      },
      ...result,
    };
  }

  return parsedBranches;
}

type TBranchToParseWithValidatedParent = TBranchToParse & {
  parentBranchName: string;
  parentBranchCurrentRevision: string;
};

function validateOrFixParentBranchRevision(
  {
    branchName,
    parentBranchName,
    parentBranchRevision,
    prInfo,
    parentBranchCurrentRevision,
  }: TBranchToParseWithValidatedParent,
  splog: TSplog
):
  | { validationResult: 'VALID'; parentBranchRevision: string }
  | { validationResult: 'BAD_PARENT_REVISION' } {
  // This branch is valid because its PBR is in its history
  if (
    parentBranchRevision &&
    getMergeBase(branchName, parentBranchRevision) === parentBranchRevision
  ) {
    splog.logDebug(`validated: ${branchName}`);
    return { validationResult: 'VALID', parentBranchRevision };
  }

  // PBR cannot be fixed because its parent is not in its history
  if (getMergeBase(branchName, parentBranchName) !== parentBranchName) {
    splog.logDebug(
      `bad parent rev: ${branchName}\n\t${parentBranchRevision ?? 'missing'}`
    );
    return { validationResult: 'BAD_PARENT_REVISION' };
  }

  // PBR can be fixed because we see the parent in the branch's history
  writeMetadataRef(branchName, {
    parentBranchName,
    parentBranchRevision: parentBranchCurrentRevision,
    prInfo,
  });
  splog.logDebug(
    `validated and fixed parent rev: ${branchName}\n\t${parentBranchCurrentRevision}`
  );
  return {
    validationResult: 'VALID',
    parentBranchRevision: parentBranchCurrentRevision,
  };
}
