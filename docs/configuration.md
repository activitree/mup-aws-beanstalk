# Configuration Reference

Complete reference for all configuration options in `mup.js`.

## Required Configuration

```javascript
module.exports = {
  app: {
    type: 'aws-beanstalk',  // Required: Tells mup to use this plugin
    name: 'my-app',         // Required: App name (min 4 characters)
    path: '../',            // Required: Path to Meteor app
    region: 'us-east-1',    // Required: AWS region
    
    auth: {                 // Required: AWS credentials
      id: '...',
      secret: '...'
    },
    
    env: {                  // Required: Environment variables
      ROOT_URL: 'https://example.com',
      MONGO_URL: 'mongodb://...'
    }
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Instance Configuration

### Instance Types (Launch Template)

```javascript
app: {
  // Single instance type (legacy)
  instanceType: 't3.small',
  
  // Multiple instance types (recommended)
  // Provides flexibility and Spot Instance support
  instanceTypes: ['t3.small', 't3a.small', 't2.small']
}
```

### Spot Instances

```javascript
app: {
  spotInstances: {
    enabled: true,
    
    // Instance types for Spot (overrides instanceTypes)
    instanceTypes: ['t3.small', 't3a.small', 't2.small'],
    
    // Allocation strategy
    spotAllocationStrategy: 'capacity-optimized-prioritized',
    // Options: 'capacity-optimized-prioritized', 'lowest-price', 
    //          'capacity-optimized', 'price-capacity-optimized'
    
    // Minimum On-Demand instances
    onDemandBase: 1,
    
    // Percentage of On-Demand above base (0-100)
    onDemandAboveBasePercentage: 30
  }
}
```

### Root Volume Configuration

```javascript
app: {
  rootVolume: {
    size: 20,              // GB (minimum 8)
    type: 'gp3',           // 'gp2', 'gp3', 'io1', 'io2', 'standard'
    iops: 3000,            // For io1/io2
    throughput: 125        // MiB/s for gp3
  }
}
```

### IMDSv2 Enforcement

```javascript
app: {
  // Disable IMDSv1 and enforce IMDSv2
  // This triggers Launch Template migration
  disableIMDSv1: true
}
```

## Scaling Configuration

```javascript
app: {
  minInstances: 1,
  maxInstances: 5,
  
  // Target tracking scaling (optional)
  targetTrackingScaling: {
    enabled: true,
    targetCPU: 70,                      // Target CPU utilization
    targetRequestCountPerTarget: 1000   // Target requests per target
  }
}
```

## Environment Configuration

```javascript
app: {
  // Environment type
  envType: 'webserver',  // 'webserver' or 'worker'
  
  // Custom environment name (optional)
  envName: 'production',
  
  // Environment variables
  env: {
    ROOT_URL: 'https://example.com',
    MONGO_URL: 'mongodb://...',
    METEOR_SETTINGS_ENCODED: '...',  // Auto-encoded settings
    
    // Custom variables
    MY_CUSTOM_VAR: 'value'
  }
}
```

## SSL/TLS Configuration

```javascript
app: {
  // SSL domains (auto-provisions certificates)
  sslDomains: ['example.com', 'www.example.com'],
  
  // Force SSL redirect
  forceSSL: true
}
```

## VPC Configuration

```javascript
app: {
  vpc: {
    enabled: true,
    vpcId: 'vpc-xxx',
    subnets: ['subnet-xxx', 'subnet-yyy'],
    elbSubnets: ['subnet-xxx', 'subnet-yyy'],
    associatePublicIpAddress: true
  }
}
```

## Secrets Manager Integration

```javascript
app: {
  secretsManager: {
    enabled: true,
    secrets: [
      {
        name: 'MONGO_URL',
        arn: 'arn:aws:secretsmanager:region:account:secret:name'
      }
    ]
  }
}
```

## Traffic Splitting (Canary Deployments)

```javascript
app: {
  trafficSplitting: {
    enabled: true,
    newVersionPercent: 15,    // Percentage of traffic to new version
    evaluationTime: 10        // Minutes to evaluate before full rollout
  }
}
```

## Logging Configuration

```javascript
app: {
  // Stream logs to CloudWatch
  streamLogs: true,
  
  // Number of old versions to keep
  oldVersions: 3
}
```

## Graceful Shutdown

```javascript
app: {
  // Enable graceful shutdown handling
  gracefulShutdown: true
}
```

## Long Environment Variables

For large environment configurations:

```javascript
app: {
  // Store env vars in S3 instead of EB configuration
  longEnvVars: true
}
```

## Custom Beanstalk Configuration

Add any Elastic Beanstalk configuration option:

```javascript
app: {
  customBeanstalkConfig: [
    {
      namespace: 'aws:ec2:vpc',
      option: 'VPCId',
      value: 'vpc-xxx'
    },
    {
      namespace: 'aws:autoscaling:trigger',
      option: 'UpperThreshold',
      value: '80'
    },
    {
      namespace: 'aws:elasticbeanstalk:command',
      option: 'DeploymentPolicy',
      value: 'RollingWithAdditionalBatch'
    }
  ]
}
```

## SSH Access

```javascript
app: {
  sshKey: {
    privateKey: '/path/to/private/key',
    publicKey: '/path/to/public/key'
  }
}
```

## Build Options

```javascript
app: {
  buildOptions: {
    buildLocation: '/tmp/build',
    serverOnly: true,
    debug: false,
    mobileSettings: {},
    server: 'main.js',
    allowIncompatibleUpdates: false,
    executable: 'meteor'
  }
}
```

## Launch Template Tag Propagation

```javascript
app: {
  // Propagate environment tags to launch templates
  launchTemplateTagPropagation: true
}
```

## Complete Example

```javascript
module.exports = {
  app: {
    // Required
    type: 'aws-beanstalk',
    name: 'my-meteor-app',
    path: '../',
    region: 'eu-central-1',
    
    // Authentication
    auth: {
      id: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY
    },
    
    // Instance Configuration (Launch Template)
    instanceTypes: ['t3.small', 't3a.small', 't2.small'],
    disableIMDSv1: true,
    rootVolume: {
      size: 20,
      type: 'gp3'
    },
    
    // Spot Instances
    spotInstances: {
      enabled: true,
      onDemandBase: 1,
      onDemandAboveBasePercentage: 30,
      spotAllocationStrategy: 'capacity-optimized-prioritized'
    },
    
    // Scaling
    minInstances: 2,
    maxInstances: 10,
    targetTrackingScaling: {
      enabled: true,
      targetCPU: 70
    },
    
    // Environment
    envType: 'webserver',
    env: {
      ROOT_URL: 'https://example.com',
      MONGO_URL: 'mongodb+srv://...',
      HTTP_FORWARDED_COUNT: '2'
    },
    
    // SSL
    sslDomains: ['example.com', 'www.example.com'],
    forceSSL: true,
    
    // VPC
    vpc: {
      enabled: true,
      vpcId: 'vpc-xxx',
      subnets: ['subnet-xxx', 'subnet-yyy'],
      elbSubnets: ['subnet-xxx', 'subnet-yyy'],
      associatePublicIpAddress: true
    },
    
    // Logging
    streamLogs: true,
    oldVersions: 3,
    
    // Deployment
    trafficSplitting: {
      enabled: true,
      newVersionPercent: 15,
      evaluationTime: 10
    },
    
    // Graceful shutdown
    gracefulShutdown: true,
    
    // Custom configuration
    customBeanstalkConfig: [
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'UpperThreshold',
        value: '80'
      }
    ]
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Namespace Reference

Common Elastic Beanstalk namespaces for `customBeanstalkConfig`:

| Namespace | Purpose |
|-----------|---------|
| `aws:ec2:instances` | Instance types, Spot configuration |
| `aws:autoscaling:asg` | Auto Scaling group settings |
| `aws:autoscaling:trigger` | Scaling triggers |
| `aws:autoscaling:launchconfiguration` | Launch configuration (deprecated) |
| `aws:elasticbeanstalk:environment` | Environment settings |
| `aws:elasticbeanstalk:command` | Deployment settings |
| `aws:elasticbeanstalk:cloudwatch:logs` | Log streaming |
| `aws:ec2:vpc` | VPC configuration |
| `aws:elbv2:loadbalancer` | Load balancer settings |

See [AWS Documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html) for all available options.
