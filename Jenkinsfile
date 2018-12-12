#!groovy

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
          // Remove any archives produced by the tests
          sh 'rm react-realm-context-*.tgz'
        }
      }
    }

    stage('Bump version, package and publish') {
      /*
      when {
        branch 'master'
      }
      */
      input {
        message "Change version, package and publish?"
        id "package"
      }
      stages {
        stage('Change version') {
          steps {
            // Change the version in the package.json and package-lock.json
            script {
              // Determine the upcoming release type
              nextVersionType = sh(
                script: "node ./scripts/next-version.js",
                returnStdout: true,
              ).trim()
              // Ask NPM to update the package json and lock and read the next version
              nextVersion = sh(
                script: "npm version --no-git-tag-version ${nextVersionType}",
                returnStdout: true,
              ).trim()
              // Set the build name
              currentBuild.displayName = nextVersion
            }
            // Append the RELEASENOTES to the CHANGELOG
            script {
              // Read the release notes and replace in any variables
              releaseNotes = readFile 'RELEASENOTES.md'
              releaseNotes = releaseNotes
                .replaceAll("\\{PREVIOUS_VERSION\\}", "v${currentVersion}")
                .replaceAll("\\{CURRENT_VERSION\\}", nextVersion)

              // Get todays date
              today = new Date().format('yyyy-MM-dd')
              // Append the release notes to the change log
              changeLog = readFile 'CHANGELOG.md'
              changeLog = "# Release ${nextVersion.substring(1)} (${today})\n\n${releaseNotes}\n\n${changeLog}"
              writeFile file: 'CHANGELOG.md', text: changeLog
            }
          }
        }
        stage('Package') {
          steps {
            // Ignore the prepack running "build" again
            sh 'npm pack --ignore-scripts'
            archiveArtifacts 'react-realm-context-*.tgz'
          }
        }
        stage('Publish') {
          input {
            message "Publish?"
            id "publish"
          }
          steps {
            // TODO: Push archive to NPM
            // Create a draft release on GitHub
            script {
              withCredentials([
                string(credentialsId: 'github-release-token', variable: 'GITHUB_TOKEN')
              ]) {
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
            // Commit to git and push to GitHub
            script {
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

              sshagent(['realm-ci-ssh']) {
                // Push with tags
                sh "git push --tags origin HEAD"
              }
            }
          }
        }
      }
    }
  }
}
