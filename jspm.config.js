SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "DFP/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.14"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "DFP": {
      "main": "DFP.js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    },
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json"
  ],
  map: {},
  packages: {}
});

System.config({
  meta: {
    '*.json': { format: 'json' }
  }
});
