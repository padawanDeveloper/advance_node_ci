const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('Blogs test, when login', () => {
  beforeEach(async () => {
    await page.login();
    await page.goto('localhost:3000/blogs');
    await page.getContentsOf('a.btn-floating');
    await page.click('a.btn-floating');
  });

  it('When logged in, can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('Using invalid inputs', () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    it('The form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});
