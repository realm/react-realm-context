#!groovy

// Changes the version in the package.json and package-lock.json
def changeVersion(String preId = "") {
  // Read the current version of the package
  packageJson = readJSON file: 'package.json'
  versionBefore = "v${packageJson.version}"
  // Determine the upcoming release type
  nextVersionType = sh(
    script: "node ./scripts/next-version.js",
    returnStdout: true,
  ).trim()
  // Ask NPM to update the package json and lock and read the next version
  nextVersion = sh(
    script: "npm version ${nextVersionType} --no-git-tag-version",
    returnStdout: true,
  ).trim()
  // If a preid is specified, perform a pre-release afterwards
  if (preId) {
    // Update the version of the package again
    sh "npm version prerelease --no-git-tag-version --preid=${preId}"
  }
  // Set the build name
  currentBuild.displayName = nextVersion
}

def packAndArchive() {
  // Remove any archives produced by the tests
  sh 'rm -f react-realm-context-*.tgz'
  // Ignore the prepack running "build" again
  sh 'npm pack --ignore-scripts'
  // Archive the archive
  archiveArtifacts 'react-realm-context-*.tgz'
}

def copyReleaseNotes() {
  // Read the release notes and replace in any variables
  releaseNotes = readFile 'RELEASENOTES.md'
  releaseNotes = releaseNotes
    .replaceAll("\\{PREVIOUS_VERSION\\}", versionBefore)
    .replaceAll("\\{CURRENT_VERSION\\}", nextVersion)

  // Get todays date
  today = new Date().format('yyyy-MM-dd')
  // Append the release notes to the change log
  changeLog = readFile 'CHANGELOG.md'
  writeFile(
    file: 'CHANGELOG.md',
    text: "# Release ${nextVersion.substring(1)} (${today})\n\n${releaseNotes}\n\n${changeLog}",
  )
  // Return the release notes
  return releaseNotes
}

pipeline {
  agent {
    docker {
      image 'node:8'
      label 'docker'
      args "-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro"
    }
  }

  stages {
    stage('Install, pre-check and build') {
      stages {
        stage('Install') {
          steps {
            sh 'npm install'
          }
        }
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

    stage('Package') {
      when {
        not {
          allOf {
            branch 'master'
            tag "v*"
          }
        }
      }
      steps {
        // Change the version
        script {
          changeVersion "${JOB_BASE_NAME}-${BUILD_NUMBER}"
        }
        // Package and archive the archive
        script {
          packAndArchive()
        }
      }
    }

    stage('Prepare, package & publish') {
      when {
        branch 'master'
        tag "v*"
      }

      stages {
        stage('Prepare') {
          steps {
            script {
              changeVersion()
            }
            // Append the RELEASENOTES to the CHANGELOG
            script {
              releaseNotes = copyReleaseNotes()
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
            sh "git tag ${nextVersion}"

            // Restore the release notes from the template
            sh 'cp docs/RELEASENOTES.template.md RELEASENOTES.md'
            sh 'git add RELEASENOTES.md'
            sh "git commit -m 'Restoring RELEASENOTES.md'"

            // Push
            script {
              sshagent(['realm-ci-ssh']) {
                // Push with tags
                sh "git push --tags origin HEAD"
              }
            }
          }
        }

        stage('Package') {
          steps {
            // Package and archive the archive
            script {
              packAndArchive()
            }
            // TODO: Upload the archive to NPM
          }
        }

        stage('Publish') {
          input {
            message "Do you want to publish this to GitHub and NPM?"
            id "publish"
            ok "Publish!"
          }
          steps {
            // TODO: Push archive to NPM
            sh 'echo "Publish!"'
          }
        }
      }
    }
  }
}
