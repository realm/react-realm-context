#!groovy

@Library('realm-ci') _

node('docker') {
  stage('Checkout') {
    checkout scm
  }

  stage('Install, build and package') {
    sh 'npm install'
    sh 'npm run build'
    sh 'npm pack'
  }

  stage('Test') {
    sh 'npm test'
  }
}
