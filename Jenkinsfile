#!groovy

@Library('realm-ci') _

node('docker') {
  agent {
    docker {
      image buildDockerEnv("ci/react-realm-context:building")
      args "-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro"
    }
  }

  stage('Checkout') {
    checkout scm
  }

  stage('Install, build and package') {
    sh 'npm install'
    try {
      sh 'npm run lint:ts'
    } catch (err) {
      error "Linting failed"
    }
    sh 'npm run build'
  }

  stage('Test') {
    try {
      // Run the tests and report using the junit reporter
      sh 'npm run test:ci'
    } catch (err) {
      error "Tests failed - see results on CI"
    } finally {
      junit(
        allowEmptyResults: true,
        keepLongStdio: true,
        testResults: 'test-results.xml'
      )
    }
  }

  stage('Release: Change version, package & publish') {
    when {
      branch 'master'
    }
    input {
      message "Change version, package and publish?"
      id "release"
      parameters {
        choice(
          name: 'NEXT_VERSION',
          choices: ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'],
          description: 'What version should this release have?',
        )
      }
    }
    steps {
      stage('Change version') {
        // Change the version
        sh "npm version ${NEXT_VERSION}"
        // TODO: Commit, tag and push to GitHub
      }
      stage('Package') {
        sh 'npm pack'
        archiveArtifacts 'react-realm-context-*.tgz'
      }
      stage('Publish') {
        // TODO: Publish artifact to NPM
      }
    }
  }
}
