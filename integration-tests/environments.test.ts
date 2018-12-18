import { environment, IEnvironmentVersions } from './environment';

const VERSIONS = {
  realm: ['2.16.0', '2.21.0'],
  react: ['16.3.2'],
};

const versionPermutations = () => {
  const result: IEnvironmentVersions[] = [];
  for (const realmVersion of VERSIONS.realm) {
    for (const reactVersion of VERSIONS.react) {
      result.push({
        realm: realmVersion,
        react: reactVersion,
      });
    }
  }
  return result;
};

describe('Environments', () => {
  const allVersions = versionPermutations();
  for (const versions of allVersions) {
    describe(
      [`Realm (${versions.realm})`, `React (${versions.react})`].join(', '),
      () => {
        const env = environment(versions);

        before(function() {
          // It might take some time to install the environment
          this.timeout(60000);
          env.ensure();
        });

        after(() => {
          if (process.env.CLEAN_ENVIRONMENT_AFTER_TEST) {
            env.remove();
          }
        });

        it('creates an environment and passes the test', function() {
          this.timeout(20000);
          // Run the tests with the appropreate arguments
          const args = [
            // We need to tell node (via mocha) to preserve the symlinks when requiring modules,
            // otherwise we'll be requiring modules relative to the original src folder
            '--preserve-symlinks',
            '--reporter dot',
          ];
          return env.exec(`npm test -- ${args.join(' ')}`);
        });
      },
    );
  }
});
