import difference from 'lodash.difference';
import { beanstalk } from './aws.js';
import downloadEnvFile from './download.js';
import { createEnvFile } from './env-settings.js';
import { uploadEnvFile } from './upload.js';
import { names } from './utils.js';
import { largestEnvVersion } from './versions.js';
/**
 * Creates the desired Elastic Beanstalk configuration
 * Supports both legacy Launch Configuration and modern Launch Template namespaces
 */
export function createDesiredConfig(mupConfig, settings, longEnvVarsVersion) {
    const { env, instanceType, instanceTypes, spotInstances, disableIMDSv1, rootVolume, launchTemplateTagPropagation, streamLogs, customBeanstalkConfig = [], secretsManager, trafficSplitting } = mupConfig.app;
    const { instanceProfile, serviceRole } = names(mupConfig);
    // Build instance type value - prefer instanceTypes array over single instanceType
    const instanceTypesValue = instanceTypes?.length
        ? instanceTypes.join(',')
        : instanceType;
    const config = {
        OptionSettings: [{
                Namespace: 'aws:autoscaling:trigger',
                OptionName: 'MeasureName',
                Value: 'CPUUtilization'
            }, {
                Namespace: 'aws:autoscaling:trigger',
                OptionName: 'Statistic',
                Value: 'Average'
            }, {
                Namespace: 'aws:autoscaling:trigger',
                OptionName: 'Unit',
                Value: 'Percent'
            }, {
                Namespace: 'aws:autoscaling:trigger',
                OptionName: 'UpperThreshold',
                Value: '75'
            }, {
                Namespace: 'aws:autoscaling:trigger',
                OptionName: 'LowerThreshold',
                Value: '35'
            }, {
                // Use aws:ec2:instances namespace for Launch Template features
                // This is the modern approach recommended by AWS
                Namespace: 'aws:ec2:instances',
                OptionName: 'InstanceTypes',
                Value: instanceTypesValue
            }, {
                // IAM Instance Profile - still uses launchconfiguration namespace
                Namespace: 'aws:autoscaling:launchconfiguration',
                OptionName: 'IamInstanceProfile',
                Value: instanceProfile
            }, {
                Namespace: 'aws:elasticbeanstalk:environment:process:default',
                OptionName: 'HealthyThresholdCount',
                Value: '2'
            }, {
                Namespace: 'aws:elasticbeanstalk:environment:process:default',
                OptionName: 'HealthCheckPath',
                Value: '/aws-health-check-3984729847289743128904723'
            }, {
                Namespace: 'aws:elasticbeanstalk:environment',
                OptionName: 'EnvironmentType',
                Value: 'LoadBalanced'
            }, {
                Namespace: 'aws:elasticbeanstalk:environment',
                OptionName: 'LoadBalancerType',
                Value: 'application'
            }, {
                Namespace: 'aws:elasticbeanstalk:command',
                OptionName: 'DeploymentPolicy',
                Value: 'RollingWithAdditionalBatch'
            }, {
                Namespace: 'aws:elasticbeanstalk:command',
                OptionName: 'BatchSizeType',
                Value: 'Percentage'
            }, {
                Namespace: 'aws:elasticbeanstalk:command',
                OptionName: 'BatchSize',
                Value: '30'
            }, {
                Namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
                OptionName: 'RollingUpdateEnabled',
                Value: 'true'
            }, {
                Namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
                OptionName: 'RollingUpdateType',
                Value: 'Health'
            }, {
                Namespace: 'aws:elasticbeanstalk:environment',
                OptionName: 'ServiceRole',
                Value: serviceRole
            }, {
                Namespace: 'aws:elasticbeanstalk:healthreporting:system',
                OptionName: 'SystemType',
                Value: 'enhanced'
            }, {
                Namespace: 'aws:elasticbeanstalk:environment:process:default',
                OptionName: 'StickinessEnabled',
                Value: 'true'
            }, {
                Namespace: 'aws:elasticbeanstalk:environment:process:default',
                OptionName: 'DeregistrationDelay',
                Value: '75'
            }]
    };
    // Add Spot Instance configuration (Launch Template feature)
    if (spotInstances?.enabled) {
        config.OptionSettings.push({
            Namespace: 'aws:ec2:instances',
            OptionName: 'EnableSpot',
            Value: 'true'
        });
        if (spotInstances.instanceTypes?.length) {
            config.OptionSettings.push({
                Namespace: 'aws:ec2:instances',
                OptionName: 'InstanceTypes',
                Value: spotInstances.instanceTypes.join(',')
            });
        }
        if (spotInstances.spotAllocationStrategy) {
            config.OptionSettings.push({
                Namespace: 'aws:ec2:instances',
                OptionName: 'SpotAllocationStrategy',
                Value: spotInstances.spotAllocationStrategy
            });
        }
        if (spotInstances.onDemandBase !== undefined) {
            config.OptionSettings.push({
                Namespace: 'aws:ec2:instances',
                OptionName: 'SpotFleetOnDemandBase',
                Value: spotInstances.onDemandBase.toString()
            });
        }
        if (spotInstances.onDemandAboveBasePercentage !== undefined) {
            config.OptionSettings.push({
                Namespace: 'aws:ec2:instances',
                OptionName: 'SpotFleetOnDemandAboveBasePercentage',
                Value: spotInstances.onDemandAboveBasePercentage.toString()
            });
        }
    }
    // IMDSv2 enforcement (triggers Launch Template migration)
    if (disableIMDSv1) {
        config.OptionSettings.push({
            Namespace: 'aws:autoscaling:launchconfiguration',
            OptionName: 'DisableIMDSv1',
            Value: 'true'
        });
    }
    // Root volume configuration (triggers Launch Template migration)
    if (rootVolume) {
        config.OptionSettings.push({
            Namespace: 'aws:autoscaling:launchconfiguration',
            OptionName: 'RootVolumeSize',
            Value: rootVolume.size.toString()
        });
        if (rootVolume.type) {
            config.OptionSettings.push({
                Namespace: 'aws:autoscaling:launchconfiguration',
                OptionName: 'RootVolumeType',
                Value: rootVolume.type
            });
        }
        if (rootVolume.iops) {
            config.OptionSettings.push({
                Namespace: 'aws:autoscaling:launchconfiguration',
                OptionName: 'RootVolumeIOPS',
                Value: rootVolume.iops.toString()
            });
        }
    }
    // Tag propagation to Launch Templates
    if (launchTemplateTagPropagation) {
        config.OptionSettings.push({
            Namespace: 'aws:autoscaling:launchconfiguration',
            OptionName: 'LaunchTemplateTagPropagationEnabled',
            Value: 'true'
        });
    }
    if (streamLogs) {
        config.OptionSettings.push({
            Namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            OptionName: 'StreamLogs',
            Value: 'true'
        }, {
            Namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            OptionName: 'DeleteOnTerminate',
            Value: 'false'
        }, {
            Namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            OptionName: 'RetentionInDays',
            Value: '30'
        });
    }
    // Traffic Splitting Deployment Strategy (Canary testing - AWS feature from 2024)
    if (trafficSplitting?.enabled) {
        config.OptionSettings.push({
            Namespace: 'aws:elasticbeanstalk:command',
            OptionName: 'DeploymentPolicy',
            Value: 'TrafficSplitting'
        }, {
            Namespace: 'aws:elasticbeanstalk:trafficsplitting',
            OptionName: 'NewVersionPercent',
            Value: trafficSplitting.newVersionPercent?.toString() || '15'
        }, {
            Namespace: 'aws:elasticbeanstalk:trafficsplitting',
            OptionName: 'EvaluationTime',
            Value: trafficSplitting.evaluationTime?.toString() || '10'
        });
    }
    const settingsString = JSON.stringify(settings);
    if (longEnvVarsVersion) {
        config.OptionSettings.push({
            Namespace: 'aws:elasticbeanstalk:application:environment',
            OptionName: 'MUP_ENV_FILE_VERSION',
            Value: longEnvVarsVersion.toString()
        });
    }
    else if (secretsManager?.enabled) {
        secretsManager.secrets.forEach(secret => {
            config.OptionSettings.push({
                Namespace: 'aws:elasticbeanstalk:application:environment',
                OptionName: secret.name,
                Value: secret.arn
            });
        });
    }
    else {
        env.METEOR_SETTINGS_ENCODED = encodeURIComponent(settingsString);
        Object.keys(env).forEach((envName) => {
            const value = env[envName];
            config.OptionSettings.push({
                Namespace: 'aws:elasticbeanstalk:application:environment',
                OptionName: envName,
                Value: value.toString()
            });
        });
    }
    const customOptions = customBeanstalkConfig.map(option => ({
        Namespace: option.namespace,
        OptionName: option.option,
        Value: option.value
    }));
    config.OptionSettings = mergeConfigs(config.OptionSettings, customOptions);
    return config;
}
export function scalingConfigChanged(currentConfig, mupConfig) {
    const { minInstances, maxInstances } = mupConfig.app;
    let currentMinInstances = "0";
    let currentMaxInstances = "0";
    currentConfig.forEach((item) => {
        if (item.Namespace === 'aws:autoscaling:asg') {
            if (item.OptionName === 'MinSize') {
                currentMinInstances = item.Value;
            }
            else if (item.OptionName === 'MaxSize') {
                currentMaxInstances = item.Value;
            }
        }
    });
    return currentMinInstances !== minInstances.toString() ||
        currentMaxInstances !== maxInstances.toString();
}
export function scalingConfig({ minInstances, maxInstances }) {
    return {
        OptionSettings: [
            {
                Namespace: 'aws:autoscaling:asg',
                OptionName: 'MinSize',
                Value: minInstances.toString()
            }, {
                Namespace: 'aws:autoscaling:asg',
                OptionName: 'MaxSize',
                Value: maxInstances.toString()
            }
        ]
    };
}
export function convertToObject(result, option) {
    if (!option) {
        return result;
    }
    result[`${option.Namespace}-${option.OptionName}`] = option;
    return result;
}
export function mergeConfigs(config1, config2) {
    const configDict = config1.reduce(convertToObject, {});
    config2.forEach((option) => {
        const key = `${option.Namespace}-${option.OptionName}`;
        configDict[key] = option;
    });
    return Object.values(configDict);
}
export function diffConfig(current, desired) {
    const currentConfigDict = current.reduce(convertToObject, {});
    const desiredConfigDict = desired.reduce(convertToObject, {});
    const toRemove = difference(Object.keys(currentConfigDict), Object.keys(desiredConfigDict))
        .filter(key => key.indexOf('aws:elasticbeanstalk:application:environment-') === 0)
        .map((key) => {
        const option = currentConfigDict[key];
        return {
            Namespace: option.Namespace,
            OptionName: option.OptionName
        };
    });
    const toUpdate = Object.keys(desiredConfigDict).filter((key) => {
        if (key in currentConfigDict && currentConfigDict[key].Value === desiredConfigDict[key].Value) {
            return false;
        }
        return true;
    }).map(key => desiredConfigDict[key]);
    return {
        toRemove,
        toUpdate
    };
}
export async function prepareUpdateEnvironment(api) {
    const config = api.getConfig();
    const { app, environment, bucket } = names(config);
    const { ConfigurationSettings } = await beanstalk.describeConfigurationSettings({
        EnvironmentName: environment,
        ApplicationName: app
    });
    const { longEnvVars } = config.app;
    let nextEnvVersion = 0;
    let envSettingsChanged;
    let desiredSettings;
    if (longEnvVars) {
        const currentEnvVersion = await largestEnvVersion(api);
        const currentSettings = await downloadEnvFile(bucket, currentEnvVersion);
        desiredSettings = createEnvFile(config.app.env, api.getSettings());
        envSettingsChanged = currentSettings !== desiredSettings;
        if (envSettingsChanged) {
            nextEnvVersion = currentEnvVersion + 1;
            await uploadEnvFile(bucket, nextEnvVersion, desiredSettings);
        }
        else {
            nextEnvVersion = currentEnvVersion;
        }
    }
    const desiredEbConfig = createDesiredConfig(api.getConfig(), api.getSettings(), nextEnvVersion);
    const { toRemove, toUpdate } = diffConfig(ConfigurationSettings[0].OptionSettings, desiredEbConfig.OptionSettings);
    return {
        toRemove,
        toUpdate
    };
}
export function getEnvTierConfig(envType) {
    if (envType === 'webserver') {
        return {
            Name: "WebServer",
            Type: "Standard"
        };
    }
    return {
        Name: "Worker",
        Type: "SQS/HTTP"
    };
}
//# sourceMappingURL=eb-config.js.map