import { expect } from 'chai';
import { inferPRBody } from '../../../src/actions/submit/pr_body';
import { inferPRTitle } from '../../../src/actions/submit/pr_title';
import { shouldNotSubmitDueToEmptyBranches } from '../../../src/actions/submit/validate_branches';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): correctly infers submit info from commits`, function () {
    configureTest(this, scene);

    it('can infer title/body from single commit', async () => {
      const title = 'Test Title';
      const body = ['Test body line 1.', 'Test body line 2.'].join('\n');
      const message = `${title}\n\n${body}`;

      scene.repo.execCliCommand(`branch create "a" -m "${message}" -q`);

      expect(inferPRTitle('a', scene.getContext())).to.equals(title);
      expect(inferPRBody('a', scene.getContext())).to.equals(body);
    });

    it('can infer just title with no body', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);

      expect(inferPRTitle('a', scene.getContext())).to.equals(title);
      expect(inferPRBody('a', scene.getContext())).to.be.undefined;
    });

    it('does not infer title/body for multiple commits', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);
      scene.repo.createChangeAndCommit(commitMessage);

      expect(inferPRTitle('a', scene.getContext())).to.not.equals(title);
      expect(inferPRBody('a', scene.getContext())).to.be.undefined;
    });

    it('aborts if the branch is empty', async () => {
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      expect(await shouldNotSubmitDueToEmptyBranches(['a'], scene.getContext()))
        .to.be.true;
    });

    it('does not abort if the branch is not empty', async () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      expect(await shouldNotSubmitDueToEmptyBranches(['a'], scene.getContext()))
        .to.be.false;
    });
  });
}
