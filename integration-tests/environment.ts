import * as cp from 'child_process';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as stream from 'stream';
import pt from 'prepend-transform';

const ENVIRONMENTS_PATH = path.resolve(__dirname, 'environments');
const NVM_PATH = path.resolve(process.env.NVM_DIR, 'nvm.sh');
const PROJECT_PATH = path.resolve(__dirname, '..');

if (!fs.existsSync(NVM_PATH)) {
  console.error(`Expected NVM installed on ${NVM_PATH}`);
  process.exit(-1);
}

export interface IVersions {
  node: string;
  realm: string;
  react: string;
}

const getEnvironmentPath = (versions: IVersions) => {
  return path.resolve(ENVIRONMENTS_PATH, [
    `node-${versions.node}`,
    `realm-${versions.realm}`,
    `react-${versions.react}`,
  ].join('-'));
}

const withNodeVersion = (version: string, cmd: string) => {
  return `source ${NVM_PATH} && nvm exec ${version} ${cmd}`;
};

const ensureLinkIntoEnvironment = (
  environmentPath: string,
  p: string,
) => {
  fs.ensureSymlinkSync(
    path.resolve(PROJECT_PATH, p),
    path.resolve(environmentPath, p),
  );
}

export const environment = (versions: IVersions) => {
  const environmentPath = getEnvironmentPath(versions);

  const installNodeVersion = (version: string) => {
    exec(`source ${NVM_PATH} && (nvm use ${version} || nvm install ${version})`);
  };

  const remove = () => {
    if (!fs.existsSync(environmentPath)) {
      throw new Error(`Failed to delete non-existing environment: ${JSON.stringify(versions)}`);
    } else {
      // Delete the directory
      fs.removeSync(environmentPath);
    }
  }

  const ensure = () => {
    // Create environment path if its not already created
    fs.ensureDirSync(environmentPath);

    // Ensure the node version is installed
    installNodeVersion(versions.node);

    // Create a symbolic link of specific files into the environment
    ensureLinkIntoEnvironment(environmentPath, 'package.json');
    ensureLinkIntoEnvironment(environmentPath, 'config');
    ensureLinkIntoEnvironment(environmentPath, 'src');
    // Copy the package-lock to ensure versions are locked down but it doesn't get mutated
    fs.copyFileSync(
      path.resolve(PROJECT_PATH, 'package-lock.json'),
      path.resolve(environmentPath, 'package-lock.json'),
    );

    if (!fs.existsSync(path.resolve(environmentPath, 'node_modules'))) {
      // Install the specific versions of Realm and React
      exec(
        withNodeVersion(
          versions.node,
          `npm install realm@${versions.realm} react@${versions.react}`,
        )
      );
    }
  };

  const exec = (command: string, options?: cp.ExecOptions) => {
    cp.execSync(
      command,
      {
        ...options,
        encoding: 'buffer',
        cwd: environmentPath,
        stdio: ['ignore', 'ignore', 'inherit']
      }
    );
  };

  return { ensure, remove, exec };
};
