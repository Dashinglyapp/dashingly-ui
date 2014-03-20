// An example configuration file.
exports.config = {
  // Remove definition for `seleniumAddress` so that selenium is launched by protractor.
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  // seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.40.0.jar',

  //Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': './node_modules/karma-phantomjs-launcher/node_modules/phantomjs/bin/phantomjs'
  },


  // The timeout for each script run on the browser. This should be longer
  // than the maximum time your application needs to stabilize between tasks.
  allScriptsTimeout: 30000,


  //baseUrl: 'http://localhost:8444',

  // Spec patterns are relative to the current working directly when
  // protractor is called.  In this case the e2e_tests dir.
  specs: ['*.spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    /**
     * onComplete will be called just before the driver quits.
     */
    // onComplete: function () {},
    // If true, display spec names.
    isVerbose: true,
    // If true, print colors to the terminal.
    showColors: true,
    // If true, include stack traces in failures.
    includeStackTrace: false,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 30000
  }
};