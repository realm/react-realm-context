#!groovy

@Library('realm-ci') _

// Running in a bash shell with --login
def run = { cmd -> sh "bash -c \"source /home/jenkins/.nvm/nvm.sh; $cmd\"" }

node('docker') {
  stage('Checkout') {
    checkout scm
  }

  stage('Install, build and package') {
    image = buildDockerEnv("ci/react-realm-context:building")
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
      run 'npm install'
      try {
        run 'npm run lint:ts'
      } catch (err) {
        error "Linting failed"
      }
      run 'npm run build'
      run 'npm pack'
      archiveArtifacts 'react-realm-context-*.tgz'
    }
  }

  stage('Test') {
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
      try {
        // Run the tests and report using the junit reporter
        run 'npm run test:ci'
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
  }
}
