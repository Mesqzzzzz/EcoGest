const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.errorAlert = By.xpath('//div[contains(@class, "text-red-600")]');
  }

  async login(email, password) {
    await this.write(this.emailInput, email);
    await this.write(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async getErrorMessage() {
    return await this.getText(this.errorAlert);
  }
}

module.exports = LoginPage;
