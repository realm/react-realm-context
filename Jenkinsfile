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
      run 'npm run build'
      run 'npm pack'
    }
  }

  stage('Test') {
    image.inside("-e HOME=${env.WORKSPACE} -v /etc/passwd:/etc/passwd:ro") {
      run 'npm run test:ci'
    }
  }
}
