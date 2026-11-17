def runCommand(String command, boolean allowFailure = false) {
  if (isUnix()) {
    if (allowFailure) {
      sh(script: command, returnStatus: true)
    } else {
      sh command
    }
  } else {
    if (allowFailure) {
      bat(script: command, returnStatus: true)
    } else {
      bat command
    }
  }
}

pipeline {
  agent any
  environment {
    IMAGE_NAME = 'intelligent-traffic-violation-system'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install and test') {
      steps {
        script {
          runCommand('npm install')
          runCommand('npm run install:all')
          runCommand('npm test')
          runCommand('npm run build')
        }
      }
    }
    stage('Build Docker image') {
      steps {
        script {
          runCommand("docker build -t ${env.IMAGE_NAME}:${env.BUILD_NUMBER} .")
        }
      }
    }
    stage('Deploy') {
      steps {
        withCredentials([
          string(credentialsId: 'traffic-google-client-id', variable: 'GOOGLE_CLIENT_ID'),
          string(credentialsId: 'traffic-google-client-secret', variable: 'GOOGLE_CLIENT_SECRET'),
          string(credentialsId: 'traffic-session-secret', variable: 'SESSION_SECRET'),
          string(credentialsId: 'traffic-client-url', variable: 'CLIENT_URL'),
          string(credentialsId: 'traffic-google-callback-url', variable: 'GOOGLE_CALLBACK_URL')
        ]) {
          script {
            runCommand('docker compose down', true)
            runCommand('docker compose up -d')
          }
        }
      }
    }
  }
  post {
    always {
      script {
        runCommand('docker image prune -f --filter "until=24h"', true)
      }
    }
  }
}
