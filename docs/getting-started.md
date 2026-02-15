# Getting Started with @activitree/mup-aws-beanstalk

This guide will walk you through deploying your first Meteor application to AWS Elastic Beanstalk.

## Prerequisites

1. **Node.js** >= 22.0.0
2. **Meteor** installed globally
3. **Meteor Up** installed globally:
   ```bash
   npm install -g mup
   ```
4. **AWS Account** with access keys configured

## Step 1: Install the Plugin

```bash
npm install @activitree/mup-aws-beanstalk
```

## Step 2: Create Configuration File

Create a `mup.js` file in your project root:

```javascript
module.exports = {
  app: {
    type: 'aws-beanstalk',
    name: 'my-app',  // Minimum 4 characters
    path: '../',
    region: 'us-east-1',
    
    // Instance configuration (Launch Template)
    instanceTypes: ['t3.small', 't3a.small'],
    
    // Scaling
    minInstances: 1,
    maxInstances: 3,
    
    // Environment variables
    env: {
      ROOT_URL: 'https://myapp.example.com',
      MONGO_URL: 'mongodb+srv://user:pass@cluster.mongodb.net/mydb'
    },
    
    // AWS credentials
    auth: {
      id: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY
    }
  },
  plugins: ['@activitree/mup-aws-beanstalk']
};
```

## Step 3: Set AWS Credentials

Set your AWS credentials as environment variables:

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
```

Or use AWS CLI configuration:

```bash
aws configure
```

## Step 4: Initial Setup

Run the setup command to create necessary AWS resources:

```bash
mup beanstalk setup
```

This creates:
- S3 bucket for application bundles
- IAM roles and instance profiles
- Elastic Beanstalk application

## Step 5: Deploy

Deploy your application:

```bash
mup deploy
```

This command:
1. Builds your Meteor application
2. Creates a deployment bundle
3. Uploads to S3
4. Creates a new application version
5. Deploys to Elastic Beanstalk

## Step 6: Verify Deployment

Check your application status:

```bash
mup beanstalk status
```

View recent events:

```bash
mup beanstalk events
```

## Common Commands

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
| `mup beanstalk clean` | Remove old versions |
| `mup beanstalk ssl` | Setup SSL certificates |

## Next Steps

- [Configuration Reference](./configuration.md) - All configuration options
- [Launch Templates Migration](./launch-templates.md) - Modern instance management
- [Spot Instances](./spot-instances.md) - Cost optimization

## Troubleshooting

### Deployment Fails

1. Check logs:
   ```bash
   mup beanstalk logs
   mup beanstalk logs-nginx
   mup beanstalk logs-eb
   ```

2. Verify AWS permissions

3. Check environment health in AWS Console

### Instance Not Starting

1. Verify instance profile has correct permissions
2. Check security group settings
3. Review CloudWatch logs

### SSL Certificate Issues

1. Verify domain ownership
2. Check certificate validation emails
3. Ensure DNS is configured correctly
