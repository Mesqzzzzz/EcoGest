# 📖 Automated Test Suite Guide — EcoGest

This document provides a detailed overview of the architecture, testing tools, file structures, and internal mechanics of the automated test suite designed for the **EcoGest** platform.

---

## 🛠️ 1. Technologies & Tools

The test suite is structured to remain decoupled from the main business logic of the system, utilizing industry-standard technologies:

1.  **[Jest](https://jestjs.io/) (Test Runner & Assertions)**
    *   **Role**: The primary engine for running functional tests (Unit, API, and UI). Manages the test lifecycle (`beforeAll`, `beforeEach`, `afterAll`, etc.) and performs assertions using `expect`.
2.  **[Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/) (UI Automation)**
    *   **Role**: Simulates a real user interacting with the Chrome browser. It is used to test the graphical user interface, submit forms, click elements, resize viewports, and validate end-to-end user flows.
3.  **[Supertest](https://github.com/ladjs/supertest) (API Integration Testing)**
    *   **Role**: Executes real HTTP requests to the backend API endpoints without opening the frontend interface. Used to validate HTTP status codes, JSON response payloads, and route security.
4.  **[Apache JMeter](https://jmeter.apache.org/) (Load & Performance Testing)**
    *   **Role**: A Java-based tool used to simulate multiple concurrent users. Performs sequential and parallel API requests to evaluate stability, response times, and throughput under stress.
5.  **[Allure Reports](https://allurereport.org/) (Visual Reports)**
    *   **Role**: Generates interactive HTML reports, embedding automatic failure screenshots for UI tests and detailed test run metrics.
6.  **[Jira Xray Cloud API](https://docs.getxray.app/display/XRAYCLOUD/Xray+Cloud+API)**
    *   **Role**: Facilitates CI/CD integration by sending automated test execution results directly to their mapped test keys in Jira (e.g., `PE-1` to `TC020`).

---

## 📁 2. Folder Structure & File Purpose

Below is the layout of files within the `/tests` directory and at the project root:

```bash
EcoGest/
├── package.json              # Test suite dependencies and script shortcuts
├── Jenkinsfile               # CI/CD pipeline for Jenkins automation
└── tests/
    ├── README.md             # This comprehensive test guide
    ├── jest.config.js        # Global Jest and Allure Reports settings
    │
    ├── unit/
    │   └── auth.test.js      # Unit tests for isolated security logic (encryption and JWT)
    │
    ├── api/
    │   └── api.test.js       # Integrated tests for API routes and HTTP security
    │
    ├── ui/
    │   ├── pages/            # Page Object Model (POM) implementation
    │   │   ├── base.page.js  # Base class with reusable Selenium utility methods
    │   │   ├── login.page.js # Selectors and actions for the Login page
    │   │   └── register.page.js # Selectors and actions for the Register page
    │   └── specs/
    │       └── ui.test.js    # End-to-End (E2E) interface and responsiveness tests
    │
    ├── performance/
    │   └── load_test.jmx     # Apache JMeter load and performance test plan
    │
    └── xray/
        └── xray_uploader.js  # Connector for importing execution results into Jira Xray
```

### 📝 Detailed Description of Files

#### Configuration & General files:
*   **`package.json`**: Definese test dependencies (`jest`, `selenium-webdriver`, `supertest`, `allure-jest`, `axios`, `bcryptjs`, `jsonwebtoken`) and scripts: `npm test`, `npm run test:unit`, `npm run test:api`, `npm run test:ui`, `npm run test:perf`, `npm run test:all` (runs everything and opens reports) and `npm run jira-upload` / `npm run xray-upload`.
*   **`tests/jest.config.js`**: Sets up the test environment using `allure-jest/node`, configures the output report directory (`./tests/allure-results`), and establishes a default timeout of 60 seconds per test.
*   **`Jenkinsfile`**: Declarative pipeline which pulls from git, installs dependencies, spins up backend and frontend, executes test suites sequentially, runs JMeter, uploads results to Jira, and generates the Allure dashboard.
*   **`run_all_tests.sh`**: A Bash utility script that executes all local tests, collects reports, and opens them in the browser.

#### 🔐 Unit Tests (`tests/unit/`):
*   **`auth.test.js`**: Validates isolated Node.js security utilities (database-free).
    *   **Scope**: Confirms that `bcryptjs` password hashing works correctly, and verifies that `jsonwebtoken` signatures and validation logic handle valid payloads and reject invalid secret keys.

#### 🌐 API & Requirement Tests (`tests/api/`):
*   **`api.test.js`**: Executable verification suite covering the **14 Functional Requirements (FRs)** and **10 Non-Functional Requirements (NFRs)** of EcoGest.
    *   **Scope**:
        *   **FR1 to FR14 & FR21**: Covers complete user registration, login, profile updates, role/status modifications, project creation, coordinator assignments, activity updates, registrations, meeting scheduling, and report statistics generation.
        *   **NFR1 to NFR10**: Validates non-functional performance guarantees (API response < 800ms), scalability, JWT expiration, middlewares, bcrypt hashing, responsive layout checks, availability, MVC pattern architecture, and error handling.

#### 🖥️ UI Tests (`tests/ui/`):
Built on the **Page Object Model (POM)** pattern, keeping element selectors and page actions separate from test assertions.
*   **`pages/base.page.js`**: Initializes Chrome (supporting `--headless` execution and window dimensions). Contains helper methods (`find`, `click`, `write`, `getText`) with explicit waits of up to 10 seconds, and includes logic to take a screenshot and save it to `tests/screenshots/` if a test fails.
*   **`pages/login.page.js`**: Houses login selectors (`email`, `password`, `submit` button) and provides the `login(email, pass)` helper.
*   **`pages/register.page.js`**: Maps the registration form and provides the `register(name, email, pass, confirmPass)` helper.
*   **`specs/ui.test.js`**: Implements the actual UI test cases:
    *   **Isolation**: A `beforeEach` hook clears the `localStorage` and cookies to ensure sessions do not pollute subsequent tests.
    *   **Cases**:
        *   `TC001`: Registers a random user and ensures redirection to `/dashboard`.
        *   `TC002`: Authenticates as a coordinator and verifies access.
        *   `TC003`: Navigates to the user profile and validates update inputs.
        *   `TC004`: Logs in as an administrator to check project creation elements.
        *   `TC016/TC017`: Resizes the window to mobile dimensions (`375x812`) to verify the responsive login layout.

#### ⚡ Performance Tests (`tests/performance/`):
*   **`load_test.jmx`**: JMeter plan to run concurrency tests.
    *   **Scope**: Gradually ramps up concurrent threads (up to 20 users) performing periodic requests to the health check, activity list, and failed login routes. Validates HTTP 200/201 status codes, JSON responses, and verifies expected rate limit (HTTP 429) / unauthorized (HTTP 401) responses.

#### 📤 Jira Xray Connector (`tests/xray/`):
*   **`xray_uploader.js`**: Connects to the Xray Cloud API.
    *   **Scope**: Pulls API credentials from the system `.env` file to build a formatted JSON upload payload. If no credentials are found, it runs in **dry-run** simulation mode, printing the exact payload to the console.

---

## ⚙️ 3. Safe Sequential Executions

Our testing suite is configured to prevent two common conflicts during local bulk test runs:

1.  **Session Pollution**:
    *   *Issue*: Selenium reuses the same browser instance to optimize execution speed. If Test A finishes in a logged-in state, Test B visiting the login page will immediately trigger a redirect to `/dashboard`, causing Test B to fail because it cannot find the login inputs.
    *   *Resolution*: In `ui.test.js`, the `beforeEach` hook resets browser state:
        ```javascript
        await driver.get(baseUrl);
        await driver.executeScript('window.localStorage.clear();');
        await driver.manage().deleteAllCookies();
        ```
        This ensures each test begins with a clean, unauthenticated session.

2.  **Rate Limiting (IP Block)**:
    *   *Issue*: The backend rate limiter allows a maximum of 5 login attempts per IP per minute. Jest UI and JMeter tests run dozens of requests in seconds, resulting in immediate HTTP `429 Too Many Requests` failures.
    *   *Resolution*: By configuring `LOGIN_RATE_LIMIT=1000` in the backend's `.env` file, the server allows testing scripts to execute multiple requests without triggering security blocks.
