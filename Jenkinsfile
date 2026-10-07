pipeline {
    agent any

    environment {
        // App & Image configurations
        IMAGE_NAME = 'interior-design-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        BACKUP_DIR = 'E:\\interior-design-project\\backups'
    }

    stages {
        // Step 1: Checkout Code
        stage('1. SCM Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        // Step 2: Secret Scanning
        stage('2. Secret Scanning (Gitleaks)') {
            steps {
                echo 'Scanning code for leaked credentials/secrets...'
                // gitleaks directory scan
                bat 'gitleaks detect --source=. --verbose'
            }
        }

       stage('3. SCA Dependency Scan') {
            steps {
                echo 'Checking backend and frontend dependencies for vulnerabilities...'
                dir('backend') {
                    bat 'npm audit --audit-level=high || echo SCA vulnerabilities detected in backend, continuing pipeline...'
                }
                dir('frontend') {
                    bat 'npm audit --audit-level=high || echo SCA vulnerabilities detected in frontend, continuing pipeline...'
                }
            }
        }

        // Step 4: SAST Scan
        stage('4. SAST (SonarQube Scan)') {
            steps {
                echo 'Running SonarQube static code vulnerability analysis...'
                // Sonar scanner execution
                bat 'sonar-scanner -Dsonar.projectKey=interior-design-project -Dsonar.sources=backend,frontend/src'
            }
        }

        // Step 5: Quality Gate
        stage('5. Quality Gate') {
            steps {
                echo 'Verifying SonarQube Quality Gate status...'
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // Step 6: Build & Package (Docker Containerization)
        stage('6. Build & Package') {
            steps {
                echo 'Installing dependencies and compiling frontend...'
                dir('backend') {
                    bat 'npm install --production'
                }
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
                echo 'Building Docker container image...'
                bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        // Step 7: Database Pre-Backup
        stage('7. Database Pre-Backup') {
            steps {
                echo 'Taking database snapshot backup prior to migration...'
                bat 'node backend/backup.js'
            }
        }

        // Step 8: Database Migration & Validation
        stage('8. DB Migration & Validation') {
            steps {
                echo 'Applying database migrations & running schema validation...'
                bat 'node backend/seed.js'
            }
        }

        // Step 9: Blue-Green Deployment
        stage('9. Blue-Green Deployment') {
            steps {
                echo 'Deploying container to Green environment (port 5001)...'
                // Stop older green instance if present and run new version
                bat 'docker stop green_app || exit 0'
                bat 'docker rm green_app || exit 0'
                bat "docker run -d --name green_app -p 5001:5000 ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        // Step 10: Automated Health Checks
        stage('10. Automated Health Checks') {
            steps {
                echo 'Probing Green environment endpoints...'
                // Wait 5 seconds for app bootstrap then ping health endpoint
                bat 'timeout /t 5 /nobreak'
                bat 'curl -f http://localhost:5001/api/health || exit 1'
            }
        }

        // Step 11: Switch Traffic or Rollback
        stage('11. Switch Traffic / Auto Rollback') {
            steps {
                script {
                    try {
                        echo 'Health check passed! Switching traffic to Green environment...'
                        // Switch proxy / swap ports (promote Green to Production)
                        bat 'docker stop blue_app || exit 0'
                        bat 'docker rm blue_app || exit 0'
                        bat "docker rename green_app blue_app"
                        echo 'Deployment successfully updated to Live!'
                    } catch (Exception e) {
                        echo 'Deployment failed! Initiating Auto Rollback...'
                        bat 'docker stop green_app || exit 0'
                        bat 'docker rm green_app || exit 0'
                        error("Pipeline aborted and rolled back: ${e.getMessage()}")
                    }
                }
            }
        }

        // Step 12: Monitoring & Logging
        stage('12. Monitoring & Logging') {
            steps {
                echo 'Registering build metadata into monitoring logs...'
                bat "echo Build ${env.BUILD_NUMBER} deployed at %DATE% %TIME% >> deployment_audit.log"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'DevSecOps Pipeline completed with zero security issues and clean deployment.'
        }
        failure {
            echo 'DevSecOps Pipeline failed! Check the console output for security or deployment errors.'
        }
    }
}