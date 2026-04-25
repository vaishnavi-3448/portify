pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo_uri')
    }

    stages {

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

                docker run -d -p 5000:5000 \
                -e MONGO_URI=$MONGO_URI \
                --name backend backend

                docker run -d -p 80:80 \
                --name frontend frontend
                '''
            }
        }
    }
}