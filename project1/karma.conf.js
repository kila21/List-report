module.exports = function(config) {
  config.set({
    frameworks: ["ui5"],
    ui5: {
      mode: "html",
      config: {
        async: true,
      },
      testpage: "webapp/test/testsuite.qunit.html",

    },
 
    reporters: ["coverage"],
    preprocessors: {
      "webapp/**/*.js": ["coverage"],
      "webapp/test/**/*.js": []    
    },

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "lcovonly", subdir: ".", file: "lcov.info" },
        { type: "text-summary" },
        { type: "text" }
      ]
    },

    browsers: ["Chrome"],
    // browsers: ["ChromeHeadless"],
    singleRun: true
  });
};
