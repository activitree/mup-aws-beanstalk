"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _joi = _interopRequireDefault(require("joi"));

var schema = _joi.default.object().keys({
  name: _joi.default.string().min(1).required(),
  path: _joi.default.string().min(1).required(),
  type: _joi.default.string().required(),
  buildOptions: _joi.default.object().keys({
    serverOnly: _joi.default.bool(),
    debug: _joi.default.bool(),
    buildLocation: _joi.default.string(),
    mobileSettings: _joi.default.object(),
    server: _joi.default.string().uri(),
    allowIncompatibleUpdates: _joi.default.boolean(),
    executable: _joi.default.string()
  }),
  // The meteor plugin adds the docker object, which is a bug in mup
  docker: _joi.default.object(),
  env: _joi.default.object(),
  auth: _joi.default.object().keys({
    id: _joi.default.string().required(),
    secret: _joi.default.string().required()
  }).required(),
  sslDomains: _joi.default.array().items(_joi.default.string()),
  forceSSL: _joi.default.bool(),
  region: _joi.default.string(),
  minInstances: _joi.default.number().min(1).required(),
  maxInstances: _joi.default.number().min(1),
  instanceType: _joi.default.string(),
  gracefulShutdown: _joi.default.bool(),
  longEnvVars: _joi.default.bool(),
  yumPackages: _joi.default.object().pattern(/[/s/S]*/, [_joi.default.string().allow('')]),
  oldVersions: _joi.default.number(),
  customBeanstalkConfig: _joi.default.array().items(_joi.default.object({
    namespace: _joi.default.string().trim().required(),
    option: _joi.default.string().trim().required(),
    value: _joi.default.string().trim().required()
  }))
});

function _default(config, utils) {
  var details = [];
  details = utils.combineErrorDetails(details, _joi.default.validate(config.app, schema, utils.VALIDATE_OPTIONS));

  if (config.app && config.app.name && config.app.name.length < 4) {
    details.push({
      message: 'must have at least 4 characters',
      path: 'name'
    });
  }

  return utils.addLocation(details, 'app');
}
//# sourceMappingURL=validate.js.map