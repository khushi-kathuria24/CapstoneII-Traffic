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
  parameters {
    string(name: 'APP_HOST_PORT', defaultValue: '5001', description: 'Unused host port for the TrafficNexus application.')
  }
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
        script {
          def appHostPort = (params.APP_HOST_PORT ?: '5001').trim()
          if (!(appHostPort ==~ /[0-9]{1,5}/) || appHostPort.toInteger() < 1024 || appHostPort.toInteger() > 65535) {
            error('APP_HOST_PORT must be an unused port between 1024 and 65535.')
          }
          env.APP_HOST_PORT = appHostPort
          env.CLIENT_URL = "http://localhost:${appHostPort}"
          env.GOOGLE_CALLBACK_URL = "${env.CLIENT_URL}/auth/google/callback"
          withCredentials([
            string(credentialsId: 'traffic-google-client-id', variable: 'GOOGLE_CLIENT_ID'),
            string(credentialsId: 'traffic-google-client-secret', variable: 'GOOGLE_CLIENT_SECRET'),
            string(credentialsId: 'traffic-session-secret', variable: 'SESSION_SECRET')
          ]) {
            if (!env.SESSION_SECRET?.trim()) {
              error('The traffic-session-secret Jenkins credential must not be empty.')
            }
            runCommand('docker compose -p traffic-violation up -d --wait --wait-timeout 120 --no-build')
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
