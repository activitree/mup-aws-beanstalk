"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ensureSSLConfigured;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _aws = require("./aws");

var _utils = require("./utils");

var _ebConfig = require("./eb-config");

var _envReady = require("./env-ready");

function ensureSSLConfigured(_x, _x2) {
  return _ensureSSLConfigured.apply(this, arguments);
}

function _ensureSSLConfigured() {
  _ensureSSLConfigured = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(config, certificateArn) {
    var _names, app, environment, ebConfig, domains, needToUpdate, _yield$beanstalk$desc, ConfigurationSettings, current, desired;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _names = (0, _utils.names)(config), app = _names.app, environment = _names.environment;
            ebConfig = [{
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'SSLCertificateArns',
              Value: certificateArn
            }, {
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'DefaultProcess',
              Value: 'default'
            }, {
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'ListenerEnabled',
              Value: 'true'
            }, {
              Namespace: 'aws:elbv2:listener:443',
              OptionName: 'Protocol',
              Value: 'HTTPS'
            }];
            domains = config.app.sslDomains;

            if (!(!domains || domains.length === 0)) {
              _context.next = 8;
              break;
            }

            _context.next = 6;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              // eslint-disable-next-line arrow-body-style
              OptionsToRemove: ebConfig.map(function (_ref) {
                var Namespace = _ref.Namespace,
                    OptionName = _ref.OptionName;
                return {
                  Namespace: Namespace,
                  OptionName: OptionName
                };
              })
            }).promise();

          case 6:
            _context.next = 21;
            break;

          case 8:
            needToUpdate = false;
            _context.next = 11;
            return _aws.beanstalk.describeConfigurationSettings({
              EnvironmentName: environment,
              ApplicationName: app
            }).promise();

          case 11:
            _yield$beanstalk$desc = _context.sent;
            ConfigurationSettings = _yield$beanstalk$desc.ConfigurationSettings;
            current = ConfigurationSettings[0].OptionSettings.reduce(_ebConfig.convertToObject, {});
            desired = ebConfig.reduce(_ebConfig.convertToObject, {});
            Object.keys(desired).forEach(function (key) {
              if (needToUpdate || !current[key] || current[key].Value !== desired[key].Value) {
                needToUpdate = true;
              }
            });

            if (!needToUpdate) {
              _context.next = 21;
              break;
            }

            _context.next = 19;
            return _aws.beanstalk.updateEnvironment({
              EnvironmentName: environment,
              OptionSettings: ebConfig
            }).promise();

          case 19:
            _context.next = 21;
            return (0, _envReady.waitForEnvReady)(config, true);

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _ensureSSLConfigured.apply(this, arguments);
}
//# sourceMappingURL=certificates.js.map