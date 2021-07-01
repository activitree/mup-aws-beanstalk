"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRecheckInterval = getRecheckInterval;
exports.checkForThrottlingException = checkForThrottlingException;
exports.handleThrottlingException = handleThrottlingException;
var throttlingExceptionCounter = 0;

function getRecheckInterval() {
  if (throttlingExceptionCounter === 10) {
    throw new Error('Maximum throttling backoff exceeded');
  } else {
    return Math.pow(2, throttlingExceptionCounter) * 3000;
  }
}

function checkForThrottlingException(exception) {
  return exception && exception.code === 'Throttling' && exception.message === 'Rate exceeded';
}

function handleThrottlingException() {
  throttlingExceptionCounter++;
  console.log("Setting new re-check interval to ".concat(getRecheckInterval(), "ms"));
}
//# sourceMappingURL=recheck.js.map