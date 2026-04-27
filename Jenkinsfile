pipeline {
    agent any

    environment {
        MONGO_URI = credentials('mongo_uri')
        DATABASE_NAME = credentials('mongo_db_name')
        COLLECTION_NAME = credentials('mongo_collection')
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

                # Backend fix: container runs on 8000, not 5000
                docker run -d -p 5000:8000 \
                -e MONGO_URI=$MONGO_URI \
                -e DATABASE_NAME=$DATABASE_NAME \
                -e COLLECTION_NAME=$COLLECTION_NAME \
                --name backend backend

                # Frontend fix: Vite runs on 5173 (dev mode)
                docker run -d -p 80:80 \
                --name frontend frontend
                '''
            }
        }
    }
}
