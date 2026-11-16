pipeline {
  agent any
  environment {
    IMAGE_NAME = 'intelligent-traffic-violation-system'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install and test') {
      steps {
        sh 'npm install'
        sh 'npm run install:all'
        sh 'npm test'
        sh 'npm run build'
      }
    }
    stage('Build Docker image') {
      steps { sh 'docker build -t $IMAGE_NAME:$BUILD_NUMBER .' }
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
          sh 'docker compose down || true'
          sh 'docker compose up -d --build'
        }
      }
    }
  }
  post {
    always { sh 'docker image prune -f || true' }
  }
}
