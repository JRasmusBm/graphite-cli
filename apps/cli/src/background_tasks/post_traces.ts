import { API_ROUTES } from '@withgraphite/graphite-cli-routes';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { version } from '../../package.json';
import { userConfigFactory } from '../lib/spiffy/user_config_spf';
import { spawnDetached } from '../lib/utils/spawn';
import { tracer } from '../lib/utils/tracer';
import { requestWithArgs } from '../lib/api/request';

function saveTracesToTmpFile(): string {
  const tmpDir = tmp.dirSync();
  const json = tracer.flushJson();
  const tracesPath = path.join(tmpDir.name, 'traces.json');
  fs.writeFileSync(tracesPath, json);
  return tracesPath;
}

export function postTelemetryInBackground(): void {
  const tracesPath = saveTracesToTmpFile();
  spawnDetached(__filename, [tracesPath]);
}

async function postTelemetry(): Promise<void> {
  const userConfig = userConfigFactory.load();
  if (process.env.GRAPHITE_DISABLE_TELEMETRY) {
    return;
  }
  const tracesPath = process.argv[2];
  if (tracesPath && fs.existsSync(tracesPath)) {
    // Failed to find traces file, exit
    try {
      await requestWithArgs(userConfig, API_ROUTES.traces, {
        jsonTraces: fs.readFileSync(tracesPath).toString(),
        cliVersion: version,
      });
    } catch (err) {
      return;
    }
    // Cleanup despite it being a temp file.
    fs.removeSync(tracesPath);
  }
}

if (process.argv[1] === __filename) {
  void postTelemetry();
}
