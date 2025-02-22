"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ebVersions = ebVersions;
exports.s3Versions = s3Versions;
exports.largestVersion = largestVersion;
exports.largestEnvVersion = largestEnvVersion;
exports.oldEnvVersions = oldEnvVersions;
exports.oldVersions = oldVersions;
const lodash_difference_1 = __importDefault(require("lodash.difference"));
const aws_1 = require("./aws");
const utils_1 = require("./utils");
async function ebVersions(api) {
    const config = api.getConfig();
    const versions = [0];
    const { app } = (0, utils_1.names)(config);
    const appVersions = await aws_1.beanstalk.describeApplicationVersions({
        ApplicationName: app
    });
    if (appVersions.ApplicationVersions
        && appVersions.ApplicationVersions.length > 0) {
        appVersions.ApplicationVersions.forEach(({ VersionLabel }) => {
            const parsedVersion = parseInt(VersionLabel || "0", 10);
            versions.push(parsedVersion);
        });
    }
    return versions.sort((a, b) => b - a);
}
async function s3Versions(api, providedPrefix) {
    const config = api.getConfig();
    const versions = [0];
    const { bucket, bundlePrefix } = (0, utils_1.names)(config);
    const prefix = providedPrefix || bundlePrefix;
    const uploadedBundles = await aws_1.s3.listObjects({
        Bucket: bucket,
        Prefix: prefix
    });
    if (uploadedBundles.Contents
        && uploadedBundles.Contents.length > 0) {
        uploadedBundles.Contents.forEach((bundle) => {
            if (!bundle.Key)
                return;
            const bundleVersion = parseInt(bundle.Key.split(prefix)[1], 10);
            versions.push(bundleVersion);
        });
    }
    return versions.sort((a, b) => b - a);
}
async function largestVersion(api) {
    let [version] = await s3Versions(api);
    const [appVersion] = await ebVersions(api);
    if (appVersion > version) {
        version = appVersion;
    }
    return version;
}
async function largestEnvVersion(api) {
    const versions = [0];
    const prefix = 'env/';
    const config = api.getConfig();
    const { bucket: bucketName } = (0, utils_1.names)(config);
    const uploadedBundles = await aws_1.s3.listObjectsV2({
        Bucket: bucketName,
        Prefix: prefix
    });
    if (uploadedBundles.Contents
        && uploadedBundles.Contents.length > 0) {
        uploadedBundles.Contents.forEach((bundle) => {
            if (!bundle.Key)
                return;
            const bundleVersion = parseInt(bundle.Key.split(prefix)[1], 10);
            versions.push(bundleVersion);
        });
    }
    return versions.sort((a, b) => b - a)[0];
}
async function oldEnvVersions(api) {
    const keep = 10;
    const versions = await s3Versions(api, 'env/');
    return versions.slice(keep);
}
async function oldVersions(api) {
    const keep = api.getConfig().app.oldVersions;
    const appVersions = await ebVersions(api);
    const bundleVersions = await s3Versions(api);
    // find unused bundles
    const oldBundleVersions = (0, lodash_difference_1.default)(bundleVersions, appVersions);
    // keep the 3 newest versions
    const oldAppVersions = appVersions.slice(keep);
    return {
        bundles: oldBundleVersions,
        versions: oldAppVersions
    };
}
//# sourceMappingURL=versions.js.map