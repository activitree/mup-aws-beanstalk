"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ebVersions = ebVersions;
exports.s3Versions = s3Versions;
exports.largestVersion = largestVersion;
exports.largestEnvVersion = largestEnvVersion;
exports.oldEnvVersions = oldEnvVersions;
exports.oldVersions = oldVersions;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = require("lodash");

var _aws = require("./aws");

var _utils = require("./utils");

function ebVersions(_x) {
  return _ebVersions.apply(this, arguments);
}

function _ebVersions() {
  _ebVersions = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(api) {
    var config, versions, _names, app, appVersions;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = api.getConfig();
            versions = [0];
            _names = (0, _utils.names)(config), app = _names.app;
            _context.next = 5;
            return _aws.beanstalk.describeApplicationVersions({
              ApplicationName: app
            }).promise();

          case 5:
            appVersions = _context.sent;

            if (appVersions.ApplicationVersions.length > 0) {
              appVersions.ApplicationVersions.forEach(function (_ref) {
                var VersionLabel = _ref.VersionLabel;
                var parsedVersion = parseInt(VersionLabel, 10);
                versions.push(parsedVersion);
              });
            }

            return _context.abrupt("return", versions.sort(function (a, b) {
              return b - a;
            }));

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _ebVersions.apply(this, arguments);
}

function s3Versions(_x2, _x3) {
  return _s3Versions.apply(this, arguments);
}

function _s3Versions() {
  _s3Versions = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(api, prefix) {
    var config, versions, _names2, bucket, bundlePrefix, uploadedBundles;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            config = api.getConfig();
            versions = [0];
            _names2 = (0, _utils.names)(config), bucket = _names2.bucket, bundlePrefix = _names2.bundlePrefix;
            prefix = prefix || bundlePrefix;
            _context2.next = 6;
            return _aws.s3.listObjectsV2({
              Bucket: bucket,
              Prefix: prefix
            }).promise();

          case 6:
            uploadedBundles = _context2.sent;

            if (uploadedBundles.Contents.length > 0) {
              uploadedBundles.Contents.forEach(function (bundle) {
                var bundleVersion = parseInt(bundle.Key.split(prefix)[1], 10);
                versions.push(bundleVersion);
              });
            }

            return _context2.abrupt("return", versions.sort(function (a, b) {
              return b - a;
            }));

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _s3Versions.apply(this, arguments);
}

function largestVersion(_x4) {
  return _largestVersion.apply(this, arguments);
}

function _largestVersion() {
  _largestVersion = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(api) {
    var _yield$s3Versions, _yield$s3Versions2, version, _yield$ebVersions, _yield$ebVersions2, appVersion;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return s3Versions(api);

          case 2:
            _yield$s3Versions = _context3.sent;
            _yield$s3Versions2 = (0, _slicedToArray2.default)(_yield$s3Versions, 1);
            version = _yield$s3Versions2[0];
            _context3.next = 7;
            return ebVersions(api);

          case 7:
            _yield$ebVersions = _context3.sent;
            _yield$ebVersions2 = (0, _slicedToArray2.default)(_yield$ebVersions, 1);
            appVersion = _yield$ebVersions2[0];

            if (appVersion > version) {
              version = appVersion;
            }

            return _context3.abrupt("return", version);

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _largestVersion.apply(this, arguments);
}

function largestEnvVersion(_x5) {
  return _largestEnvVersion.apply(this, arguments);
}

function _largestEnvVersion() {
  _largestEnvVersion = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(api) {
    var versions, prefix, config, _names3, bucketName, uploadedBundles;

    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            versions = [0];
            prefix = 'env/';
            config = api.getConfig();
            _names3 = (0, _utils.names)(config), bucketName = _names3.bucket;
            _context4.next = 6;
            return _aws.s3.listObjectsV2({
              Bucket: bucketName,
              Prefix: prefix
            }).promise();

          case 6:
            uploadedBundles = _context4.sent;

            if (uploadedBundles.Contents.length > 0) {
              uploadedBundles.Contents.forEach(function (bundle) {
                var bundleVersion = parseInt(bundle.Key.split(prefix)[1], 10);
                versions.push(bundleVersion);
              });
            }

            return _context4.abrupt("return", versions.sort(function (a, b) {
              return b - a;
            })[0]);

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _largestEnvVersion.apply(this, arguments);
}

function oldEnvVersions(_x6) {
  return _oldEnvVersions.apply(this, arguments);
}

function _oldEnvVersions() {
  _oldEnvVersions = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5(api) {
    var keep, versions;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            keep = 10;
            _context5.next = 3;
            return s3Versions(api, 'env/');

          case 3:
            versions = _context5.sent;
            return _context5.abrupt("return", versions.slice(keep));

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _oldEnvVersions.apply(this, arguments);
}

function oldVersions(_x7) {
  return _oldVersions.apply(this, arguments);
}

function _oldVersions() {
  _oldVersions = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(api) {
    var keep, appVersions, bundleVersions, oldBundleVersions, oldAppVersions;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            keep = api.getConfig().app.oldVersions;
            _context6.next = 3;
            return ebVersions(api);

          case 3:
            appVersions = _context6.sent;
            _context6.next = 6;
            return s3Versions(api);

          case 6:
            bundleVersions = _context6.sent;
            // find unused bundles
            oldBundleVersions = (0, _lodash.difference)(bundleVersions, appVersions); // keep the 3 newest versions

            oldAppVersions = appVersions.slice(keep);
            return _context6.abrupt("return", {
              bundles: oldBundleVersions,
              versions: oldAppVersions
            });

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _oldVersions.apply(this, arguments);
}
//# sourceMappingURL=versions.js.map