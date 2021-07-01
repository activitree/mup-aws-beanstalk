"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configure;
exports.ssm = exports.sts = exports.cloudWatchEvents = exports.cloudTrail = exports.acm = exports.autoScaling = exports.iam = exports.beanstalk = exports.s3 = void 0;

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

/* eslint-disable import/no-mutable-exports */
var s3 = {};
exports.s3 = s3;
var beanstalk = {};
exports.beanstalk = beanstalk;
var iam = {};
exports.iam = iam;
var autoScaling = {};
exports.autoScaling = autoScaling;
var acm = {};
exports.acm = acm;
var cloudTrail = {};
exports.cloudTrail = cloudTrail;
var cloudWatchEvents = {};
exports.cloudWatchEvents = cloudWatchEvents;
var sts = {};
exports.sts = sts;
var ssm = {};
/* eslint-enable import/no-mutable-exports */

exports.ssm = ssm;

function configure(_ref) {
  var auth = _ref.auth,
      name = _ref.name,
      region = _ref.region;
  var options = {
    accessKeyId: auth.id,
    secretAccessKey: auth.secret,
    region: region || 'us-east-1'
  };

  _awsSdk.default.config.update(options);

  exports.s3 = s3 = new _awsSdk.default.S3({
    params: {
      Bucket: "mup-".concat(name)
    },
    apiVersion: '2006-03-01'
  });
  exports.beanstalk = beanstalk = new _awsSdk.default.ElasticBeanstalk({
    apiVersion: '2010-12-01'
  });
  exports.iam = iam = new _awsSdk.default.IAM({
    apiVersion: '2010-05-08'
  });
  exports.autoScaling = autoScaling = new _awsSdk.default.AutoScaling({
    apiVersion: '2011-01-01'
  });
  exports.acm = acm = new _awsSdk.default.ACM({
    apiVersion: '2015-12-08'
  });
  exports.cloudTrail = cloudTrail = new _awsSdk.default.CloudTrail({
    apiVersion: '2013-11-01'
  });
  exports.sts = sts = new _awsSdk.default.STS({
    apiVersion: '2011-06-15'
  });
  exports.cloudWatchEvents = cloudWatchEvents = new _awsSdk.default.CloudWatchEvents({
    apiVersion: '2015-10-07'
  });
  exports.ssm = ssm = new _awsSdk.default.SSM({
    apiVersion: '2014-11-06'
  });
}
//# sourceMappingURL=aws.js.map