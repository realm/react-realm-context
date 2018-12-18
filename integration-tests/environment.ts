import * as cp from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

const ENVIRONMENTS_PATH = path.resolve(__dirname, 'environments');
const PROJECT_PATH = path.resolve(__dirname, '..');

/**
 * Specific versions of the components in an environment.
 */
export interface IEnvironmentVersions {
  realm: string;
  react: string;
}

const getEnvironmentPath = (versions: IEnvironmentVersions) => {
  return path.resolve(
    ENVIRONMENTS_PATH,
    [`realm-${versions.realm}`, `react-${versions.react}`].join('-'),
  );
};

const ensureLinkIntoEnvironment = (environmentPath: string, p: string) => {
  fs.ensureSymlinkSync(
    path.resolve(PROJECT_PATH, p),
    path.resolve(environmentPath, p),
  );
};

/**
 * Create a wrapper for a specific environment, including functions to execute in it, remove it and ensure it exists.
 */
export const environment = (versions: IEnvironmentVersions) => {
  const environmentPath = getEnvironmentPath(versions);

  const exec = (command: string, options?: cp.ExecOptions) => {
    cp.execSync(command, {
      ...options,
      encoding: 'buffer',
      cwd: environmentPath,
      shell: 'bash',
      stdio: ['ignore', 'inherit', 'inherit'],
    });
  };

  const remove = () => {
    if (!fs.existsSync(environmentPath)) {
      throw new Error(
        `Failed to delete non-existing environment: ${JSON.stringify(
          versions,
        )}`,
      );
    } else {
      // Delete the directory
      fs.removeSync(environmentPath);
    }
  };

  const ensure = () => {
    // Create environment path if its not already created
    fs.ensureDirSync(environmentPath);

    // Create a symbolic link of specific files into the environment
    ensureLinkIntoEnvironment(environmentPath, 'package.json');
    ensureLinkIntoEnvironment(environmentPath, 'tsconfig.json');
    ensureLinkIntoEnvironment(environmentPath, 'config');
    ensureLinkIntoEnvironment(environmentPath, 'src');
    ensureLinkIntoEnvironment(environmentPath, 'utils');
    // Copy the package-lock to ensure versions are locked down but it doesn't get mutated
    fs.copyFileSync(
      path.resolve(PROJECT_PATH, 'package-lock.json'),
      path.resolve(environmentPath, 'package-lock.json'),
    );

    if (!fs.existsSync(path.resolve(environmentPath, 'node_modules'))) {
      // Install the specific versions of Realm and React
      exec(`npm install realm@${versions.realm} react@${versions.react}`);
    }
  };

  return { ensure, remove, exec };
};
