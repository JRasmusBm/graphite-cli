import { TContext } from '../lib/context/context';
import { Stack } from '../wrapper-classes';
import { Branch } from '../wrapper-classes/branch';
import { TScope } from './scope';
export declare function validate(scope: TScope, context: TContext): Branch[];
export declare function backfillParentShasOnValidatedStack(stack: Stack, context: TContext): void;
export declare function getStacksForValidation(scope: TScope, context: TContext): {
    metaStack: Stack;
    gitStack: Stack;
};
