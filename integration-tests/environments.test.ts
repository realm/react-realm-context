import { environment, IVersions } from './environment';

const VERSIONS = {
  realm: ['2.1.0', '2.6.0'],
  react: ['16.3.2'],
};

const versionPermutations = () => {
  const result: IVersions[] = [];
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
          return env.exec('npm run test:in-environment');
        });
      },
    );
  }
});
