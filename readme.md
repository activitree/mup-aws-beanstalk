## @activitree/mup-aws-beanstalk

Plugin for Meteor Up to deploy using AWS Elastic Beanstalk.

## Features

- 🚀 **Zero Downtime Deploys** - Rolling updates with health checks
- ⚖️ **Auto Scaling** - Automatic instance scaling based on CPU/memory
- 💰 **Spot Instances** - Cost savings up to 90% with Spot Instance support
- 🎯 **Launch Templates** - Modern EC2 instance management (replaces deprecated Launch Configurations)
- 🔒 **SSL/TLS** - Automatic certificate provisioning via AWS ACM
- 📊 **Enhanced Health Monitoring** - CloudWatch integration
- 🔄 **Traffic Splitting** - Canary deployments for safe rollouts
- 🌐 **VPC Support** - Deploy to custom VPC with private subnets
- 🔐 **Secrets Manager** - Secure credential management

## Quick Start

```javascript
// mup.js
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'my-meteor-app',
    path: '../',
    region: 'us-east-1',
    
    // Multiple instance types for flexibility
    instanceTypes: ['t3.small', 't3a.small'],
    
    // Optional: Spot Instances for cost savings
    spotInstances: {
      enabled: true,
      onDemandBase: 1,
      onDemandAboveBasePercentage: 30
    },
    
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

## What's New in 0.10.x

### Launch Templates Support

AWS is deprecating Launch Configurations. This plugin now supports Launch Templates with:

- **Multiple Instance Types** - Define fallback instance types for availability
- **Spot Instances** - Save up to 90% on compute costs
- **IMDSv2 Enforcement** - Improved security for instance metadata
- **Root Volume Configuration** - Customize EBS volumes

### Migration from Launch Configurations

Existing deployments continue to work. To enable Launch Templates:

```javascript
app: {
  // Use instanceTypes instead of instanceType
  instanceTypes: ['t3.small', 't3a.small'],
  
  // Or enable any Launch Template feature
  disableIMDSv1: true,
  spotInstances: { enabled: true }
}
```

See the [Launch Templates Migration Guide](./docs/launch-templates.md) for details.

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Configuration Reference](./docs/configuration.md)
- [Launch Templates Migration](./docs/launch-templates.md)
- [Spot Instances](./docs/spot-instances.md)
- [Commands Reference](./docs/commands.md)
- [Changelog](./docs/changelog.md)

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

For Launch Templates, also ensure EC2 permissions:
- `ec2:CreateLaunchTemplate`
- `ec2:CreateLaunchTemplateVersions`
- `ec2:DeleteLaunchTemplate`
- `ec2:DeleteLaunchTemplateVersions`
- `ec2:DescribeLaunchTemplates`
- `ec2:DescribeLaunchTemplateVersions`
- `ec2:RunInstances`

## Commands

| Command | Description |
|---------|-------------|
| `mup deploy` | Deploy application |
| `mup beanstalk setup` | Initialize AWS resources |
| `mup beanstalk status` | View application status |
| `mup beanstalk logs` | View application logs |
| `mup beanstalk start` | Start application |
| `mup beanstalk stop` | Stop application |
| `mup beanstalk restart` | Restart application |
| `mup beanstalk reconfig` | Update configuration |
| `mup beanstalk ssl` | Setup SSL certificates |
| `mup beanstalk shell` | Open Meteor shell |
| `mup beanstalk debug` | Connect debugger |

## Example with Your Configuration

Based on your current setup, here's the updated configuration:

```javascript
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'social-4',
    path: '../',
    region: 'eu-central-1',
    
    // Launch Template configuration
    instanceTypes: ['t3.small', 't3a.small'],
    disableIMDSv1: true,  // Enforce IMDSv2
    
    // Optional: Enable Spot Instances
    spotInstances: {
      enabled: false,  // Set to true to enable
      onDemandBase: 1,
      onDemandAboveBasePercentage: 30
    },
    
    // Scaling
    minInstances: 1,
    maxInstances: 3,
    
    // Environment
    envType: 'webserver',
    env: {
      METEOR_DISABLE_OPTIMISTIC_CACHING: 1,
      HTTP_FORWARDED_COUNT: 2,
      ROOT_URL: 'https://www.activitree.com',
      MONGO_URL: 'mongodb+srv://...',
      MONGO_CONTACTS_URL: 'mongodb+srv://...'
    },
    
    // Auth
    auth: {
      id: '...',
      secret: '...'
    },
    
    // Custom Beanstalk config
    customBeanstalkConfig: [
      {
        namespace: 'aws:ec2:vpc',
        option: 'VPCId',
        value: 'vpc-0d23022a09f1370e4'
      },
      {
        namespace: 'aws:ec2:vpc',
        option: 'Subnets',
        value: 'subnet-06c1c8bd8133f7662,subnet-0d92a9818da3fbfec,subnet-0f208a7c67ba4f607'
      },
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'LowerThreshold',
        value: '20'
      },
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'UpperThreshold',
        value: '75'
      },
      {
        namespace: 'aws:elasticbeanstalk:command',
        option: 'DeploymentPolicy',
        value: 'AllAtOnce'
      },
      {
        namespace: 'aws:elasticbeanstalk:environment',
        option: 'LoadBalancerIsShared',
        value: 'true'
      },
      {
        namespace: 'aws:elbv2:loadbalancer',
        option: 'SharedLoadBalancer',
        value: 'arn:aws:elasticloadbalancing:eu-central-1:340446231013:loadbalancer/app/activitree-custom-SALB/a0e6cd076d898e8e'
      }
    ],
    
    oldVersions: 2
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Support

- [GitHub Issues](https://github.com/activitree/mup-aws-beanstalk/issues)
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)

## License

MIT
