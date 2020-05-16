const sessionFactory = require('../factories/sesionFactory');
const userFactory = require('../factories/userFactory');
const puppeteer = require('puppeteer');

//TODO: ESTEBAN ORTIZ - liberar recursos al terminar los test
class CustomPage {
  static async build() {
    //no sandbox to virtual machine
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page, browser);
    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || page[property] || browser[property];
      },
    });
  }

  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_data),
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }

  close() {
    return this.browser.close();
  }
}

module.exports = CustomPage;
