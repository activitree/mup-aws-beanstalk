# Changelog

All notable changes to the @activitree/mup-aws-beanstalk package.

## [Unreleased] - Launch Templates Migration

### Added

#### Launch Template Support
- **`instanceTypes`** - Array of instance types for flexibility and Spot Instance support
- **`spotInstances`** - Spot Instance configuration for cost savings up to 90%
- **`disableIMDSv1`** - IMDSv2 enforcement for improved security
- **`rootVolume`** - Root volume configuration (size, type, IOPS, throughput)
- **`launchTemplateTagPropagation`** - Tag propagation to launch templates

#### New Configuration Options

```javascript
// Multiple instance types
instanceTypes: ['t3.small', 't3a.small', 't2.small']

// Spot Instances
spotInstances: {
  enabled: true,
  instanceTypes: ['t3.small', 't3a.small'],
  spotAllocationStrategy: 'capacity-optimized-prioritized',
  onDemandBase: 1,
  onDemandAboveBasePercentage: 30
}

// IMDSv2 enforcement
disableIMDSv1: true

// Root volume configuration
rootVolume: {
  size: 20,
  type: 'gp3'
}
```

#### Documentation
- Complete documentation in `docs/` directory
- Getting Started guide
- Configuration reference
- Launch Templates migration guide
- Spot Instances guide
- Commands reference
- Example configuration file

### Changed

#### Namespace Migration
- Instance type configuration now uses `aws:ec2:instances` namespace
- Maintains backward compatibility with `aws:autoscaling:launchconfiguration`

#### IAM Permissions
- Added Launch Template permissions to policies:
  - `ec2:CreateLaunchTemplate`
  - `ec2:CreateLaunchTemplateVersions`
  - `ec2:DeleteLaunchTemplate`
  - `ec2:DeleteLaunchTemplateVersions`
  - `ec2:DescribeLaunchTemplates`
  - `ec2:DescribeLaunchTemplateVersions`
  - `ec2:RunInstances`

### Deprecated

- `instanceType` (single instance type) - Use `instanceTypes` array instead
- `aws:autoscaling:launchconfiguration:InstanceType` - Use `aws:ec2:instances:InstanceTypes`

### Migration Guide

#### For Existing Deployments

1. **No immediate action required** - Existing configurations continue to work
2. **To enable Launch Templates**, add any of:
   - `instanceTypes` array
   - `spotInstances.enabled: true`
   - `disableIMDSv1: true`
   - `rootVolume` configuration

3. **Update IAM policies** if using custom policies (add Launch Template permissions)

#### For New Deployments

Use the new configuration options for all benefits:

```javascript
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'my-app',
    path: '../',
    region: 'us-east-1',
    
    // Use instanceTypes instead of instanceType
    instanceTypes: ['t3.small', 't3a.small'],
    
    // Enable Spot for cost savings
    spotInstances: {
      enabled: true,
      onDemandBase: 1,
      onDemandAboveBasePercentage: 30
    },
    
    // Enforce IMDSv2
    disableIMDSv1: true,
    
    // Your other config...
    minInstances: 1,
    maxInstances: 3,
    env: { /* ... */ },
    auth: { /* ... */ }
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Critical Changes & Incompatibilities

### 1. IAM Permissions

**Impact**: Deployment may fail with permission errors

**Who is affected**: Users with custom IAM policies (not using AWS managed policies)

**Solution**: Add Launch Template permissions:

```json
{
  "Effect": "Allow",
  "Action": [
    "ec2:RunInstances",
    "ec2:CreateLaunchTemplate",
    "ec2:CreateLaunchTemplateVersions",
    "ec2:DeleteLaunchTemplate",
    "ec2:DeleteLaunchTemplateVersions",
    "ec2:DescribeLaunchTemplates",
    "ec2:DescribeLaunchTemplateVersions"
  ],
  "Resource": ["*"]
}
```

### 2. Instance Type Configuration

**Impact**: Old namespace configuration may be ignored

**Who is affected**: Users with `customBeanstalkConfig` using `aws:autoscaling:launchconfiguration:InstanceType`

**Solution**: Use `instanceTypes` in main config or update namespace:

```javascript
// Old (deprecated)
customBeanstalkConfig: [
  {
    namespace: 'aws:autoscaling:launchconfiguration',
    option: 'InstanceType',
    value: 't3.small'
  }
]

// New (recommended)
instanceTypes: ['t3.small', 't3a.small']
```

### 3. Spot Instances

**Impact**: Enabling Spot Instances changes instance purchasing behavior

**Who is affected**: Users enabling `spotInstances.enabled: true`

**Considerations**:
- Spot Instances can be interrupted with 2-minute warning
- Use `gracefulShutdown: true` for safe handling
- Configure `onDemandBase` for critical capacity

### 4. IMDSv2 Enforcement

**Impact**: Applications using IMDSv1 may fail

**Who is affected**: Users enabling `disableIMDSv1: true`

**Solution**: Ensure your application supports IMDSv2, or do not enable this option

### 5. Tag Propagation

**Impact**: Tags may not propagate to existing resources

**Who is affected**: Users enabling `launchTemplateTagPropagation: true`

**Note**: Changing from `false` to `true` may be a breaking change for existing tags

## Version Compatibility

| Package Version | Node.js | Meteor Up |
|----------------|---------|-----------|
| 0.10.x | >= 22.0.0 | Latest |

## AWS Region Support

All AWS regions that support Elastic Beanstalk are supported. Note that:
- Spot Instance availability varies by region
- Some instance types may not be available in all regions
- Launch Template support is available in all commercial regions

## Upgrading

```bash
npm update @activitree/mup-aws-beanstalk
```

Then redeploy:

```bash
mup deploy
```

## Support

If you encounter issues during migration:

1. Check the [Launch Templates Migration Guide](./launch-templates.md)
2. Review [Troubleshooting](./getting-started.md#troubleshooting)
3. Open an issue on [GitHub](https://github.com/activitree/mup-aws-beanstalk/issues)
