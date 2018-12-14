#!groovy

import groovy.json.JsonOutput

// Changes the version in the package.json and package-lock.json
def changeVersion(String preId = "") {
  // Determine the upcoming release type
  nextVersionType = sh(
    script: "node ./scripts/next-version.js",
    returnStdout: true,
  ).trim()
  // Ask NPM to update the package json and lock and read the next version
  // If a preid is specified, perform a pre-release afterwards
  if (preId) {
    // Update the version of the package again
    nextVersion = sh(
      script: "npm version pre${nextVersionType} --no-git-tag-version --preid=${preId}",
      returnStdout: true,
    ).trim()
  } else {
    nextVersion = sh(
      script: "npm version ${nextVersionType} --no-git-tag-version",
      returnStdout: true,
    ).trim()
  }
  // Set the build name
  currentBuild.displayName += ": ${nextVersion}"
  return nextVersion
}

def packAndArchive() {
  // Remove any archives produced by the tests
  sh 'rm -f react-realm-context-*.tgz'
  // Ignore the prepack running "build" again
  sh 'npm pack --ignore-scripts'
  // Archive the archive
  archiveArtifacts 'react-realm-context-*.tgz'
}

def copyReleaseNotes(versionBefore, versionAfter) {
  // Read the release notes and replace in any variables
  releaseNotes = readFile 'RELEASENOTES.md'
  releaseNotes = releaseNotes
    .replaceAll("\\{PREVIOUS_VERSION\\}", versionBefore)
    .replaceAll("\\{CURRENT_VERSION\\}", versionAfter)
  // Write back the release notes
  writeFile file: 'RELEASENOTES.md', text: releaseNotes

  // Get todays date
  today = new Date().format('yyyy-MM-dd')
  // Append the release notes to the change log
  changeLog = readFile 'CHANGELOG.md'
  writeFile(
    file: 'CHANGELOG.md',
    text: "# Release ${versionAfter.substring(1)} (${today})\n\n${releaseNotes}\n\n${changeLog}",
  )
  // Restore the release notes from the template
  sh 'cp docs/RELEASENOTES.template.md RELEASENOTES.md'
}

def testExampleApp(String app) {
  dir("examples/$app") {
    sh 'npm install ../../react-realm-context-*.tgz --no-save'
    sh 'npm test -- --forceExit'
  }
}

pipeline {
  agent {
    docker {
      image 'node:8'
      label 'docker'
      // /etc/passwd is mapped so a jenkins users is available from within the container
      // ~/.ssh is mapped to allow pushing to GitHub via SSH
      args '-e "HOME=${WORKSPACE}" -v /etc/passwd:/etc/passwd:ro -v /home/jenkins/.ssh:/home/jenkins/.ssh:ro'
    }
  }

  environment {
    // Tells Jest (used for example app tests) to run non-interactive
    CI = true
    // Parameters used by the github releases script
    GITHUB_OWNER="realm"
    GITHUB_REPO="react-realm-context"
  }

  options {
    // Prevent checking out multiple times
    skipDefaultCheckout()
  }

  parameters {
    booleanParam(
      name: 'PREPARE',
      defaultValue: false,
      description: '''Prepare for publishing?
        Changes version based on release notes,
        copies release notes to changelog,
        creates a draft GitHub release and
        pushes a tagged commit to git.
      ''',
    )
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: scm.branches,
          extensions: scm.extensions + [
            [$class: 'WipeWorkspace'],
            [$class: 'CleanCheckout'],
            [$class: 'LocalBranch']
          ],
          userRemoteConfigs: [[
            credentialsId: 'realm-ci-ssh',
            name: 'origin',
            url: 'git@github.com:realm/react-realm-context.git'
          ]]
        ])
        // Setting the TAG_NAME env as this is not happening when skipping default checkout.
        script {
          env.TAG_NAME = sh(
            script: 'git tag --points-at HEAD',
            returnStdout: true,
          ).trim()
        }
      }
    }

    stage('Install') {
      steps {
        // Perform the install
        sh 'npm install'
      }
    }

    stage('Lint & build') {
      when {
        // Don't do this when preparing for a release
        not { environment name: 'PREPARE', value: 'true' }
      }
      parallel {
        stage('Lint') {
          steps {
            sh 'npm run lint:ts'
          }
        }

        stage('Build') {
          steps {
            sh 'npm run build'
          }
        }
      }
    }

    stage('Pre-package tests') {
      when {
        // Don't do this when preparing for a release
        not { environment name: 'PREPARE', value: 'true' }
      }
      parallel {
        stage('Unit tests') {
          steps {
            sh 'MOCHA_FILE=pre-unit-test-results.xml npm run test:ci -- src/**/*.test.tsx'
          }
        }
        stage('Environment tests') {
          steps {
            sh 'MOCHA_FILE=pre-environments-test-results.xml npm run test:ci -- integration-tests/environments.test.ts'
          }
        }
      }
      post {
        always {
          junit(
            allowEmptyResults: true,
            keepLongStdio: true,
            testResults: 'pre-*-test-results.xml'
          )
        }
      }
    }

    // Simple packaging for PRs and runs that don't prepare for releases
    stage('Package') {
      when {
        // Don't do this when preparing for a release
        not { environment name: 'PREPARE', value: 'true' }
      }
      steps {
        script {
          if (TAG_NAME && TAG_NAME.startsWith("v")) {
            // Update the build display name
            currentBuild.displayName += ": ${TAG_NAME} (publish)"
          } else {
            // Change the version to a prerelease if it's not preparing or is a release
            changeVersion "${JOB_BASE_NAME}-${BUILD_NUMBER}"
          }
        }
        // Package and archive the archive
        script {
          packAndArchive()
        }
      }
    }

    stage('Post-packaging tests') {
      when {
        // Don't do this when preparing for a release
        not { environment name: 'PREPARE', value: 'true' }
      }
      parallel {
        stage('Example #1') {
          steps {
            script { testExampleApp('initializer-and-query') }
          }
        }
        stage('Example #2') {
          steps {
            script { testExampleApp('multiple-realms') }
          }
        }
        stage('Example #3') {
          steps {
            script { testExampleApp('simple-context') }
          }
        }
        stage('Example #4') {
          steps {
            script { testExampleApp('simple-render-props') }
          }
        }
      }
    }

    // More advanced packaging for commits tagged as versions
    stage('Publish') {
      when {
        // Don't do this when preparing for a release
        not { environment name: 'PREPARE', value: 'true' }
        // Check if a tag starting with a v (for version) is pointing at this commit
        tag "v*"
      }
      steps {
        // Publish archive to NPM
        withCredentials([
          file(
            credentialsId: 'npm-registry-npmrc',
            variable: 'NPM_CONFIG_USERCONFIG',
          )
        ]) {
          sh 'npm publish react-realm-context-*.tgz'
        }
        // Upload artifacts to GitHub and publish release
        withCredentials([
          string(credentialsId: 'github-release-token', variable: 'GITHUB_TOKEN')
        ]) {
          script {
            for (file in findFiles(glob: 'react-realm-context-*.tgz')) {
              sh "node scripts/github-releases upload-asset $TAG_NAME $file"
            }
          }
          script {
            sh "node scripts/github-releases publish $TAG_NAME"
          }
        }
      }
    }

    // Prepares for a release by
    // 1. changing version,
    // 2. copying release notes to the changelog,
    // 3. creating a draft GitHub release and
    // 4. pushing a tagged commit to git
    stage('Prepare') {
      when {
        environment name: 'PREPARE', value: 'true'
      }
      steps {
        script {
          // Read the current version of the package
          packageJson = readJSON file: 'package.json'
          versionBefore = "v${packageJson.version}"
          // Change the version
          nextVersion = changeVersion()
          // Add to the displa name of the build job that we're preparing a release
          currentBuild.displayName += " (prepare)"
        }
        // Append the RELEASENOTES to the CHANGELOG
        script {
          copyReleaseNotes(versionBefore, nextVersion)
        }
        // Create a draft release on GitHub
        script {
          withCredentials([
            string(credentialsId: 'github-release-token', variable: 'GITHUB_TOKEN')
          ]) {
            sh "node scripts/github-releases create-draft $nextVersion RELEASENOTES.md"
          }
        }

        // Set the email and name used when committing
        sh 'git config --global user.email "ci@realm.io"'
        sh 'git config --global user.name "Jenkins CI"'

        // Stage the updates to the files, commit and tag the commit
        sh 'git add package.json package-lock.json CHANGELOG.md RELEASENOTES.md'
        sh "git commit -m 'Prepare version ${nextVersion}'"
        sh "git tag -f ${nextVersion}"

        // Push to GitHub with tags
        sshagent(['realm-ci-ssh']) {
          sh "git push --tags origin HEAD"
        }
      }
    }
  }
}
