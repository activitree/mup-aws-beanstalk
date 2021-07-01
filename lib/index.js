"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareConfig = prepareConfig;
exports.hooks = exports.validate = exports.commands = exports.description = exports.name = void 0;

var _commands = _interopRequireWildcard(require("./commands"));

var _validate = _interopRequireDefault(require("./validate"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var name = 'beanstalk';
exports.name = name;
var description = 'Deploy Meteor app to AWS Elastic Beanstalk';
exports.description = description;
var commands = _commands;
exports.commands = commands;
var validate = {
  app: function app(config, utils) {
    if (config.app && config.app.type === 'aws-beanstalk') {
      return (0, _validate.default)(config, utils);
    }

    return [];
  }
};
exports.validate = validate;

function prepareConfig(config) {
  if (!config.app || config.app.type !== 'aws-beanstalk') {
    return config;
  }

  var defaultBuildOptions = {
    serverOnly: true
  };
  config.app.buildOptions = config.app.buildOptions || defaultBuildOptions; // This will change 0 to 1. The validator will warn when the number is 0
  // To have 0 instances, `mup stop` should be used

  config.app.minInstances = config.app.minInstances || 1;
  config.app.maxInstances = config.app.maxInstances || config.app.minInstances;
  config.app.instanceType = config.app.instanceType || 't2.micro';
  config.app.env = config.app.env || {};
  config.app.env.PORT = 8081;
  config.app.env.METEOR_SIGTERM_GRACE_PERIOD_SECONDS = 30;
  config.app.oldVersions = config.app.oldVersions || 3;
  return config;
}

function isBeanstalkApp(api) {
  var config = api.getConfig();

  if (config.app && config.app.type === 'aws-beanstalk') {
    return true;
  }

  return false;
}

var hooks = {
  'post.setup': function postSetup(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.setup');
    }
  },
  'post.deploy': function postDeploy(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.deploy');
    }
  },
  'post.logs': function postLogs(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.logs');
    }
  },
  'post.start': function postStart(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.start');
    }
  },
  'post.stop': function postStop(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.stop');
    }
  },
  'post.restart': function postRestart(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.restart');
    }
  },
  'post.reconfig': function postReconfig(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.reconfig');
    }
  },
  'post.status': function postStatus(api) {
    if (isBeanstalkApp(api)) {
      return api.runCommand('beanstalk.status');
    }
  }
};
exports.hooks = hooks;
//# sourceMappingURL=index.js.map