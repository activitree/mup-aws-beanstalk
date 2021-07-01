"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trailBucketPolicy = trailBucketPolicy;
exports.eventTargetRolePolicy = eventTargetRolePolicy;
exports.gracefulShutdownAutomationDocument = exports.deregisterEventTarget = exports.DeregisterEvent = exports.passRolePolicy = exports.eventTargetRole = exports.serviceRole = exports.rolePolicy = void 0;

function trailBucketPolicy(accountId, bucketName) {
  var policy = {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'AWSCloudTrailAclCheck20150319',
      Effect: 'Allow',
      Principal: {
        Service: 'cloudtrail.amazonaws.com'
      },
      Action: 's3:GetBucketAcl',
      Resource: "arn:aws:s3:::".concat(bucketName)
    }, {
      Sid: 'AWSCloudTrailWrite20150319',
      Effect: 'Allow',
      Principal: {
        Service: 'cloudtrail.amazonaws.com'
      },
      Action: 's3:PutObject',
      Resource: "arn:aws:s3:::".concat(bucketName, "/AWSLogs/").concat(accountId, "/*"),
      Condition: {
        StringEquals: {
          's3:x-amz-acl': 'bucket-owner-full-control'
        }
      }
    }]
  };
  return JSON.stringify(policy);
}

var rolePolicy = '{ "Version": "2008-10-17", "Statement": [ { "Effect": "Allow", "Principal": { "Service": "ec2.amazonaws.com" }, "Action": "sts:AssumeRole" } ] }';
exports.rolePolicy = rolePolicy;
var serviceRole = '{ "Version": "2012-10-17", "Statement": [ { "Effect": "Allow", "Principal": { "Service": "elasticbeanstalk.amazonaws.com" }, "Action": "sts:AssumeRole", "Condition": { "StringEquals": { "sts:ExternalId": "elasticbeanstalk" } } } ] }';
exports.serviceRole = serviceRole;
var eventTargetRole = '{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Principal": { "Service": "events.amazonaws.com" }, "Action": "sts:AssumeRole" }, { "Effect": "Allow", "Principal": { "Service": [ "ssm.amazonaws.com", "ec2.amazonaws.com" ] }, "Action": "sts:AssumeRole" } ] }';
exports.eventTargetRole = eventTargetRole;

var passRolePolicy = function passRolePolicy(accountId, role) {
  var policy = {
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Action: 'iam:PassRole',
      Resource: "arn:aws:iam::".concat(accountId, ":role/").concat(role)
    }]
  };
  return JSON.stringify(policy);
};

exports.passRolePolicy = passRolePolicy;

function eventTargetRolePolicy(accountId, env, region) {
  var policy = {
    Version: '2012-10-17',
    Statement: [{
      Action: 'ssm:SendCommand',
      Effect: 'Allow',
      Resource: "arn:aws:ec2:".concat(region, ":").concat(accountId, ":instance/*"),
      Condition: {
        StringLike: {
          'ssm:resourceTag/elasticbeanstalk:environment-name': [env]
        }
      }
    }, {
      Action: 'ssm:SendCommand',
      Effect: 'Allow',
      Resource: "arn:aws:ssm:".concat(region, ":*:document/AWS-RunShellScript")
    }, {
      Action: ['ssm:StartAutomationExecution', 'ssm:DescribeInstanceInformation', 'ssm:ListCommands', 'ssm:ListCommandInvocations'],
      Effect: 'Allow',
      Resource: ['*']
    }]
  };
  return JSON.stringify(policy);
}

var DeregisterEvent = '{ "source": [ "aws.elasticloadbalancing" ], "detail-type": [ "AWS API Call via CloudTrail" ], "detail": { "eventSource": [ "elasticloadbalancing.amazonaws.com" ], "eventName": [ "DeregisterTargets" ] } }';
exports.DeregisterEvent = DeregisterEvent;

var deregisterEventTarget = function deregisterEventTarget(envName, role, accountId, region) {
  return {
    Id: "mup-target-".concat(envName),
    Arn: "arn:aws:ssm:".concat(region, ":").concat(accountId, ":automation-definition/mup-graceful-shutdown:$LATEST"),
    RoleArn: "arn:aws:iam::".concat(accountId, ":role/").concat(role),
    InputTransformer: {
      InputPathsMap: {
        instance: '$.detail.requestParameters.targets[0].id'
      },
      InputTemplate: "{\"InstanceId\":[<instance>], \"AutomationAssumeRole\": [\"arn:aws:iam::".concat(accountId, ":role/").concat(role, "\"], \"ServiceRole\": [\"arn:aws:iam::").concat(accountId, ":role/").concat(role, "\"], \"Commands\": [\"cd /mup_graceful_shutdown || exit 1\", \"ls\", \"PATH='/mup_graceful_shutdown'\", <instance>]}")
    }
  };
};

exports.deregisterEventTarget = deregisterEventTarget;

var gracefulShutdownAutomationDocument = function gracefulShutdownAutomationDocument() {
  var document = {
    description: 'Automation document for mup-aws-beanstalk graceful shutdown',
    schemaVersion: '0.3',
    assumeRole: '{{ AutomationAssumeRole }}',
    parameters: {
      InstanceId: {
        type: 'StringList',
        description: '(Required) EC2 Instance(s) to run the command on'
      },
      AutomationAssumeRole: {
        type: 'String',
        description: '(Optional) The ARN of the role that allows Automation to perform the actions on your behalf.',
        default: ''
      },
      Commands: {
        type: 'StringList',
        description: 'Commands to run'
      },
      ServiceRole: {
        type: 'String',
        description: 'The ARN of the role for runCommand'
      }
    },
    mainSteps: [{
      name: 'runCommand',
      action: 'aws:runCommand',
      inputs: {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: '{{ InstanceId }}',
        ServiceRoleArn: '{{ ServiceRole }}',
        Parameters: {
          commands: '{{ Commands }}'
        }
      }
    }]
  };
  return JSON.stringify(document);
};

exports.gracefulShutdownAutomationDocument = gracefulShutdownAutomationDocument;
//# sourceMappingURL=policies.js.map