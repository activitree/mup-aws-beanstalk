"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDesiredConfig = createDesiredConfig;
exports.scalingConfigChanged = scalingConfigChanged;
exports.scalingConfig = scalingConfig;
exports.convertToObject = convertToObject;
exports.mergeConfigs = mergeConfigs;
exports.diffConfig = diffConfig;

var _lodash = require("lodash");

var _utils = require("./utils");

function createDesiredConfig(mupConfig, settings, longEnvVarsVersion) {
  var _mupConfig$app = mupConfig.app,
      env = _mupConfig$app.env,
      instanceType = _mupConfig$app.instanceType,
      _mupConfig$app$custom = _mupConfig$app.customBeanstalkConfig,
      customBeanstalkConfig = _mupConfig$app$custom === void 0 ? [] : _mupConfig$app$custom;

  var _names = (0, _utils.names)(mupConfig),
      instanceProfile = _names.instanceProfile,
      serviceRole = _names.serviceRole;

  var config = {
    OptionSettings: [{
      Namespace: 'aws:autoscaling:trigger',
      OptionName: 'MeasureName',
      Value: 'CPUUtilization'
    }, {
      Namespace: 'aws:autoscaling:trigger',
      OptionName: 'Statistic',
      Value: 'Average'
    }, {
      Namespace: 'aws:autoscaling:trigger',
      OptionName: 'Unit',
      Value: 'Percent'
    }, {
      Namespace: 'aws:autoscaling:trigger',
      OptionName: 'UpperThreshold',
      Value: '75'
    }, {
      Namespace: 'aws:autoscaling:trigger',
      OptionName: 'LowerThreshold',
      Value: '35'
    }, {
      Namespace: 'aws:autoscaling:launchconfiguration',
      OptionName: 'InstanceType',
      Value: instanceType
    }, {
      Namespace: 'aws:autoscaling:launchconfiguration',
      OptionName: 'IamInstanceProfile',
      Value: instanceProfile
    }, {
      Namespace: 'aws:elasticbeanstalk:environment:process:default',
      OptionName: 'HealthyThresholdCount',
      Value: '2'
    }, {
      Namespace: 'aws:elasticbeanstalk:environment:process:default',
      OptionName: 'HealthCheckPath',
      Value: '/aws-health-check-3984729847289743128904723'
    }, {
      Namespace: 'aws:elasticbeanstalk:environment',
      OptionName: 'EnvironmentType',
      Value: 'LoadBalanced'
    }, {
      Namespace: 'aws:elasticbeanstalk:environment',
      OptionName: 'LoadBalancerType',
      Value: 'application'
    }, {
      Namespace: 'aws:elasticbeanstalk:command',
      OptionName: 'DeploymentPolicy',
      Value: 'RollingWithAdditionalBatch'
    }, {
      Namespace: 'aws:elasticbeanstalk:command',
      OptionName: 'BatchSizeType',
      Value: 'Percentage'
    }, {
      Namespace: 'aws:elasticbeanstalk:command',
      OptionName: 'BatchSize',
      Value: '30'
    }, {
      Namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
      OptionName: 'RollingUpdateEnabled',
      Value: 'true'
    }, {
      Namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
      OptionName: 'RollingUpdateType',
      Value: 'Health'
    }, {
      Namespace: 'aws:elasticbeanstalk:environment',
      OptionName: 'ServiceRole',
      Value: serviceRole
    }, {
      Namespace: 'aws:elasticbeanstalk:healthreporting:system',
      OptionName: 'SystemType',
      Value: 'enhanced'
    }, {
      Namespace: 'aws:elasticbeanstalk:environment:process:default',
      OptionName: 'StickinessEnabled',
      Value: 'true'
    }, {
      Namespace: 'aws:elasticbeanstalk:environment:process:default',
      OptionName: 'DeregistrationDelay',
      Value: '75'
    }]
  };
  var settingsString = JSON.stringify(settings);

  if (longEnvVarsVersion) {
    config.OptionSettings.push({
      Namespace: 'aws:elasticbeanstalk:application:environment',
      OptionName: 'MUP_ENV_FILE_VERSION',
      Value: longEnvVarsVersion.toString()
    });
  } else {
    env.METEOR_SETTINGS_ENCODED = encodeURIComponent(settingsString);
    Object.keys(env).forEach(function (envName) {
      var value = env[envName];
      config.OptionSettings.push({
        Namespace: 'aws:elasticbeanstalk:application:environment',
        OptionName: envName,
        Value: value.toString()
      });
    });
  }

  var customOptions = customBeanstalkConfig.map(function (option) {
    return {
      Namespace: option.namespace,
      OptionName: option.option,
      Value: option.value
    };
  });
  config.OptionSettings = mergeConfigs(config.OptionSettings, customOptions);
  return config;
}

function scalingConfigChanged(currentConfig, mupConfig) {
  var _mupConfig$app2 = mupConfig.app,
      minInstances = _mupConfig$app2.minInstances,
      maxInstances = _mupConfig$app2.maxInstances;
  var currentMinInstances = 0;
  var currentMaxInstances = 0;
  currentConfig.forEach(function (item) {
    if (item.Namespace === 'aws:autoscaling:asg') {
      if (item.OptionName === 'MinSize') {
        currentMinInstances = item.Value;
      } else if (item.OptionName === 'MaxSize') {
        currentMaxInstances = item.Value;
      }
    }
  });
  return currentMinInstances !== minInstances.toString() || currentMaxInstances !== maxInstances.toString();
}

function scalingConfig(_ref) {
  var minInstances = _ref.minInstances,
      maxInstances = _ref.maxInstances;
  return {
    OptionSettings: [{
      Namespace: 'aws:autoscaling:asg',
      OptionName: 'MinSize',
      Value: minInstances.toString()
    }, {
      Namespace: 'aws:autoscaling:asg',
      OptionName: 'MaxSize',
      Value: maxInstances.toString()
    }]
  };
}

function convertToObject(result, option) {
  result["".concat(option.Namespace, "-").concat(option.OptionName)] = option;
  return result;
}

function mergeConfigs(config1, config2) {
  config1 = config1.reduce(convertToObject, {});
  config2.forEach(function (option) {
    var key = ["".concat(option.Namespace, "-").concat(option.OptionName)];
    config1[key] = option;
  });
  return Object.values(config1);
}

function diffConfig(current, desired) {
  current = current.reduce(convertToObject, {});
  desired = desired.reduce(convertToObject, {});
  var toRemove = (0, _lodash.difference)(Object.keys(current), Object.keys(desired)).filter(function (key) {
    return key.indexOf('aws:elasticbeanstalk:application:environment-') === 0;
  }).map(function (key) {
    var option = current[key];
    return {
      Namespace: option.Namespace,
      OptionName: option.OptionName
    };
  });
  var toUpdate = Object.keys(desired).filter(function (key) {
    if (key in current && current[key].Value === desired[key].Value) {
      return false;
    }

    return true;
  }).map(function (key) {
    return desired[key];
  });
  return {
    toRemove: toRemove,
    toUpdate: toUpdate
  };
}
//# sourceMappingURL=eb-config.js.map