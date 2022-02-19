const path = require('path');

const IGNORED_COMPONENTS = [
];

const TEST_FILES_REGEX = '(components/.*/test/.*|(\\.|/)(test|spec))\\.js$';

module.exports = {
    verbose: false,
    collectCoverageFrom: [
        'components/**/*.js'
    ],
    coverageDirectory: 'reports/coverage',
    coveragePathIgnorePatterns: [
        ...IGNORED_COMPONENTS,
        '<rootDir>/components/index.js'
    ],
    coverageReporters: [
        'lcov',
        'text'
    ],
    coverageThreshold: {
        global: {
            branches: 40,
            functions: 50,
            lines: 40,
            statements: 40
        }
    },
    moduleNameMapper: {
        '\\.css$': path.join(__dirname, '/testConfig/mocks/stylesMock.js')
    },
    modulePaths: [

        // Modules that will be available only in the Context of any of the Test.js files
        '<rootDir>/testConfig'
    ],
    setupFiles: [ '<rootDir>/jest.setup.suites.js' ],
    setupTestFrameworkScriptFile: path.join(__dirname, 'jest.setup.tests.js'),
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/'
    },
    testPathIgnorePatterns: [
        ...IGNORED_COMPONENTS,
        '/node_modules*?',
        '/dist/',
        '/library/',
		'/localSession/',
		'/config/',
		'/services/',
		'/views/',
		'/themes/',
		'/dam'
    ],
    testRegex: TEST_FILES_REGEX
};
