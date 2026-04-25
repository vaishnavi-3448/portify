pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/vaishnavi-3448/portify.git'
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker build -t backend ./backend'
                sh 'docker build -t frontend ./frontend'
            }
        }

        stage('Run Containers') {
            steps {
                sh '''
                docker rm -f backend || true
                docker rm -f frontend || true

                docker run -d -p 5000:5000 --name backend backend
                docker run -d -p 80:80 --name frontend frontend
                '''
            }
        }

    }
}