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

def stopNgrok() {
  def cleanupCommand = 'node -e "const fs=require(\'node:fs\');if(fs.existsSync(\'ngrok.pid\')){const pid=Number(fs.readFileSync(\'ngrok.pid\',\'utf8\'));try{process.kill(pid)}catch(error){if(error.code!==\'ESRCH\')throw error}fs.unlinkSync(\'ngrok.pid\')}"'
  if (runCommand(cleanupCommand, true) != 0) {
    echo 'Warning: unable to stop the previous ngrok process.'
  }
}

pipeline {
  agent any
  parameters {
    string(name: 'APP_HOST_PORT', defaultValue: '5001', description: 'Unused host port for the TrafficNexus application.')
    string(name: 'NGROK_DOMAIN', defaultValue: '', description: 'Optional reserved ngrok domain, such as traffic-example.ngrok-free.app.')
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
    stage('Start ngrok tunnel') {
      steps {
        script {
          def appHostPort = (params.APP_HOST_PORT ?: '5001').trim()
          if (!(appHostPort ==~ /[0-9]{1,5}/) || appHostPort.toInteger() < 1024 || appHostPort.toInteger() > 65535) {
            error('APP_HOST_PORT must be an unused port between 1024 and 65535.')
          }
          env.APP_HOST_PORT = appHostPort
          def ngrokDomain = (params.NGROK_DOMAIN ?: '').trim()
          if (ngrokDomain && !(ngrokDomain ==~ /[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*/)) {
            error('NGROK_DOMAIN must be a hostname without a scheme or path.')
          }
          env.NGROK_DOMAIN = ngrokDomain
          stopNgrok()
          withCredentials([string(credentialsId: 'traffic-ngrok-authtoken', variable: 'NGROK_AUTHTOKEN')]) {
            runCommand('node -e "const {spawn}=require(\'node:child_process\');const fs=require(\'node:fs\');const log=fs.openSync(\'ngrok.log\',\'a\');const args=[\'http\',process.env.APP_HOST_PORT,\'--log=stdout\',\'--log-format=json\'];if(process.env.NGROK_DOMAIN)args.push(\'--url\',\'https://\'+process.env.NGROK_DOMAIN);const child=spawn(\'ngrok\',args,{detached:true,stdio:[\'ignore\',log,log],env:{...process.env,JENKINS_NODE_COOKIE:\'dontKillMe\'}});child.unref();if(!child.pid)throw new Error(\'Unable to start ngrok.\');fs.writeFileSync(\'ngrok.pid\',String(child.pid));"')
            def tunnelUrlCommand = 'node -e "const fs=require(\'node:fs\');const deadline=Date.now()+60000;async function wait(){while(Date.now()<deadline){try{const response=await fetch(\'http://127.0.0.1:4040/api/tunnels\');if(response.ok){const data=await response.json();const tunnel=data.tunnels.find(item=>item.public_url.startsWith(\'https://\'));if(tunnel){process.stdout.write(tunnel.public_url);return}}}catch(error){}await new Promise(resolve=>setTimeout(resolve,1000))}console.error(\'Timed out waiting for ngrok tunnel.\');if(fs.existsSync(\'ngrok.log\'))console.error(fs.readFileSync(\'ngrok.log\',\'utf8\'));process.exit(1)}wait()"'
            def tunnelUrl = isUnix()
              ? sh(script: tunnelUrlCommand, returnStdout: true).trim()
              : bat(script: "@echo off\r\n${tunnelUrlCommand}", returnStdout: true).trim()
            if (!(tunnelUrl ==~ /https:\/\/[A-Za-z0-9.-]+/)) {
              error('ngrok returned an invalid public HTTPS URL.')
            }
            env.CLIENT_URL = tunnelUrl
            env.GOOGLE_CALLBACK_URL = "${tunnelUrl}/auth/google/callback"
            echo "Public application URL: ${env.CLIENT_URL}"
          }
        }
      }
    }
    stage('Deploy') {
      steps {
        script {
          def sessionSecretCommand = "node -e \"process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))\""
          if (isUnix()) {
            env.SESSION_SECRET = sh(script: sessionSecretCommand, returnStdout: true).trim()
          } else {
            env.SESSION_SECRET = bat(script: "@echo off\r\n${sessionSecretCommand}", returnStdout: true).trim()
          }
          if (!(env.SESSION_SECRET ==~ /[0-9a-f]{96}/)) {
            error('Unable to generate a valid session secret.')
          }
          withCredentials([
            string(credentialsId: 'traffic-google-client-id', variable: 'GOOGLE_CLIENT_ID'),
            string(credentialsId: 'traffic-google-client-secret', variable: 'GOOGLE_CLIENT_SECRET')
          ]) {
            runCommand('docker compose -p traffic-violation up -d --wait --wait-timeout 120 --no-build')
          }
        }
      }
    }
  }
  post {
    unsuccessful {
      script {
        stopNgrok()
      }
    }
    always {
      script {
        runCommand('docker image prune -f --filter "until=24h"', true)
      }
    }
  }
}
