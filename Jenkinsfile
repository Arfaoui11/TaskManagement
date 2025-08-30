
import java.text.SimpleDateFormat

pipeline {
    environment {
        registry = "mahdijr/devops-tp"
        registryCredential = 'dockerhub-token'
        dockerImageSpring = 'mahdijr/app-server:2.0'
        dockerImageAngular = 'mahdijr/app-client:2.0'
        dockerImage = ''
    }
    agent any
    stages {


        stage('Checkout GIT'){
                      steps{
                          echo 'Pulling...';
                          git branch: 'master',
                          url: 'https://github.com/Arfaoui11/TaskManagement.git';
                      }
        }

         stage("Clean and Build package"){
                            steps {
                                sh 'mvn -f /var/lib/jenkins/workspace/Task_Management/Back-PFE-master-develop/pom.xml clean package'
                            }
                        }

          /*  stage("Test (Junit && Mockito) And Build The Package with Kubernetes and Ansible"){
                            steps {
                                sh 'ansible-playbook ansible-playbook.yml'
                            }
                        }


              stage("Maven Clean And  Package "){
                    steps {
                        sh 'ansible-playbook ansible-docker-compose.yml'
                    }
                }

               stage("Tests JUnit / Mockito / SonarQube && Deploy artifacts with Nexus && DockerHub avec Ansible "){
                                     steps {
                                       sh 'ansible-playbook ansible-test.yml'
                                     }
                          }*/

                               stage('Building our image') {
                                      steps {
                                          script {
                                              dockerImage = docker.build registry + ":$BUILD_NUMBER"
                                          }
                                      }
                                  }

                                  stage('Deploy our image') {
                                      steps {
                                          script {
                                              docker.withRegistry( '', registryCredential ) {
                                                  dockerImage.push()
                                              }
                                          }
                                      }
                                  }

          /*  stage("Build the package"){
             steps {
               sh 'docker-compose up -d --build'
             }
        } */


    }


}
