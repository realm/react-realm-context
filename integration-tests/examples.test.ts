import * as cp from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

const EXAMPLES_PATH = path.resolve(__dirname, '../examples');

describe('Examples', () => {
  const examples = fs.readdirSync(EXAMPLES_PATH);
  for(const example of examples) {
    describe(example, function() {
      // Increaser the timeout to allow for NPM installation
      this.timeout(60000);
      const examplePath = path.resolve(EXAMPLES_PATH, example);
      it('installs and passes its test', () => {
        // NPM install and test
        cp.execSync('npm install && CI=true npm test -- --forceExit', {
          cwd: examplePath,
          encoding: 'utf8',
          stdio: ['ignore', 'inherit', 'inherit'],
        });
      });
    });
  }
});
