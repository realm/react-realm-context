#!groovy

@Library('realm-ci') _

node('docker') {
  stage('Checkout') {
    checkout scm
  }

  stage('Install, build and package') {
    image = buildDockerEnv("ci/react-realm-context:building")
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
      sh './utils/via-nvm.sh npm install'
      sh './utils/via-nvm.sh npm run build'
      sh './utils/via-nvm.sh npm pack'
    }
  }

  stage('Test') {
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
      sh './utils/via-nvm.sh npm run test:ci'
    }
  }
}
