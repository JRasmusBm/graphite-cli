import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import { requestWithArgs } from '../lib/api/request';
import { TContextLite } from '../lib/context';
import { surveyConfigFactory } from '../lib/spiffy/survey_responses_spf';
import { userConfigFactory } from '../lib/spiffy/user_config_spf';
import { spawnDetached } from '../lib/utils/spawn';

// We try to post the survey response right after the user takes it, but in
// case they quit early or there's some error, we'll continue to try to post
// it in the future until it succeeds.
export function postSurveyResponsesInBackground(context: TContextLite): void {
  // We don't worry about race conditions here - we can dedup on the server.
  if (context.surveyConfig.hasSurveyResponse()) {
    spawnDetached(__filename);
  }
}

export async function postSurveyResponse(): Promise<void> {
  try {
    const surveyConfig = surveyConfigFactory.loadIfExists();
    const surveyResponse = surveyConfig?.data.responses;
    const userConfig = userConfigFactory.load();
    const authToken = userConfig?.getAuthToken();

    if (!surveyConfig || !surveyResponse || !authToken) {
      return;
    }

    const response = await requestWithArgs(
      userConfig,
      API_ROUTES.surveyResponse,
      {
        responses: {
          timestamp: surveyResponse.timestamp,
          responses: surveyResponse.responses.map((qa) => {
            return {
              question: qa.question,
              response: qa.answer,
            };
          }),
          exitedEarly: surveyResponse.exitedEarly,
        },
      }
    );

    if (response._response.status === 200) {
      surveyConfig.clearPriorSurveyResponses();
    }
  } catch (e) {
    // Ignore any background errors posting the survey; if posting fails,
    // then we'll try again the next time a user runs a CLI command.
  }
}

if (process.argv[1] === __filename) {
  void postSurveyResponse();
}
