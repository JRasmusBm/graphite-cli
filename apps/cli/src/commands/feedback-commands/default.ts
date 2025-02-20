import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import chalk from 'chalk';
import yargs from 'yargs';
import { requestWithArgs } from '../../lib/api/request';
import { captureState } from '../../lib/debug_context';
import { ExitFailedError } from '../../lib/errors';
import { graphite } from '../../lib/runner';

const args = {
  message: {
    type: 'string',
    positional: true,
    demandOption: true,
    hidden: true,
    describe:
      'Positive or constructive feedback for the Graphite team! Jokes are chill too.',
  },
  'with-debug-context': {
    type: 'boolean',
    default: false,
    describe:
      "Include a blob of json describing your repo's state to help with debugging. Run 'gt feedback debug-context' to see what would be included.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = '* <message>';
export const canonical = 'feedback';
export const description =
  "Post a string directly to the maintainers' Slack so they can drown in praise, factor in your feedback, laugh at your jokes, cry at your insults, or fall victim to Slack injection attacks.";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return graphite(argv, canonical, async (context) => {
    if (!argv.message) {
      throw new ExitFailedError(`No message provided`);
    }
    const response = await requestWithArgs(
      context.userConfig,
      API_ROUTES.feedback,
      {
        user: context.userEmail ?? 'NotFound',
        message: argv.message,
        debugContext: argv['with-debug-context']
          ? captureState(context)
          : undefined,
      }
    );
    if (response._response.status === 200) {
      context.splog.info(
        chalk.green(
          `Feedback received loud and clear (in a team Slack channel) 😊`
        )
      );
    } else {
      throw new ExitFailedError(
        `Failed to report feedback, network response ${response.status}`
      );
    }
  });
};
