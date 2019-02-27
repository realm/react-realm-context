import { environment, IEnvironmentVersions } from './environment';

// The earliest supported version could be 2.16.0 (if we only ever tested with node 8).
// (technically 2.15.0, but that doesn't have TypeScript types for the connection state listener API).
// But ... the ealiest version with prebuilt binaries for node 10 is 2.19.0
// 2.19.0 is also the first version which fixes the types for Realm.Sync.User.login, which the test-harness relies on.
// 2.22.0 adds support for relative urls when calling `Realm.Sync.User.createConfiguration()` which the ROS related
// related tests needs.
const VERSIONS = {
  realm: [process.env.REALM_OBJECT_SERVER_URL ? '2.22.0' : '2.19.0', 'latest'],
  react: ['16.3.2', 'latest'],
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
