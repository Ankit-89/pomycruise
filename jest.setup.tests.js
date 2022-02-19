/**
 * NOTE: This script file presents you the opportunity of running some code,
 * immediately after the test framework has been installed in the environment.
 *
 * The script is executed in the context of the suite eg: describe('<Component>'),
 * the following are some of the methods are available:
 * beforeEach(), afteaEach(), beforeAll(), afterAll()
 */

/**
 * Expect at Least 1 assertion in each test('')
 * This helps to identify if the asynchronous code is running the assertions or not;
 */
afterEach(() => {
    expect.hasAssertions();
});
