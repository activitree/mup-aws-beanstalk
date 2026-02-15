import joi from 'joi';
import { MupUtils, MupConfig } from "./types.js";

const schema = joi.object().keys({
  name: joi.string().min(1).required(),
  path: joi.string().min(1).required(),
  type: joi.string().required(),
  envName: joi.string().min(1),
  envType: joi.string().valid('webserver', 'worker'),
  buildOptions: joi.object().keys({
    serverOnly: joi.bool(),
    debug: joi.bool(),
    buildLocation: joi.string(),
    mobileSettings: joi.object(),
    server: joi.string().uri(),
    allowIncompatibleUpdates: joi.boolean(),
    executable: joi.string()
  }),
  // The meteor plugin adds the docker object, which is a bug in mup
  docker: joi.object(),
  env: joi.object(),
  auth: joi.object().keys({
    id: joi.string().required(),
    secret: joi.string().required()
  }).required(),
  sslDomains: joi.array().items(joi.string()),
  forceSSL: joi.bool(),
  streamLogs: joi.bool(),
  region: joi.string(),
  minInstances: joi.number().min(1).required(),
  maxInstances: joi.number().min(1),
  instanceType: joi.string(),
  // New: Multiple instance types for Launch Template
  instanceTypes: joi.array().items(joi.string()),
  // New: Spot Instance configuration
  spotInstances: joi.object({
    enabled: joi.boolean().required(),
    instanceTypes: joi.array().items(joi.string()),
    spotAllocationStrategy: joi.string().valid(
      'capacity-optimized-prioritized',
      'lowest-price',
      'capacity-optimized',
      'price-capacity-optimized'
    ),
    onDemandBase: joi.number().min(0),
    onDemandAboveBasePercentage: joi.number().min(0).max(100)
  }),
  // New: IMDSv2 enforcement (triggers Launch Template migration)
  disableIMDSv1: joi.boolean(),
  // New: Root volume configuration
  rootVolume: joi.object({
    size: joi.number().min(8).required(),
    type: joi.string().valid('gp2', 'gp3', 'io1', 'io2', 'standard'),
    iops: joi.number().min(100),
    throughput: joi.number().min(125)
  }),
  // New: Tag propagation to launch templates
  launchTemplateTagPropagation: joi.boolean(),
  gracefulShutdown: joi.bool(),
  longEnvVars: joi.bool(),
  yumPackages: joi.object().pattern(
    /[/s/S]*/,
    [joi.string().allow('')]
  ),
  oldVersions: joi.number(),
  customBeanstalkConfig: joi.array().items(joi.object({
    namespace: joi.string().trim().required(),
    option: joi.string().trim().required(),
    value: joi.string().trim().required()
  })),
  sshKey: {
    privateKey: joi.string().required(),
    publicKey: joi.string().required()
  }
});

export default function (config: MupConfig, utils: MupUtils) {
  let details: { message: string, path: string }[] = [];

  details = utils.combineErrorDetails(
    details,
    schema.validate(config.app, utils.VALIDATE_OPTIONS)
  );

  if (config.app && config.app.name && config.app.name.length < 4) {
    details.push({
      message: 'must have at least 4 characters',
      path: 'name'
    });
  }

  // Validate Spot Instance configuration
  if (config.app?.spotInstances?.enabled) {
    if (!config.app.instanceTypes?.length && !config.app.spotInstances.instanceTypes?.length) {
      details.push({
        message: 'instanceTypes or spotInstances.instanceTypes is required when Spot Instances are enabled',
        path: 'spotInstances'
      });
    }
  }

  return utils.addLocation(details, 'app');
}
