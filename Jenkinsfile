pipeline {
    agent any
    environment {
        registryCredential = 'dockerhub-token'
        dockerHubNamespace = "amal004"   // ton namespace Docker Hub
        version = "2.0"
        scannerHome = tool 'SonarQubeScanner'  // nom défini dans Global Tool Config
    }

    stages {
        stage('Checkout Source Code from GitHub') {
            steps {
                echo '📥 Pulling source code from GitHub repository...'
                git branch: 'master',
                    url: 'https://github.com/Arfaoui11/TaskManagement.git'
            }
        }

        stage("Clean and Package Backend with Maven") {
            steps {
                echo '🧹 Cleaning and packaging backend (Spring Boot microservices)...'
                sh 'mvn -f Back-PFE-master-develop/pom.xml clean package -DskipTests'
            }
        }

           stage("Maven Test with SonarQube") {
                    steps {
                        echo '🔍 Running SonarQube analysis...'
                        withSonarQubeEnv('MySonarQube') {   // "MySonarQube" = nom configuré dans Jenkins
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=taskmanagement \
                                -Dsonar.sources=./Back-PFE-master-develop \
                                -Dsonar.java.binaries=./Back-PFE-master-develop/target \
                                -Dsonar.host.url=http://sonarqube:9000 \
                                -Dsonar.login=\$SONAR_TOKEN
                            """
                        }
                    }
           }

        stage("Build Local Environment with Docker Compose") {
            steps {
                echo '🐳 Building local environment with docker-compose...'
                sh 'docker-compose up -d --build'
            }
        }

        stage("Build Docker Images for Microservices") {
            steps {
                script {
                    echo '🐳 Building Docker images for backend microservices...'
                    authImage    = docker.build("${dockerHubNamespace}/app-auth-service:${version}", "./Back-PFE-master-develop/auth-service")
                    eurekaImage  = docker.build("${dockerHubNamespace}/app-eureka-server:${version}", "./Back-PFE-master-develop/eureka-server")
                    gatewayImage = docker.build("${dockerHubNamespace}/app-gateway-service:${version}", "./Back-PFE-master-develop/gateway-service")
                    kafkaImage   = docker.build("${dockerHubNamespace}/app-kafka-service:${version}", "./Back-PFE-master-develop/kafka-service")
                    projetImage  = docker.build("${dockerHubNamespace}/app-projet-service:${version}", "./Back-PFE-master-develop/projet-service")
                    userImage    = docker.build("${dockerHubNamespace}/app-user-service:${version}", "./Back-PFE-master-develop/user-service")

                    echo '🌐 Building Docker image for frontend (Angular app)...'
                    frontendImage = docker.build("${dockerHubNamespace}/app-client:${version}", "./Front-PFE-develop")
                }
            }
        }

        stage("Push Docker Images to Docker Hub") {
            steps {
                script {
                    echo '🚀 Pushing Docker images to Docker Hub...'
                    docker.withRegistry('', registryCredential) {
                        authImage.push()
                        eurekaImage.push()
                        gatewayImage.push()
                        kafkaImage.push()
                        projetImage.push()
                        userImage.push()
                        frontendImage.push()
                    }
                }
            }
        }
    }
}
