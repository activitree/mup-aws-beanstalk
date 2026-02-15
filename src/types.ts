import { ListBucketsCommandOutput } from '@aws-sdk/client-s3';

export type Env = {
  PORT?: number;
  METEOR_SIGTERM_GRACE_PERIOD_SECONDS?: number,
  [key: string]: any;
}

/**
 * Spot Instance configuration for cost optimization
 * Requires Launch Templates (automatically enabled when spotInstances is configured)
 */
export type SpotInstanceConfig = {
  enabled: boolean;
  /** Comma-separated list of instance types for flexibility */
  instanceTypes?: string[];
  /** Spot allocation strategy */
  spotAllocationStrategy?: 'capacity-optimized-prioritized' | 'lowest-price' | 'capacity-optimized' | 'price-capacity-optimized';
  /** Minimum number of On-Demand instances before Spot */
  onDemandBase?: number;
  /** Percentage of On-Demand instances above base (0-100) */
  onDemandAboveBasePercentage?: number;
};

/**
 * Root volume configuration for EC2 instances
 */
export type RootVolumeConfig = {
  /** Volume size in GB */
  size: number;
  /** Volume type */
  type?: 'gp2' | 'gp3' | 'io1' | 'io2' | 'standard';
  /** IOPS for io1/io2 volumes */
  iops?: number;
  /** Throughput in MiB/s for gp3 volumes */
  throughput?: number;
};

export type MupAwsConfig = {
  name: string;
  path: string;
  type: string;
  envName: string;
  envType: 'webserver' | 'worker';
  buildOptions: {
    buildLocation: string;
    serverOnly?: boolean;
    debug?: boolean;
    mobileSettings?: {
    };
    server?: string;
    allowIncompatibleUpdates?: boolean;
    executable?: string;
  };
  docker?: {
  };
  env: Env;
  auth: {
    id: string;
    secret: string;
  };
  sslDomains?: Array<string>;
  forceSSL?: boolean;
  region: string;
  minInstances: number;
  maxInstances: number;
  streamLogs?: boolean;
  /** @deprecated Use instanceTypes array instead. Single instance type. */
  instanceType: string;
  /** Multiple instance types for flexibility (Launch Template feature) */
  instanceTypes?: string[];
  /** Spot Instance configuration for cost savings */
  spotInstances?: SpotInstanceConfig;
  /** Disable IMDSv1 and enforce IMDSv2 (triggers Launch Template migration) */
  disableIMDSv1?: boolean;
  /** Root volume configuration */
  rootVolume?: RootVolumeConfig;
  /** Enable tag propagation to launch templates */
  launchTemplateTagPropagation?: boolean;
  gracefulShutdown?: boolean;
  longEnvVars?: boolean;
  yumPackages?: {
    [key: string]: string;
  };
  oldVersions: number;
  customBeanstalkConfig?: Array<{
    namespace: string;
    option: string;
    value: string;
  }>;
  sshKey?: {
    privateKey: string;
    publicKey: string;
  };
  secretsManager?: {
    enabled: boolean;
    secrets: Array<{
      name: string;
      arn: string;
      key?: string;
    }>;
  };
  targetTrackingScaling?: {
    enabled: boolean;
    targetCPU?: number;
    targetRequestCountPerTarget?: number;
  };
  vpc?: {
    enabled: boolean;
    vpcId: string;
    subnets: Array<string>;
    elbSubnets: Array<string>;
    associatePublicIpAddress: boolean;
  };
  trafficSplitting?: {
    enabled: boolean;
    newVersionPercent?: number;
    evaluationTime?: number; // in minutes
  };
};

export type MeteorSettings = {
  [key: string]: any;
};

export type MupConfig = {
  app: MupAwsConfig;
}

export type MupUtils = {
  combineErrorDetails: (details: Array<any>, result: any) => Array<any>;
  addLocation: (details: Array<any>, location: string) => Array<any>;
  VALIDATE_OPTIONS: {};
  forwardPort: (args: {
    server: {
      host: string,
      port: number,
      username: string,
      password?: string,
      pem: string,
    },
    localAddress: string,
    localPort: number,
    remoteAddress: string,
    remotePort: number,
    onReady: () => void,
    onError: (err: Error) => void,
    onConnection: () => void
  }) => void
  resolvePath: (...args: string[]) => string;
  getBasePath: () => string;
};

export type MupApi = {
  verbose: boolean;
  getConfig: () => MupConfig;
  getSettings: () => MeteorSettings;
  getOptions: () => {
    'cached-build': boolean;
  };
  getArgs: () => string[];
  runCommand: (command: string, args?: Array<string>) => Promise<void>;
  commandHistory: {
    name: string
  }[];
  forwardPort: MupUtils['forwardPort'];
  resolvePath: MupUtils['resolvePath'];
  getBasePath: MupUtils['getBasePath'];
};

export type Buckets = Exclude<ListBucketsCommandOutput['Buckets'], undefined>

export type EBConfigElement = {
  Namespace: string;
  OptionName: string;
  Value: string;
  ResourceName?: string;
}

export type EBConfigDictionary = {
  [key: string]: EBConfigElement;
}
