/**
 * Complete Configuration Example for @activitree/mup-aws-beanstalk
 * 
 * This file demonstrates all available configuration options.
 * Copy and modify for your own deployment.
 */

module.exports = {
  app: {
    // ===========================================
    // REQUIRED CONFIGURATION
    // ===========================================
    
    /**
     * Plugin identifier - tells Meteor Up to use this plugin
     */
    type: 'aws-beanstalk',
    
    /**
     * Application name (minimum 4 characters)
     * Used for AWS resource naming
     */
    name: 'my-meteor-app',
    
    /**
     * Path to Meteor application (relative to this file)
     */
    path: '../',
    
    /**
     * AWS region for deployment
     * @see https://docs.aws.amazon.com/general/latest/gr/rande.html
     */
    region: 'eu-central-1',
    
    /**
     * AWS credentials
     * Best practice: Use environment variables
     */
    auth: {
      id: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY
    },
    
    /**
     * Environment variables for your Meteor application
     */
    env: {
      ROOT_URL: 'https://www.example.com',
      MONGO_URL: 'mongodb+srv://user:password@cluster.mongodb.net/mydb',
      // Optional: Separate contacts database
      MONGO_CONTACTS_URL: 'mongodb+srv://user:password@cluster.mongodb.net/contacts',
      // Meteor settings will be encoded automatically
      // METEOR_SETTINGS_ENCODED: '...'
    },
    
    // ===========================================
    // INSTANCE CONFIGURATION (Launch Template)
    // ===========================================
    
    /**
     * Instance types for flexibility
     * Multiple types enable Spot Instances and provide fallback options
     * @deprecated instanceType - Use instanceTypes instead
     */
    instanceTypes: ['t3.small', 't3a.small', 't2.small'],
    
    /**
     * Spot Instance configuration for cost savings
     * Requires Launch Templates (automatically enabled)
     */
    spotInstances: {
      enabled: true,
      // Instance types for Spot (overrides instanceTypes above)
      instanceTypes: ['t3.small', 't3a.small', 't2.small'],
      // Allocation strategy
      spotAllocationStrategy: 'capacity-optimized-prioritized',
      // Minimum On-Demand instances
      onDemandBase: 1,
      // Percentage of On-Demand above base (0-100)
      onDemandAboveBasePercentage: 30
    },
    
    /**
     * Disable IMDSv1 and enforce IMDSv2
     * Recommended for security
     * Triggers Launch Template migration
     */
    disableIMDSv1: true,
    
    /**
     * Root volume configuration
     */
    rootVolume: {
      size: 20,        // GB (minimum 8)
      type: 'gp3',     // 'gp2', 'gp3', 'io1', 'io2', 'standard'
      // iops: 3000,   // For io1/io2
      // throughput: 125  // MiB/s for gp3
    },
    
    /**
     * Propagate environment tags to launch templates
     * Useful for cost allocation and access control
     */
    launchTemplateTagPropagation: true,
    
    // ===========================================
    // SCALING CONFIGURATION
    // ===========================================
    
    /**
     * Minimum number of instances
     */
    minInstances: 2,
    
    /**
     * Maximum number of instances
     */
    maxInstances: 10,
    
    /**
     * Target tracking scaling policy
     * Automatically adjusts instance count based on metrics
     */
    targetTrackingScaling: {
      enabled: true,
      targetCPU: 70,                      // Scale when CPU > 70%
      targetRequestCountPerTarget: 1000   // Scale when requests/target > 1000
    },
    
    // ===========================================
    // ENVIRONMENT CONFIGURATION
    // ===========================================
    
    /**
     * Environment type
     * 'webserver' - For web applications with load balancer
     * 'worker' - For background processing (no load balancer)
     */
    envType: 'webserver',
    
    /**
     * Custom environment name (optional)
     * Default: <app-name>-<random-suffix>
     */
    // envName: 'production',
    
    // ===========================================
    // SSL/TLS CONFIGURATION
    // ===========================================
    
    /**
     * SSL certificate domains
     * Automatically provisions certificate via AWS ACM
     */
    sslDomains: ['example.com', 'www.example.com'],
    
    /**
     * Force HTTPS redirect
     */
    forceSSL: true,
    
    // ===========================================
    // VPC CONFIGURATION
    // ===========================================
    
    /**
     * VPC configuration for network isolation
     */
    vpc: {
      enabled: true,
      vpcId: 'vpc-0d23022a09f1370e4',
      // Subnets for EC2 instances
      subnets: [
        'subnet-06c1c8bd8133f7662',
        'subnet-0d92a9818da3fbfec',
        'subnet-0f208a7c67ba4f607'
      ],
      // Subnets for load balancer (can be same as subnets)
      elbSubnets: [
        'subnet-06c1c8bd8133f7662',
        'subnet-0d92a9818da3fbfec',
        'subnet-0f208a7c67ba4f607'
      ],
      // Assign public IP addresses to instances
      associatePublicIpAddress: true
    },
    
    // ===========================================
    // DEPLOYMENT CONFIGURATION
    // ===========================================
    
    /**
     * Traffic splitting (Canary deployment)
     * Gradually shift traffic to new version
     */
    trafficSplitting: {
      enabled: true,
      newVersionPercent: 15,   // 15% traffic to new version
      evaluationTime: 10       // 10 minutes before full rollout
    },
    
    // ===========================================
    // LOGGING CONFIGURATION
    // ===========================================
    
    /**
     * Stream logs to CloudWatch
     */
    streamLogs: true,
    
    /**
     * Number of old application versions to keep
     */
    oldVersions: 3,
    
    // ===========================================
    // SECRETS MANAGER INTEGRATION
    // ===========================================
    
    /**
     * AWS Secrets Manager for sensitive data
     * Alternative to storing secrets in env vars
     */
    secretsManager: {
      enabled: false,  // Set to true to enable
      secrets: [
        {
          name: 'MONGO_URL',
          arn: 'arn:aws:secretsmanager:region:account:secret:mongo-url'
        }
      ]
    },
    
    // ===========================================
    // GRACEFUL SHUTDOWN
    // ===========================================
    
    /**
     * Enable graceful shutdown handling
     * Important for Spot Instances and deployments
     */
    gracefulShutdown: true,
    
    // ===========================================
    // LONG ENVIRONMENT VARIABLES
    // ===========================================
    
    /**
     * Store environment variables in S3
     * Use when total env var size exceeds AWS limits
     */
    longEnvVars: false,
    
    // ===========================================
    // SSH ACCESS
    // ===========================================
    
    /**
     * SSH key for instance access
     * Required for 'shell' and 'debug' commands
     */
    sshKey: {
      privateKey: '/path/to/private/key',
      publicKey: '/path/to/public/key'
    },
    
    // ===========================================
    // CUSTOM BEANSTALK CONFIGURATION
    // ===========================================
    
    /**
     * Custom Elastic Beanstalk configuration options
     * @see https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html
     */
    customBeanstalkConfig: [
      // VPC Configuration
      {
        namespace: 'aws:ec2:vpc',
        option: 'VPCId',
        value: 'vpc-0d23022a09f1370e4'
      },
      {
        namespace: 'aws:ec2:vpc',
        option: 'Subnets',
        value: 'subnet-06c1c8bd8133f7662,subnet-0d92a9818da3fbfec'
      },
      
      // Auto Scaling Triggers
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'MeasureName',
        value: 'CPUUtilization'
      },
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'Statistic',
        value: 'Average'
      },
      {
        namespace: 'aws:autoscaling:trigger',
        option: 'Unit',
        value: 'Percent'
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
      
      // Deployment Policy
      {
        namespace: 'aws:elasticbeanstalk:command',
        option: 'DeploymentPolicy',
        value: 'RollingWithAdditionalBatch'
      },
      
      // Rolling Updates
      {
        namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
        option: 'RollingUpdateEnabled',
        value: 'true'
      },
      {
        namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
        option: 'RollingUpdateType',
        value: 'Health'
      },
      
      // Shared Load Balancer
      {
        namespace: 'aws:elasticbeanstalk:environment',
        option: 'LoadBalancerIsShared',
        value: 'true'
      },
      {
        namespace: 'aws:elbv2:loadbalancer',
        option: 'SharedLoadBalancer',
        value: 'arn:aws:elasticloadbalancing:region:account:loadbalancer/app/my-alb/xxx'
      }
    ],
    
    // ===========================================
    // BUILD OPTIONS
    // ===========================================
    
    /**
     * Meteor build options
     */
    buildOptions: {
      buildLocation: '/tmp/mup-build',
      serverOnly: true,
      debug: false,
      mobileSettings: {},
      server: 'main.js',
      allowIncompatibleUpdates: false,
      executable: 'meteor'
    }
  },
  
  // ===========================================
  // PLUGINS
  // ===========================================
  
  /**
   * Required: Include this plugin
   */
  plugins: ['@activitree/mup-aws-beanstalk']
};
