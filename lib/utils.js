"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logStep = logStep;
exports.shouldRebuild = shouldRebuild;
exports.tmpBuildPath = tmpBuildPath;
exports.names = names;
exports.createUniqueName = createUniqueName;
exports.getLogs = getLogs;
exports.getNodeVersion = getNodeVersion;
exports.attachPolicies = attachPolicies;
exports.getAccountId = getAccountId;
exports.ensureRoleExists = ensureRoleExists;
exports.ensureInstanceProfileExists = ensureInstanceProfileExists;
exports.ensureRoleAdded = ensureRoleAdded;
exports.ensurePoliciesAttached = ensurePoliciesAttached;
exports.ensureInlinePolicyAttached = ensureInlinePolicyAttached;
exports.ensureBucketExists = ensureBucketExists;
exports.findBucketWithPrefix = findBucketWithPrefix;
exports.ensureBucketPolicyAttached = ensureBucketPolicyAttached;
exports.ensureCloudWatchRule = ensureCloudWatchRule;
exports.ensureRuleTargetExists = ensureRuleTargetExists;
exports.coloredStatusText = coloredStatusText;
exports.checkLongEnvSafe = checkLongEnvSafe;
exports.createVersionDescription = createVersionDescription;
exports.ensureSsmDocument = ensureSsmDocument;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _axios = _interopRequireDefault(require("axios"));

var _chalk = _interopRequireDefault(require("chalk"));

var _fs = _interopRequireDefault(require("fs"));

var _lodash = require("lodash");

var _os = _interopRequireDefault(require("os"));

var _randomSeed = _interopRequireDefault(require("random-seed"));

var _uuid = _interopRequireDefault(require("uuid"));

var _child_process = require("child_process");

var _aws = require("./aws");

var _recheck = require("./recheck");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function logStep(message) {
  console.log(_chalk.default.blue(message));
}

function shouldRebuild(bundlePath, useCachedBuild) {
  if (_fs.default.existsSync(bundlePath) && useCachedBuild) {
    return false;
  }

  return true;
}

function tmpBuildPath(appPath, api) {
  var rand = _randomSeed.default.create(appPath);

  var uuidNumbers = [];

  for (var i = 0; i < 16; i++) {
    uuidNumbers.push(rand(255));
  }

  return api.resolvePath(_os.default.tmpdir(), "mup-meteor-".concat(_uuid.default.v4({
    random: uuidNumbers
  })));
}

function names(config) {
  var name = config.app.name.toLowerCase();
  return {
    bucket: "mup-".concat(name),
    environment: "mup-env-".concat(name),
    app: "mup-".concat(name),
    bundlePrefix: "mup/bundles/".concat(name, "/"),
    instanceProfile: 'aws-elasticbeanstalk-ec2-role',
    serviceRole: 'aws-elasticbeanstalk-service-role',
    trailBucketPrefix: 'mup-graceful-shutdown-trail',
    trailName: 'mup-graceful-shutdown-trail',
    deregisterRuleName: 'mup-target-deregister',
    eventTargetRole: "mup-envoke-run-command-".concat(name),
    eventTargetPolicyName: 'Invoke_Run_Command',
    eventTargetPassRoleName: 'Pass_Role',
    automationDocument: 'mup-graceful-shutdown'
  };
}

function createUniqueName() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var randomNumbers = Math.floor(Math.random() * 10000);
  return "".concat(prefix, "-").concat(Date.now(), "-").concat(randomNumbers);
}

function retrieveEnvironmentInfo(_x, _x2) {
  return _retrieveEnvironmentInfo.apply(this, arguments);
}

function _retrieveEnvironmentInfo() {
  _retrieveEnvironmentInfo = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(api, count) {
    var config, _names, environment, _yield$beanstalk$retr, EnvironmentInfo;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            config = api.getConfig();
            _names = names(config), environment = _names.environment;
            _context.next = 4;
            return _aws.beanstalk.retrieveEnvironmentInfo({
              EnvironmentName: environment,
              InfoType: 'tail'
            }).promise();

          case 4:
            _yield$beanstalk$retr = _context.sent;
            EnvironmentInfo = _yield$beanstalk$retr.EnvironmentInfo;

            if (!(EnvironmentInfo.length > 0)) {
              _context.next = 10;
              break;
            }

            return _context.abrupt("return", EnvironmentInfo);

          case 10:
            if (!(count > 5)) {
              _context.next = 12;
              break;
            }

            throw new Error('No logs');

          case 12:
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              setTimeout(function () {
                // The logs aren't always available, so retry until they are
                // Another option is to look for the event that says it is ready
                retrieveEnvironmentInfo(api, count + 1).then(resolve).catch(reject);
              }, (0, _recheck.getRecheckInterval)());
            }));

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _retrieveEnvironmentInfo.apply(this, arguments);
}

function getLogs(_x3) {
  return _getLogs.apply(this, arguments);
}

function _getLogs() {
  _getLogs = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(api) {
    var config, _names2, environment, EnvironmentInfo, logsForServer;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            config = api.getConfig();
            _names2 = names(config), environment = _names2.environment;
            logStep('=> Requesting Logs');
            _context2.next = 5;
            return _aws.beanstalk.requestEnvironmentInfo({
              EnvironmentName: environment,
              InfoType: 'tail'
            }).promise();

          case 5:
            _context2.next = 7;
            return retrieveEnvironmentInfo(api, 0);

          case 7:
            EnvironmentInfo = _context2.sent;
            logStep('=> Downloading Logs');
            logsForServer = EnvironmentInfo.reduce(function (result, info) {
              result[info.Ec2InstanceId] = info.Message;
              return result;
            }, {});
            return _context2.abrupt("return", Promise.all(Object.keys(logsForServer).map(function (key) {
              return new Promise(function (resolve, reject) {
                _axios.default.get(logsForServer[key]).then(function (_ref5) {
                  var data = _ref5.data;
                  resolve({
                    data: data,
                    instance: key
                  });
                }).catch(reject);
              });
            })));

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getLogs.apply(this, arguments);
}

function getNodeVersion(api, bundlePath) {
  var star = _fs.default.readFileSync(api.resolvePath(bundlePath, 'bundle/star.json')).toString();

  var nodeVersionTxt = _fs.default.readFileSync(api.resolvePath(bundlePath, 'bundle/.node_version.txt')).toString();

  star = JSON.parse(star);

  if (star.npmVersion) {
    return {
      nodeVersion: star.nodeVersion,
      npmVersion: star.npmVersion
    };
  }

  var nodeVersion = nodeVersionTxt.substr(1);

  if (nodeVersion.startsWith('4')) {
    return {
      nodeVersion: nodeVersion,
      npmVersion: '4.6.1'
    };
  }

  return {
    nodeVersion: nodeVersion,
    npmVersion: '3.10.5'
  };
}

function attachPolicies(_x4, _x5, _x6) {
  return _attachPolicies.apply(this, arguments);
}

function _attachPolicies() {
  _attachPolicies = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(config, roleName, policies) {
    var promises;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            promises = [];
            policies.forEach(function (policy) {
              var promise = _aws.iam.attachRolePolicy({
                RoleName: roleName,
                PolicyArn: policy
              }).promise();

              promises.push(promise);
            });
            _context3.next = 4;
            return Promise.all(promises);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _attachPolicies.apply(this, arguments);
}

function getAccountId() {
  return _aws.sts.getCallerIdentity().promise().then(function (_ref) {
    var Account = _ref.Account;
    return Account;
  });
}

function ensureRoleExists(_x7, _x8, _x9) {
  return _ensureRoleExists.apply(this, arguments);
}

function _ensureRoleExists() {
  _ensureRoleExists = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(name, assumeRolePolicyDocument, ensureAssumeRolePolicy) {
    var exists, updateAssumeRolePolicy, _yield$iam$getRole$pr, Role, currentAssumeRolePolicy;

    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            exists = true;
            updateAssumeRolePolicy = false;
            _context4.prev = 2;
            _context4.next = 5;
            return _aws.iam.getRole({
              RoleName: name
            }).promise();

          case 5:
            _yield$iam$getRole$pr = _context4.sent;
            Role = _yield$iam$getRole$pr.Role;
            currentAssumeRolePolicy = decodeURIComponent(Role.AssumeRolePolicyDocument); // Make the whitespace consistent with the current document

            assumeRolePolicyDocument = JSON.stringify(JSON.parse(assumeRolePolicyDocument));

            if (currentAssumeRolePolicy !== assumeRolePolicyDocument && ensureAssumeRolePolicy) {
              updateAssumeRolePolicy = true;
            }

            _context4.next = 15;
            break;

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4["catch"](2);
            exists = false;

          case 15:
            if (exists) {
              _context4.next = 20;
              break;
            }

            _context4.next = 18;
            return _aws.iam.createRole({
              RoleName: name,
              AssumeRolePolicyDocument: assumeRolePolicyDocument
            }).promise();

          case 18:
            _context4.next = 23;
            break;

          case 20:
            if (!updateAssumeRolePolicy) {
              _context4.next = 23;
              break;
            }

            _context4.next = 23;
            return _aws.iam.updateAssumeRolePolicy({
              RoleName: name,
              PolicyDocument: assumeRolePolicyDocument
            }).promise();

          case 23:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 12]]);
  }));
  return _ensureRoleExists.apply(this, arguments);
}

function ensureInstanceProfileExists(_x10, _x11) {
  return _ensureInstanceProfileExists.apply(this, arguments);
}

function _ensureInstanceProfileExists() {
  _ensureInstanceProfileExists = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5(config, name) {
    var exists;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            exists = true;
            _context5.prev = 1;
            _context5.next = 4;
            return _aws.iam.getInstanceProfile({
              InstanceProfileName: name
            }).promise();

          case 4:
            _context5.next = 9;
            break;

          case 6:
            _context5.prev = 6;
            _context5.t0 = _context5["catch"](1);
            exists = false;

          case 9:
            if (exists) {
              _context5.next = 12;
              break;
            }

            _context5.next = 12;
            return _aws.iam.createInstanceProfile({
              InstanceProfileName: name
            }).promise();

          case 12:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[1, 6]]);
  }));
  return _ensureInstanceProfileExists.apply(this, arguments);
}

function ensureRoleAdded(_x12, _x13, _x14) {
  return _ensureRoleAdded.apply(this, arguments);
}

function _ensureRoleAdded() {
  _ensureRoleAdded = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(config, instanceProfile, role) {
    var added, _yield$iam$getInstanc, InstanceProfile;

    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            added = true;
            _context6.next = 3;
            return _aws.iam.getInstanceProfile({
              InstanceProfileName: instanceProfile
            }).promise();

          case 3:
            _yield$iam$getInstanc = _context6.sent;
            InstanceProfile = _yield$iam$getInstanc.InstanceProfile;

            if (InstanceProfile.Roles.length === 0 || InstanceProfile.Roles[0].RoleName !== role) {
              added = false;
            }

            if (added) {
              _context6.next = 9;
              break;
            }

            _context6.next = 9;
            return _aws.iam.addRoleToInstanceProfile({
              InstanceProfileName: instanceProfile,
              RoleName: role
            }).promise();

          case 9:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _ensureRoleAdded.apply(this, arguments);
}

function ensurePoliciesAttached(_x15, _x16, _x17) {
  return _ensurePoliciesAttached.apply(this, arguments);
}

function _ensurePoliciesAttached() {
  _ensurePoliciesAttached = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7(config, role, policies) {
    var _yield$iam$listAttach, AttachedPolicies, unattachedPolicies;

    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return _aws.iam.listAttachedRolePolicies({
              RoleName: role
            }).promise();

          case 2:
            _yield$iam$listAttach = _context7.sent;
            AttachedPolicies = _yield$iam$listAttach.AttachedPolicies;
            AttachedPolicies = AttachedPolicies.map(function (policy) {
              return policy.PolicyArn;
            });
            unattachedPolicies = policies.reduce(function (result, policy) {
              if (AttachedPolicies.indexOf(policy) === -1) {
                result.push(policy);
              }

              return result;
            }, []);

            if (!(unattachedPolicies.length > 0)) {
              _context7.next = 9;
              break;
            }

            _context7.next = 9;
            return attachPolicies(config, role, unattachedPolicies);

          case 9:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _ensurePoliciesAttached.apply(this, arguments);
}

function ensureInlinePolicyAttached(_x18, _x19, _x20) {
  return _ensureInlinePolicyAttached.apply(this, arguments);
}

function _ensureInlinePolicyAttached() {
  _ensureInlinePolicyAttached = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8(role, policyName, policyDocument) {
    var exists, needsUpdating, result, currentPolicyDocument;
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            exists = true;
            needsUpdating = false;
            _context8.prev = 2;
            _context8.next = 5;
            return _aws.iam.getRolePolicy({
              RoleName: role,
              PolicyName: policyName
            }).promise();

          case 5:
            result = _context8.sent;
            currentPolicyDocument = decodeURIComponent(result.PolicyDocument);

            if (currentPolicyDocument !== policyDocument) {
              needsUpdating = true;
            }

            _context8.next = 13;
            break;

          case 10:
            _context8.prev = 10;
            _context8.t0 = _context8["catch"](2);
            exists = false;

          case 13:
            if (!(!exists || needsUpdating)) {
              _context8.next = 16;
              break;
            }

            _context8.next = 16;
            return _aws.iam.putRolePolicy({
              RoleName: role,
              PolicyName: policyName,
              PolicyDocument: policyDocument
            }).promise();

          case 16:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[2, 10]]);
  }));
  return _ensureInlinePolicyAttached.apply(this, arguments);
}

function ensureBucketExists(_x21, _x22, _x23) {
  return _ensureBucketExists.apply(this, arguments);
}

function _ensureBucketExists() {
  _ensureBucketExists = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9(buckets, bucketName, region) {
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (buckets.find(function (bucket) {
              return bucket.Name === bucketName;
            })) {
              _context9.next = 4;
              break;
            }

            _context9.next = 3;
            return _aws.s3.createBucket(_objectSpread({
              Bucket: bucketName
            }, region ? {
              CreateBucketConfiguration: {
                LocationConstraint: region
              }
            } : {})).promise();

          case 3:
            return _context9.abrupt("return", true);

          case 4:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));
  return _ensureBucketExists.apply(this, arguments);
}

function findBucketWithPrefix(buckets, prefix) {
  return buckets.find(function (bucket) {
    return bucket.Name.indexOf(prefix) === 0;
  });
}

function ensureBucketPolicyAttached(_x24, _x25) {
  return _ensureBucketPolicyAttached.apply(this, arguments);
}

function _ensureBucketPolicyAttached() {
  _ensureBucketPolicyAttached = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10(bucketName, policy) {
    var error, currentPolicy, _yield$s3$getBucketPo, Policy, params;

    return _regenerator.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            error = false;
            _context10.prev = 1;
            _context10.next = 4;
            return _aws.s3.getBucketPolicy({
              Bucket: bucketName
            }).promise();

          case 4:
            _yield$s3$getBucketPo = _context10.sent;
            Policy = _yield$s3$getBucketPo.Policy;
            currentPolicy = Policy;
            _context10.next = 12;
            break;

          case 9:
            _context10.prev = 9;
            _context10.t0 = _context10["catch"](1);
            error = true;

          case 12:
            if (!(error || currentPolicy !== policy)) {
              _context10.next = 16;
              break;
            }

            params = {
              Bucket: bucketName,
              Policy: policy
            };
            _context10.next = 16;
            return _aws.s3.putBucketPolicy(params).promise();

          case 16:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[1, 9]]);
  }));
  return _ensureBucketPolicyAttached.apply(this, arguments);
}

function ensureCloudWatchRule(_x26, _x27, _x28) {
  return _ensureCloudWatchRule.apply(this, arguments);
}

function _ensureCloudWatchRule() {
  _ensureCloudWatchRule = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11(name, description, eventPattern) {
    var error;
    return _regenerator.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            error = false;
            _context11.prev = 1;
            _context11.next = 4;
            return _aws.cloudWatchEvents.describeRule({
              Name: name
            }).promise();

          case 4:
            _context11.next = 9;
            break;

          case 6:
            _context11.prev = 6;
            _context11.t0 = _context11["catch"](1);
            error = true;

          case 9:
            if (!error) {
              _context11.next = 13;
              break;
            }

            _context11.next = 12;
            return _aws.cloudWatchEvents.putRule({
              Name: name,
              Description: description,
              EventPattern: eventPattern
            }).promise();

          case 12:
            return _context11.abrupt("return", true);

          case 13:
            return _context11.abrupt("return", false);

          case 14:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[1, 6]]);
  }));
  return _ensureCloudWatchRule.apply(this, arguments);
}

function ensureRuleTargetExists(_x29, _x30) {
  return _ensureRuleTargetExists.apply(this, arguments);
}

function _ensureRuleTargetExists() {
  _ensureRuleTargetExists = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee12(ruleName, target) {
    var _yield$cloudWatchEven, Targets, params;

    return _regenerator.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return _aws.cloudWatchEvents.listTargetsByRule({
              Rule: ruleName
            }).promise();

          case 2:
            _yield$cloudWatchEven = _context12.sent;
            Targets = _yield$cloudWatchEven.Targets;

            if (Targets.find(function (_target) {
              return (0, _lodash.isEqual)(_target, target);
            })) {
              _context12.next = 9;
              break;
            }

            params = {
              Rule: ruleName,
              Targets: [target]
            };
            _context12.next = 8;
            return _aws.cloudWatchEvents.putTargets(params).promise();

          case 8:
            return _context12.abrupt("return", true);

          case 9:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _ensureRuleTargetExists.apply(this, arguments);
}

function coloredStatusText(envColor, text) {
  if (envColor === 'Green') {
    return _chalk.default.green(text);
  } else if (envColor === 'Yellow') {
    return _chalk.default.yellow(text);
  } else if (envColor === 'Red') {
    return _chalk.default.red(text);
  }

  return text;
} // Checks if it is safe to use the environment variables from s3


function checkLongEnvSafe(currentConfig, commandHistory, appConfig) {
  var optionEnabled = appConfig.longEnvVars;
  var previouslyMigrated = currentConfig[0].OptionSettings.find(function (_ref2) {
    var Namespace = _ref2.Namespace,
        OptionName = _ref2.OptionName;
    return Namespace === 'aws:elasticbeanstalk:application:environment' && OptionName === 'MUP_ENV_FILE_VERSION';
  });
  var reconfigCount = commandHistory.filter(function (_ref3) {
    var name = _ref3.name;
    return name === 'beanstalk.reconfig';
  }).length;
  var ranDeploy = commandHistory.find(function (_ref4) {
    var name = _ref4.name;
    return name === 'beanstalk.deploy';
  }) && reconfigCount > 1;
  return {
    migrated: previouslyMigrated,
    safeToReconfig: optionEnabled && (previouslyMigrated || ranDeploy),
    enabled: optionEnabled
  };
}

function createVersionDescription(api, appConfig) {
  var appPath = api.resolvePath(api.getBasePath(), appConfig.path);
  var description = '';

  try {
    description = (0, _child_process.execSync)('git log -1 --pretty=%B', {
      cwd: appPath,
      stdio: 'pipe'
    }).toString();
  } catch (e) {
    description = "Deployed by Mup on ".concat(new Date().toUTCString());
  }

  return description.split('\n')[0].slice(0, 195);
}

function ensureSsmDocument(_x31, _x32) {
  return _ensureSsmDocument.apply(this, arguments);
}

function _ensureSsmDocument() {
  _ensureSsmDocument = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee13(name, content) {
    var exists, needsUpdating, result, currentContent;
    return _regenerator.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            exists = true;
            needsUpdating = false;
            _context13.prev = 2;
            _context13.next = 5;
            return _aws.ssm.getDocument({
              Name: name,
              DocumentVersion: '$LATEST'
            }).promise();

          case 5:
            result = _context13.sent;
            // If the document was created or edited on the AWS console, there is extra new
            // line characters and whitespace
            currentContent = JSON.stringify(JSON.parse(result.Content.replace(/\r?\n|\r/g, '')));

            if (currentContent !== content) {
              needsUpdating = true;
            }

            _context13.next = 13;
            break;

          case 10:
            _context13.prev = 10;
            _context13.t0 = _context13["catch"](2);
            exists = false;

          case 13:
            if (exists) {
              _context13.next = 19;
              break;
            }

            _context13.next = 16;
            return _aws.ssm.createDocument({
              Content: content,
              Name: name,
              DocumentType: 'Automation'
            }).promise();

          case 16:
            return _context13.abrupt("return", true);

          case 19:
            if (!needsUpdating) {
              _context13.next = 22;
              break;
            }

            _context13.next = 22;
            return _aws.ssm.updateDocument({
              Content: content,
              Name: name,
              DocumentVersion: '$LATEST'
            }).promise();

          case 22:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[2, 10]]);
  }));
  return _ensureSsmDocument.apply(this, arguments);
}
//# sourceMappingURL=utils.js.map