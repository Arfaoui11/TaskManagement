pipeline {
    agent any
    environment {
        registryCredential = 'dockerhub-token'
        dockerHubNamespace = "mahdijr"   // your Docker Hub namespace (username or org)
        version = "2.0"
    }

    stages {
        stage('Checkout GIT') {
            steps {
                echo 'Pulling...'
                git branch: 'master',
                    url: 'https://github.com/Arfaoui11/TaskManagement.git'
            }
        }

        stage("Clean and Build backend package") {
            steps {
                sh 'mvn -f Back-PFE-master-develop/pom.xml clean package -DskipTests'
            }
        }

        stage("Build Docker Images") {
            steps {
                script {
                    // ✅ Fix: service name is part of image name, not after ":version"
                    authImage    = docker.build("${dockerHubNamespace}/app-auth-service:${version}", "./Back-PFE-master-develop/auth-service")
                    eurekaImage  = docker.build("${dockerHubNamespace}/app-eureka-server:${version}", "./Back-PFE-master-develop/eureka-server")
                    gatewayImage = docker.build("${dockerHubNamespace}/app-gateway-service:${version}", "./Back-PFE-master-develop/gateway-service")
                    kafkaImage   = docker.build("${dockerHubNamespace}/app-kafka-service:${version}", "./Back-PFE-master-develop/kafka-service")
                    projetImage  = docker.build("${dockerHubNamespace}/app-projet-service:${version}", "./Back-PFE-master-develop/projet-service")
                    userImage    = docker.build("${dockerHubNamespace}/app-user-service:${version}", "./Back-PFE-master-develop/user-service")

                    // Frontend
                    frontendImage = docker.build("${dockerHubNamespace}/app-client:${version}", "./Front-PFE-develop")
                }
            }
        }

        stage("Push Docker Images") {
            steps {
                script {
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
