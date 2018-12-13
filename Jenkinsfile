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

  // Get todays date
  today = new Date().format('yyyy-MM-dd')
  // Append the release notes to the change log
  changeLog = readFile 'CHANGELOG.md'
  writeFile(
    file: 'CHANGELOG.md',
    text: "# Release ${versionAfter.substring(1)} (${today})\n\n${releaseNotes}\n\n${changeLog}",
  )
  // Return the release notes
  return releaseNotes
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
    stage('Install') {
      steps {
        // Perform the install
        sh 'npm install'
      }
    }

    stage('Lint & build') {
      when {
        // Don't lint and build when preparing as they'll run again for the tagged commit afterwards
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

    stage('Test') {
      when {
        // Don't run tests when preparing as they'll run again for the tagged commit afterwards
        not { environment name: 'PREPARE', value: 'true' }
      }
      parallel {
        stage('Unit tests') {
          steps {
            sh 'MOCHA_FILE=unit-test-results.xml npm run test:ci -- src/**/*.test.tsx'
          }
        }
        stage('Environment tests') {
          steps {
            sh 'MOCHA_FILE=environments-test-results.xml npm run test:ci -- integration-tests/environments.test.ts'
          }
        }
        stage('Example apps') {
          steps {
            sh 'MOCHA_FILE=examples-test-results.xml npm run test:ci -- integration-tests/examples.test.ts'
          }
        }
      }
      post {
        always {
          junit(
            allowEmptyResults: true,
            keepLongStdio: true,
            testResults: '*-test-results.xml'
          )
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
        }
        // Append the RELEASENOTES to the CHANGELOG
        script {
          releaseNotes = copyReleaseNotes(versionBefore, nextVersion)
        }
        // Create a draft release on GitHub
        withCredentials([
          string(credentialsId: 'github-release-token', variable: 'GITHUB_TOKEN')
        ]) {
          script {
            requestBody = JsonOutput.toJson([
              tag_name: nextVersion,
              name: "${nextVersion.substring(1)}: ...",
              body: releaseNotes,
              draft: true,
            ])
            // Send a request to GitHub, creating the draft release
            sh """
              curl \
                -H "Content-Type: application/json" \
                -H "Authorization: token ${GITHUB_TOKEN}" \
                -X POST \
                -d '${requestBody}' \
                https://api.github.com/repos/realm/react-realm-context/releases
            """
          }
        }

        // Set the email and name used when committing
        sh 'git config --global user.email "ci@realm.io"'
        sh 'git config --global user.name "Jenkins CI"'

        // Stage the updates to the files, commit and tag the commit
        sh 'git add package.json package-lock.json CHANGELOG.md'
        sh "git commit -m 'Prepare version ${nextVersion}'"
        sh "git tag -f ${nextVersion}"

        // Restore the release notes from the template
        sh 'cp docs/RELEASENOTES.template.md RELEASENOTES.md'
        sh 'git add RELEASENOTES.md'
        sh "git commit -m 'Restoring RELEASENOTES.md'"

        // Set the origin to ensure the push will happen via SSH
        sh 'git remote set-url origin git@github.com:realm/react-realm-context.git'
        // Push to GitHub with tags
        sshagent(['realm-ci-ssh']) {
          sh "git push --tags origin"
        }
      }
    }

    // Simple packaging for PRs and runs that don't prepare for releases
    stage('Package') {
      when {
        // Don't run tests when preparing as they'll run again for the tagged commit afterwards
        not { environment name: 'PREPARE', value: 'true' }
      }
      steps {
        script {
          // Change the version to a prerelease if it wasn't prepared
          if (PREPARE != 'true') {
            changeVersion "${JOB_BASE_NAME}-${BUILD_NUMBER}"
          }
        }
        // Package and archive the archive
        script {
          packAndArchive()
        }
      }
    }

    // More advanced packaging for commits tagged as versions
    stage('Publish') {
      when {
        branch 'master'
        tag 'v*'
      }
      steps {
        // TODO: Push archive to NPM
        sh 'echo "Publish!"'
      }
    }
  }
}
