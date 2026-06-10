const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameInput = By.css('input[placeholder="ex: João Silva"]');
    this.emailInput = By.css('input[placeholder="ex: joao@escola.pt"]');
    this.passwordInput = By.css('input[placeholder="Mínimo 6 caracteres"]');
    this.confirmPasswordInput = By.css('input[placeholder="Repita a palavra-passe"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.errorAlert = By.xpath('//div[contains(@class, "text-red-600")]');
  }

  async register(name, email, password, confirmPassword) {
    await this.write(this.nameInput, name);
    await this.write(this.emailInput, email);
    await this.write(this.passwordInput, password);
    await this.write(this.confirmPasswordInput, confirmPassword);
    await this.click(this.submitBtn);
  }

  async getErrorMessage() {
    return await this.getText(this.errorAlert);
  }
}

module.exports = RegisterPage;
