"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLastEvent = getLastEvent;
exports.showEvents = showEvents;
exports.waitForEnvReady = waitForEnvReady;
exports.waitForHealth = waitForHealth;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _utils = require("./utils");

var _aws = require("./aws");

var _recheck = require("./recheck");

function getLastEvent(_x) {
  return _getLastEvent.apply(this, arguments);
}

function _getLastEvent() {
  _getLastEvent = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(config) {
    var _names, environment, _yield$beanstalk$desc, Events;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _names = (0, _utils.names)(config), environment = _names.environment;
            _context.next = 3;
            return _aws.beanstalk.describeEvents({
              EnvironmentName: environment,
              MaxRecords: 5
            }).promise();

          case 3:
            _yield$beanstalk$desc = _context.sent;
            Events = _yield$beanstalk$desc.Events;
            return _context.abrupt("return", Events[0].EventDate);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getLastEvent.apply(this, arguments);
}

function showEvents(_x2, _x3) {
  return _showEvents.apply(this, arguments);
}

function _showEvents() {
  _showEvents = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(config, lastEventDate) {
    var _names2, environment, app, _yield$beanstalk$desc2, Events;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _names2 = (0, _utils.names)(config), environment = _names2.environment, app = _names2.app;
            _context2.next = 3;
            return _aws.beanstalk.describeEvents({
              EnvironmentName: environment,
              ApplicationName: app,
              StartTime: lastEventDate
            }).promise();

          case 3:
            _yield$beanstalk$desc2 = _context2.sent;
            Events = _yield$beanstalk$desc2.Events;
            Events.forEach(function (event) {
              if (event.EventDate.toString() === lastEventDate.toString()) {
                return;
              }

              console.log("  Env Event: ".concat(event.Message));
            });
            return _context2.abrupt("return", new Date(Events[0].EventDate));

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _showEvents.apply(this, arguments);
}

function checker(_x4, _x5, _x6, _x7) {
  return _checker.apply(this, arguments);
}

function _checker() {
  _checker = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(config, prop, wantedValue, showProgress) {
    var _names3, environment, app, lastEventDate, lastStatus;

    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _names3 = (0, _utils.names)(config), environment = _names3.environment, app = _names3.app;
            lastEventDate = null;
            lastStatus = null;

            if (!showProgress) {
              _context4.next = 7;
              break;
            }

            _context4.next = 6;
            return getLastEvent(config);

          case 6:
            lastEventDate = _context4.sent;

          case 7:
            return _context4.abrupt("return", new Promise(function (resolve, reject) {
              function check() {
                return _check.apply(this, arguments);
              }

              function _check() {
                _check = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
                  var result, value, text;
                  return _regenerator.default.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.prev = 0;
                          _context3.next = 3;
                          return _aws.beanstalk.describeEnvironments({
                            EnvironmentNames: [environment],
                            ApplicationName: app
                          }).promise();

                        case 3:
                          result = _context3.sent;
                          _context3.next = 14;
                          break;

                        case 6:
                          _context3.prev = 6;
                          _context3.t0 = _context3["catch"](0);
                          console.log('in check exception');

                          if (!(0, _recheck.checkForThrottlingException)(_context3.t0)) {
                            _context3.next = 12;
                            break;
                          }

                          (0, _recheck.handleThrottlingException)();
                          return _context3.abrupt("return", setTimeout(check, (0, _recheck.getRecheckInterval)()));

                        case 12:
                          console.log(_context3.t0);
                          reject(_context3.t0);

                        case 14:
                          value = result.Environments[0][prop];

                          if (!(value !== wantedValue && value !== lastStatus)) {
                            _context3.next = 21;
                            break;
                          }

                          text = prop === 'Health' ? "be ".concat(wantedValue) : "finish ".concat(value);
                          (0, _utils.logStep)("=> Waiting for Beanstalk Environment to ".concat(text.toLocaleLowerCase()));
                          lastStatus = value;
                          _context3.next = 24;
                          break;

                        case 21:
                          if (!(value === wantedValue)) {
                            _context3.next = 24;
                            break;
                          }

                          // TODO: run showEvents one last time
                          resolve();
                          return _context3.abrupt("return");

                        case 24:
                          if (!showProgress) {
                            _context3.next = 34;
                            break;
                          }

                          _context3.prev = 25;
                          _context3.next = 28;
                          return showEvents(config, lastEventDate);

                        case 28:
                          lastEventDate = _context3.sent;
                          _context3.next = 34;
                          break;

                        case 31:
                          _context3.prev = 31;
                          _context3.t1 = _context3["catch"](25);

                          if ((0, _recheck.checkForThrottlingException)(_context3.t1)) {
                            (0, _recheck.handleThrottlingException)();
                          } else {
                            console.log(_context3.t1);
                          }

                        case 34:
                          setTimeout(check, (0, _recheck.getRecheckInterval)());

                        case 35:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee3, null, [[0, 6], [25, 31]]);
                }));
                return _check.apply(this, arguments);
              }

              check();
            }));

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _checker.apply(this, arguments);
}

function waitForEnvReady(_x8, _x9) {
  return _waitForEnvReady.apply(this, arguments);
}

function _waitForEnvReady() {
  _waitForEnvReady = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5(config, showProgress) {
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return checker(config, 'Status', 'Ready', showProgress);

          case 2:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _waitForEnvReady.apply(this, arguments);
}

function waitForHealth(_x10) {
  return _waitForHealth.apply(this, arguments);
}

function _waitForHealth() {
  _waitForHealth = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(config) {
    var health,
        showProgress,
        _args6 = arguments;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            health = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : 'Green';
            showProgress = _args6.length > 2 ? _args6[2] : undefined;
            _context6.next = 4;
            return checker(config, 'Health', health, showProgress);

          case 4:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _waitForHealth.apply(this, arguments);
}
//# sourceMappingURL=env-ready.js.map