"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.status = exports.reconfig = exports.ssl = exports.clean = exports.events = exports.restart = exports.stop = exports.start = exports.logsEb = exports.logsNginx = exports.logs = exports.deploy = exports.setup = void 0;

var commandHandlers = _interopRequireWildcard(require("./command-handlers"));

var _aws = _interopRequireDefault(require("./aws"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var prepared = false;

function prepare(commandHandler) {
  return function handler(api) {
    if (!prepared) {
      (0, _aws.default)(api.getConfig().app);
      prepared = true;
    }

    return commandHandler(api);
  };
}

var setup = {
  description: 'Prepare AWS to deploy app',
  handler: prepare(commandHandlers.setup)
};
exports.setup = setup;
var deploy = {
  description: 'Deploy app to AWS Elastic Beanstalk',
  builder: function builder(subYargs) {
    return subYargs.option('cached-build', {
      description: 'Use build from previous deploy',
      boolean: true
    });
  },
  handler: commandHandlers.deploy
};
exports.deploy = deploy;
var logs = {
  description: 'View app\'s logs',
  builder: function builder(yargs) {
    return yargs.strict(false).option('tail', {
      description: 'Number of lines to show from the end of the logs',
      alias: 't',
      number: true
    }).option('follow', {
      description: 'Follow log output',
      alias: 'f',
      boolean: true
    });
  },
  handler: prepare(commandHandlers.logs)
};
exports.logs = logs;
var logsNginx = {
  name: 'logs-nginx',
  description: 'View Nginx logs',
  handler: prepare(commandHandlers.logsNginx)
};
exports.logsNginx = logsNginx;
var logsEb = {
  name: 'logs-eb',
  description: 'Logs from setting up server and installing npm dependencies',
  handler: prepare(commandHandlers.logsEb)
};
exports.logsEb = logsEb;
var start = {
  description: 'Start app',
  handler: prepare(commandHandlers.start)
};
exports.start = start;
var stop = {
  description: 'Stop app',
  handler: prepare(commandHandlers.stop)
};
exports.stop = stop;
var restart = {
  description: 'Restart app',
  handler: prepare(commandHandlers.restart)
};
exports.restart = restart;
var events = {
  description: 'Environment Events',
  handler: prepare(commandHandlers.events)
};
exports.events = events;
var clean = {
  description: 'Remove old bundles and app versions',
  handler: prepare(commandHandlers.clean)
};
exports.clean = clean;
var ssl = {
  description: 'Setup and view status of ssl certificate',
  handler: prepare(commandHandlers.ssl)
};
exports.ssl = ssl;
var reconfig = {
  description: 'Update env variables, instance count, and Meteor settings.json',
  handler: prepare(commandHandlers.reconfig)
};
exports.reconfig = reconfig;
var status = {
  description: 'View status of app',
  handler: prepare(commandHandlers.status)
};
exports.status = status;
//# sourceMappingURL=commands.js.map