import * as cp from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

const EXAMPLES_PATH = path.resolve(__dirname, '../examples');

describe('Examples', () => {
  before(function() {
    this.timeout(10000);
    // Build the package
    cp.execSync('npm pack ..', {
      cwd: EXAMPLES_PATH,
      encoding: 'utf8',
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  });

  const examples = fs.readdirSync(EXAMPLES_PATH);
  for (const example of examples) {
    const examplePath = path.resolve(EXAMPLES_PATH, example);
    const stat = fs.statSync(examplePath);
    if (stat.isDirectory()) {
      describe(example, function() {
        // Increase the timeout to allow for NPM installation
        this.timeout(60000);
        it('installs and passes its test', () => {
          // NPM install with the packaged version of react-realm-context and test
          // CI=true to prevent jest interactive mode
          cp.execSync(
            'npm install ../react-realm-context-0.1.0.tgz --no-save && CI=true npm test -- --forceExit',
            {
              cwd: examplePath,
              encoding: 'utf8',
              stdio: ['ignore', 'inherit', 'inherit'],
            },
          );
        });
      });
    }
  }
});
