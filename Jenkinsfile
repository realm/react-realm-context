#!groovy

@Library('realm-ci') _

node('docker') {
  stage('Checkout') {
    checkout scm
  }

  stage('Install, build and package') {
    image = buildDockerEnv("ci/react-realm-context:building")
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
      sh 'npm install'
      try {
        sh 'npm run lint:ts'
      } catch (err) {
        error "Linting failed"
      }
      sh 'npm run build'
      sh 'npm pack'
      archiveArtifacts 'react-realm-context-*.tgz'
    }
  }

  stage('Test') {
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
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
  }
}
