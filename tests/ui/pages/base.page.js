const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

class BasePage {
  constructor(driver = null) {
    this.driver = driver;
  }

  async init() {
    if (!this.driver) {
      const options = new chrome.Options();
      
      // Configurar modo headless caso a variável de ambiente SELENIUM_HEADLESS esteja ativa (ex: Jenkins)
      if (process.env.SELENIUM_HEADLESS === 'true') {
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
      }
      
      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
        
      await this.driver.manage().setTimeouts({ implicit: 10000 });
      await this.driver.manage().window().maximize();
    }
    return this.driver;
  }

  async quit() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  async visit(url) {
    await this.driver.get(url);
  }

  async find(locator) {
    return await this.driver.wait(until.elementLocated(locator), 10000);
  }

  async click(locator) {
    const el = await this.find(locator);
    await this.driver.wait(until.elementIsEnabled(el), 10000);
    await el.click();
  }

  async write(locator, text) {
    const el = await this.find(locator);
    await this.driver.wait(until.elementIsEnabled(el), 10000);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator) {
    const el = await this.find(locator);
    return await el.getText();
  }

  async takeScreenshot(testName) {
    try {
      const image = await this.driver.takeScreenshot();
      const dir = path.join(__dirname, '..', '..', 'screenshots');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, `${testName}_fail.png`), image, 'base64');
      console.log(`📸 Screenshot salvo em: ${dir}/${testName}_fail.png`);
    } catch (err) {
      console.error('Falha ao tirar screenshot:', err.message);
    }
  }
}

module.exports = BasePage;
