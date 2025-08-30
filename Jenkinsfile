import java.text.SimpleDateFormat

pipeline {
    agent any
    environment {
        registryCredential = 'dockerhub-token'
        dockerHubNamespace = "mahdijr"   // your Docker Hub namespace (username or org)
        springImage = "app-server"
        angularImage = "app-client"
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
                    // Build Spring Boot backend auth-service image
                    authImage = docker.build("${dockerHubNamespace}/${springImage}:${version}", "./Back-PFE-master-develop/auth-service")
                    eurekaImage = docker.build("${dockerHubNamespace}/${springImage}:${version}", "./Back-PFE-master-develop/eureka-server")
                    gatewayImage = docker.build("${dockerHubNamespace}/${springImage}:${version}", "./Back-PFE-master-develop/gateway-service")
                    kafkaImage = docker.build("${dockerHubNamespace}/${springImage}:${version}", "./Back-PFE-master-develop/kafka-service")
                    projetImage = docker.build("${dockerHubNamespace}/${springImage}:${version}", "./Back-PFE-master-develop/projet-service")
                    userImage = docker.build("${dockerHubNamespace}/${springImage}:${version}", "./Back-PFE-master-develop/user-service")

                    // Build Angular frontend image
                    frontendImage = docker.build("${dockerHubNamespace}/${angularImage}:${version}", "./Front-PFE-develop")
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
