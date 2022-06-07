import { TContext } from '../lib/context';
import { addAll } from '../lib/git/add_all';
import { ensureSomeStagedChangesPrecondition } from '../lib/preconditions';
import { SCOPE } from '../lib/state/scope_spec';
import { restackBranches } from './restack';

export function commitAmendAction(
  opts: {
    addAll: boolean;
    message?: string;
    noEdit: boolean;
  },
  context: TContext
): void {
  if (opts.addAll) {
    addAll();
  }

  if (opts.noEdit) {
    ensureSomeStagedChangesPrecondition(context);
  }

  context.metaCache.commit({
    noVerify: context.noVerify,
    amend: true,
    noEdit: opts.noEdit,
    message: opts.message,
  });
  restackBranches({ relative: true, scope: SCOPE.UPSTACK_EXCLUSIVE }, context);
}
