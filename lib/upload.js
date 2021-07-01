"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = upload;
exports.uploadEnvFile = uploadEnvFile;

var _fs = _interopRequireDefault(require("fs"));

var _shellEscape = _interopRequireDefault(require("shell-escape"));

var _aws = require("./aws");

function upload(appConfig, bucket, key, bundlePath) {
  var params = {
    Bucket: bucket
  };

  var fileStream = _fs.default.createReadStream(bundlePath);

  fileStream.on('error', function (err) {
    console.log(err);
  });
  params.Body = fileStream;
  params.Key = key;
  return new Promise(function (resolve, reject) {
    var lastPercentage = -1;

    var uploader = _aws.s3.upload(params);

    uploader.on('httpUploadProgress', function (progress) {
      var percentage = Math.floor(progress.loaded / progress.total * 100);

      if (percentage !== lastPercentage) {
        console.log("  Uploaded ".concat(percentage, "%"));

        if (percentage === 100) {
          console.log('  Finishing upload. This could take a couple minutes');
        }
      }

      lastPercentage = percentage;
    });
    uploader.send(function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

function uploadEnvFile(bucket, version, env, settings) {
  var content = '';
  var settingsString = encodeURIComponent(JSON.stringify(settings));
  Object.keys(env).forEach(function (key) {
    var value = (0, _shellEscape.default)([env[key]]);
    content += "export ".concat(key, "=").concat(value, "\n");
  });
  content += "export METEOR_SETTINGS_ENCODED=".concat((0, _shellEscape.default)([settingsString]));
  return new Promise(function (resolve, reject) {
    var uploader = _aws.s3.upload({
      Bucket: bucket,
      Body: content,
      Key: "env/".concat(version, ".txt")
    });

    uploader.send(function (err, result) {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}
//# sourceMappingURL=upload.js.map