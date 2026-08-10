#!/bin/bash

echo "🚀 Starting the complete EcoGest test suite..."

# 1. Run Jest Tests (Unit, API, and UI)
echo "🧪 [1/2] Running functional tests (Jest)..."
npm run test
JEST_EXIT=$?

# 2. Run Performance Tests (JMeter)
echo "⚡ [2/2] Running performance tests (JMeter)..."
npm run test:perf
JMETER_EXIT=$?

# 3. Open the JMeter report in the browser
echo "📊 Opening the JMeter performance report..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open tests/performance/report/index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open tests/performance/report/index.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  start tests/performance/report/index.html
else
  echo "⚠️ OS not recognized. Please open the file manually: tests/performance/report/index.html"
fi

# 4. Serve and open Allure Dashboard
echo "📈 Opening the interactive Allure dashboard..."
npx allure serve tests/allure-results
