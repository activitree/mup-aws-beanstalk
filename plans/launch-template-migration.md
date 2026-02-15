# Migration Plan: Launch Configuration to Launch Templates

## Executive Summary

AWS is deprecating Launch Configurations in favor of Launch Templates. This migration plan outlines the necessary changes to the `@activitree/mup-aws-beanstalk` package to support Launch Templates while maintaining backward compatibility.

## Current State Analysis

### Current Implementation

The package currently uses the `aws:autoscaling:launchconfiguration` namespace in [`src/eb-config.ts`](src/eb-config.ts:52-58):

```typescript
{
  Namespace: 'aws:autoscaling:launchconfiguration',
  OptionName: 'InstanceType',
  Value: instanceType
}, {
  Namespace: 'aws:autoscaling:launchconfiguration',
  OptionName: 'IamInstanceProfile',
  Value: instanceProfile
}
```

### User Configuration Example

Users configure instance types using `customBeanstalkConfig`:

```javascript
{
  namespace: 'aws:autoscaling:launchconfiguration',
  option: 'InstanceType',
  value: 't3.small'
}
```

## AWS Migration Details

### How AWS Handles the Migration

AWS Elastic Beanstalk automatically migrates environments to Launch Templates when certain options are used:

```mermaid
flowchart TD
    A[Environment Update] --> B{Uses Launch Template Options?}
    B -->|Yes| C[Create Launch Template]
    B -->|No| D[Use Launch Configuration]
    C --> E[Update Auto Scaling Group]
    D --> E
    
    subgraph Launch Template Triggers
        F[DisableIMDSv1]
        G[RootVolumeType]
        H[BlockDeviceMappings]
        I[LaunchTemplateTagPropagationEnabled]
    end
    
    F --> B
    G --> B
    H --> B
    I --> B
```

### Key Namespaces

| Namespace | Purpose | Status |
|-----------|---------|--------|
| `aws:autoscaling:launchconfiguration` | Legacy Launch Configuration | Deprecated but functional |
| `aws:ec2:instances` | Modern instance configuration | Recommended |
| `aws:ec2:vpc` | VPC configuration | Unchanged |

### Configuration Options Mapping

#### Instance Types

| Old Option | New Option |
|------------|------------|
| `aws:autoscaling:launchconfiguration:InstanceType` | `aws:ec2:instances:InstanceTypes` |

**Note**: The new `InstanceTypes` accepts a comma-separated list for instance flexibility.

#### IAM Instance Profile

| Old Option | New Option |
|------------|------------|
| `aws:autoscaling:launchconfiguration:IamInstanceProfile` | Same namespace still works |

#### New Spot Instance Options

```yaml
aws:ec2:instances:
  EnableSpot: true
  InstanceTypes: 't2.micro,t3.micro,t3.small'
  SpotAllocationStrategy: capacity-optimized-prioritized
  SpotFleetOnDemandBase: '1'
  SpotFleetOnDemandAboveBasePercentage: '33'
```

## Required IAM Permissions

The following permissions must be added to the instance profile for Launch Template support:

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:CreateLaunchTemplate",
        "ec2:CreateLaunchTemplateVersions",
        "ec2:DeleteLaunchTemplate",
        "ec2:DeleteLaunchTemplateVersions",
        "ec2:DescribeLaunchTemplate",
        "ec2:DescribeLaunchTemplateVersions"
      ],
      "Resource": ["*"]
    }
  ]
}
```

## Implementation Plan

### Phase 1: Code Updates

#### 1.1 Update [`src/eb-config.ts`](src/eb-config.ts)

- Replace `aws:autoscaling:launchconfiguration` with `aws:ec2:instances` for instance types
- Add support for multiple instance types
- Add Spot Instance configuration options
- Maintain backward compatibility

#### 1.2 Update [`src/types.ts`](src/types.ts)

Add new configuration options:

```typescript
export type SpotInstanceConfig = {
  enabled: boolean;
  instanceTypes?: string[];
  spotAllocationStrategy?: 'capacity-optimized-prioritized' | 'lowest-price' | 'capacity-optimized' | 'price-capacity-optimized';
  onDemandBase?: number;
  onDemandAboveBasePercentage?: number;
};

export type MupAwsConfig = {
  // ... existing fields
  instanceTypes?: string[];  // New: multiple instance types
  spotInstances?: SpotInstanceConfig;  // New: Spot configuration
  disableIMDSv1?: boolean;  // New: IMDSv2 enforcement
  rootVolumeSize?: number;  // Existing, now triggers Launch Template
  rootVolumeType?: 'gp2' | 'gp3' | 'io1' | 'io2' | 'standard';
};
```

#### 1.3 Update [`src/validate.ts`](src/validate.ts)

Add validation for new options.

#### 1.4 Update [`src/policies.ts`](src/policies.ts)

Add Launch Template IAM permissions.

### Phase 2: Documentation

#### 2.1 Create Documentation Structure

```
docs/
├── index.md                    # Main documentation index
├── getting-started.md          # Getting started guide
├── configuration.md            # Configuration options reference
├── launch-templates.md         # Launch Template migration guide
├── spot-instances.md           # Spot Instance configuration
└── examples/
    └── mup-config-example.js   # Complete configuration example
```

#### 2.2 Document Critical Changes

1. **Instance Type Configuration**
   - Old: Single instance type via `instanceType` or `customBeanstalkConfig`
   - New: Multiple instance types via `instanceTypes` array

2. **Spot Instances**
   - New feature: Enable Spot Instances for cost savings
   - Requires `aws:ec2:instances:EnableSpot: true`

3. **IMDSv2 Enforcement**
   - New option: `disableIMDSv1: true`
   - Triggers Launch Template migration

4. **IAM Permissions**
   - New permissions required for Launch Templates
   - Update custom policies or use AWS managed policies

### Phase 3: Migration Guide for Users

#### For New Deployments

No action required - Launch Templates will be used automatically.

#### For Existing Deployments

1. **Option A: Automatic Migration**
   - Add `disableIMDSv1: true` to configuration
   - Deploy - AWS will migrate automatically

2. **Option B: Manual Migration**
   - Update `customBeanstalkConfig` to use new namespace
   - Deploy with new configuration

#### Breaking Changes

| Change | Impact | Mitigation |
|--------|--------|------------|
| IAM permissions | Deployment fails | Update IAM policies |
| Instance type namespace | Ignored if using old namespace | Update configuration |
| Spot instances | New instances may be Spot | Review Spot settings |

## Configuration Examples

### Basic Configuration (Launch Template Compatible)

```javascript
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'my-app',
    path: '../',
    region: 'eu-central-1',
    instanceTypes: ['t3.small', 't3a.small', 't2.small'],  // Multiple types
    minInstances: 1,
    maxInstances: 3,
    env: {
      ROOT_URL: 'https://example.com',
      MONGO_URL: 'mongodb://...'
    },
    auth: {
      id: '...',
      secret: '...'
    }
  }
};
```

### With Spot Instances

```javascript
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'my-app',
    path: '../',
    region: 'eu-central-1',
    instanceTypes: ['t3.small', 't3a.small', 't2.small'],
    spotInstances: {
      enabled: true,
      onDemandBase: 1,  // At least 1 On-Demand instance
      onDemandAboveBasePercentage: 30,  // 30% On-Demand above base
      spotAllocationStrategy: 'capacity-optimized-prioritized'
    },
    minInstances: 2,
    maxInstances: 10,
    env: { /* ... */ },
    auth: { /* ... */ }
  }
};
```

### Full Configuration Example

```javascript
module.exports = {
  app: {
    // Required
    type: 'aws-beanstalk',
    name: 'my-meteor-app',  // Min 4 characters
    path: '../',
    
    // AWS Configuration
    region: 'eu-central-1',
    auth: {
      id: 'AKIAIOSFODNN7EXAMPLE',
      secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    },
    
    // Instance Configuration (Launch Template)
    instanceTypes: ['t3.small', 't3a.small'],
    disableIMDSv1: true,  // Enforce IMDSv2, triggers Launch Template
    
    // Spot Instances (optional)
    spotInstances: {
      enabled: true,
      onDemandBase: 1,
      onDemandAboveBasePercentage: 30,
      spotAllocationStrategy: 'capacity-optimized-prioritized'
    },
    
    // Scaling
    minInstances: 1,
    maxInstances: 5,
    
    // Environment
    envType: 'webserver',  // or 'worker'
    env: {
      ROOT_URL: 'https://example.com',
      MONGO_URL: 'mongodb+srv://...',
      METEOR_SETTINGS_ENCODED: '...'  // Or use longEnvVars
    },
    
    // SSL
    sslDomains: ['example.com', 'www.example.com'],
    forceSSL: true,
    
    // Advanced
    longEnvVars: false,
    streamLogs: true,
    oldVersions: 3,
    gracefulShutdown: true,
    
    // VPC (optional)
    vpc: {
      enabled: true,
      vpcId: 'vpc-xxx',
      subnets: ['subnet-xxx', 'subnet-yyy'],
      elbSubnets: ['subnet-xxx', 'subnet-yyy'],
      associatePublicIpAddress: true
    },
    
    // Secrets Manager (optional)
    secretsManager: {
      enabled: true,
      secrets: [
        { name: 'MONGO_URL', arn: 'arn:aws:secretsmanager:...' }
      ]
    },
    
    // Target Tracking Scaling (optional)
    targetTrackingScaling: {
      enabled: true,
      targetCPU: 70,
      targetRequestCountPerTarget: 1000
    },
    
    // Traffic Splitting / Canary (optional)
    trafficSplitting: {
      enabled: true,
      newVersionPercent: 15,
      evaluationTime: 10
    },
    
    // Custom Beanstalk Config (advanced)
    customBeanstalkConfig: [
      {
        namespace: 'aws:ec2:vpc',
        option: 'VPCId',
        value: 'vpc-xxx'
      },
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'UpperThreshold',
        value: '75'
      }
    ]
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Testing Strategy

1. **Unit Tests**: Test new configuration options
2. **Integration Tests**: Test with AWS Elastic Beanstalk
3. **Migration Tests**: Test upgrading existing environments
4. **Spot Instance Tests**: Verify Spot Instance behavior

## Rollback Plan

If issues arise:
1. Revert to previous package version
2. Existing environments continue using Launch Configurations
3. New environments can use old namespace temporarily

## Timeline

| Phase | Tasks |
|-------|-------|
| Phase 1 | Code updates in src/ files |
| Phase 2 | Documentation creation |
| Phase 3 | Testing and validation |
| Phase 4 | Release and user communication |