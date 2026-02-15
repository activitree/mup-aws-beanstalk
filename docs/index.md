# @activitree/mup-aws-beanstalk Documentation

Deploy Meteor applications to AWS Elastic Beanstalk with ease.

## Table of Contents

- [Getting Started](./getting-started.md)
- [Configuration Reference](./configuration.md)
- [Launch Templates Migration](./launch-templates.md)
- [Spot Instances](./spot-instances.md)
- [Commands Reference](./commands.md)

## Features

- 🚀 **Zero Downtime Deploys** - Rolling updates with health checks
- ⚖️ **Auto Scaling** - Automatic instance scaling based on CPU/memory
- 💰 **Spot Instances** - Cost savings up to 90% with Spot Instance support
- 🔒 **SSL/TLS** - Automatic certificate provisioning via AWS ACM
- 📊 **Enhanced Health Monitoring** - CloudWatch integration
- 🔄 **Traffic Splitting** - Canary deployments for safe rollouts
- 🎯 **Launch Templates** - Modern EC2 instance management

## Quick Start

```javascript
// mup.js
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'my-meteor-app',
    path: '../',
    region: 'us-east-1',
    instanceTypes: ['t3.small', 't3a.small'],
    minInstances: 1,
    maxInstances: 3,
    env: {
      ROOT_URL: 'https://myapp.com',
      MONGO_URL: 'mongodb://...'
    },
    auth: {
      id: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY
    }
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Deploy

```bash
mup deploy
```

## Requirements

- Node.js >= 22.0.0
- Meteor application
- AWS Account with appropriate permissions
- Meteor Up (`mup`) installed globally

## AWS Permissions

The following AWS managed policies are recommended:

- `AWSElasticBeanstalkWebTier`
- `AWSElasticBeanstalkWorkerTier`
- `AWSElasticBeanstalkMulticontainerDocker`
- `AWSElasticBeanstalkEnhancedHealth`
- `AWSElasticBeanstalkService`

For Launch Templates (recommended), also ensure:
- `ec2:CreateLaunchTemplate`
- `ec2:CreateLaunchTemplateVersions`
- `ec2:DeleteLaunchTemplate`
- `ec2:DeleteLaunchTemplateVersions`
- `ec2:DescribeLaunchTemplates`
- `ec2:DescribeLaunchTemplateVersions`
- `ec2:RunInstances`

## Support

- [GitHub Issues](https://github.com/activitree/mup-aws-beanstalk/issues)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
