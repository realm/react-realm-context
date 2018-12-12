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
      steps {
        sh 'npm run test:ci'
      }
      post {
        always {
          junit(
            allowEmptyResults: true,
            keepLongStdio: true,
            testResults: 'test-results.xml'
          )
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
        parameters {
          choice(
            name: 'NEXT_VERSION',
            choices: ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'],
            description: 'What version should this release have?',
          )
        }
      }
      stages {
        stage('Change version') {
          steps {
            script {
              nextVersion = sh(
                script: "npm version --no-git-tag-version ${NEXT_VERSION}",
                returnStdout: true,
              ).trim()
              setBuildName(nextVersion);
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
            // Ignore the prepack running "build" again
            sh 'npm pack --ignore-scripts'
          }
        }
      }
    }
  }
}
