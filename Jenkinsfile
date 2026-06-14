pipeline {
    agent any

    environment {
        // Define common environmental variables
        BASE_URL      = 'http://localhost:5173'
        API_URL       = 'http://localhost:3000'
        JIRA_XRAY_CLIENT_ID = credentials('jira-xray-client-id')
        JIRA_XRAY_CLIENT_SECRET = credentials('jira-xray-client-secret')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies for test suite, backend, and frontend...'
                sh 'npm install'
                sh 'cd backend && npm install'
                sh 'cd frontend && npm install'
            }
        }

        stage('Start Services') {
            steps {
                echo 'Starting Backend and Frontend services in background...'
                // Start services in background and write logs to file
                sh 'cd backend && npm run dev > ../backend.log 2>&1 &'
                sh 'cd frontend && npm run dev -- --host > ../frontend.log 2>&1 &'
                
                echo 'Waiting for services to become healthy...'
                // Sleep or poll to ensure services are up
                sleep time: 10, unit: 'SECONDS'
                sh 'curl --retry 5 --retry-connrefused http://localhost:3000/api/health'
                sh 'curl --retry 5 --retry-connrefused http://localhost:5173'
            }
        }

        stage('Unit Testing') {
            steps {
                echo 'Running Backend and Frontend Unit Tests...'
                sh 'npm run test:unit'
            }
        }

        stage('API Testing') {
            steps {
                echo 'Running API Integration Tests...'
                sh 'npm run test:api'
            }
        }

        stage('UI Testing (Selenium Headless)') {
            environment {
                SELENIUM_HEADLESS = 'true'
            }
            steps {
                echo 'Running E2E UI Tests with Selenium WebDriver...'
                sh 'npm run test:ui'
            }
        }

        stage('Performance Testing') {
            steps {
                echo 'Running Performance Load Tests using Apache JMeter...'
                // Run load test and capture results
                sh 'npm run test:perf'
            }
        }

        stage('Upload to Jira Xray') {
            steps {
                echo 'Uploading Test Execution Results to Jira Xray...'
                sh 'npm run xray-upload'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up background processes...'
            // Stop any running Node/Vite processes on ports 3000/5173
            sh "lsof -t -i:3000 | xargs kill -9 || true"
            sh "lsof -t -i:5173 | xargs kill -9 || true"
            
            echo 'Archiving test results, screenshots & JMeter reports...'
            archiveArtifacts artifacts: '**/allure-results/*, **/screenshots/*.png, **/tests/performance/results.jtl, **/tests/performance/report/**', allowEmptyArchive: true
            
            echo 'Publishing Allure Report...'
            allure includeProperties: false, jdk: '', results: [[path: 'tests/allure-results']]
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check allure reports and logs.'
        }
    }
}
