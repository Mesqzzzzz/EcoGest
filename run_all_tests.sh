#!/bin/bash

echo "🚀 A iniciar a suite completa de testes EcoGest..."

# 1. Correr Testes do Jest (Unitários, API e UI)
echo "🧪 [1/2] A executar os testes funcionais (Jest)..."
npm run test
JEST_EXIT=$?

# 2. Correr Testes de Performance (JMeter)
echo "⚡ [2/2] A executar os testes de performance (JMeter)..."
npm run test:perf
JMETER_EXIT=$?

# 3. Abrir o relatório do JMeter no browser
echo "📊 A abrir o relatório de performance do JMeter..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open tests/performance/report/index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open tests/performance/report/index.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  start tests/performance/report/index.html
else
  echo "⚠️ OS não reconhecido. Abra manualmente o ficheiro: tests/performance/report/index.html"
fi

# 4. Servir e abrir o Allure
echo "📈 A abrir o dashboard interativo do Allure..."
npx allure serve tests/allure-results
