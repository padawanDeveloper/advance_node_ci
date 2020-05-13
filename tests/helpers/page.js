const sessionFactory = require('../factories/sesionFactory');
const userFactory = require('../factories/userFactory');
const puppeteer = require('puppeteer');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || page[property] || browser[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.setCookie({ name: 'session', value: session });
    await this.setCookie({ name: 'session.sig', value: sig });
    await this.goto('localhost:3000');
    await this.waitFor('a[href="/auth/logout"]');
  }
}

module.exports = CustomPage;
