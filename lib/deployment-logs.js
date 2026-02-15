import uniq from "lodash.uniq";
import { logs } from "./aws.js";
import { logStreamEvent, names } from "./utils.js";
let instanceFinderInterval;
const activeInstanceListeners = {};
async function listen(logGroupName, logStreamName, nextToken) {
    const params = {
        logGroupName,
        logStreamName
    };
    if (nextToken) {
        params.nextToken = nextToken;
    }
    try {
        const { events, nextForwardToken } = await logs.getLogEvents(params);
        events.forEach(event => {
            logStreamEvent(`<${logStreamName}> ${event.message}`);
        });
        if (events && events.length > 0 || nextToken) {
            return nextForwardToken;
        }
        return nextToken;
    }
    catch (err) {
        // @ts-ignore
        if (err && err.name === "ResourceNotFoundException") {
            // Log stream is not yet available, takes a little time
            // console.error("Unable to find log stream", logGroupName, logStreamName);
            // const { logStreams } = await logs.describeLogStreams({
            //   logGroupName,
            // });
            // if (logStreams && logStreams.length > 0) {
            //   console.log("Available log streams", logStreams.map(stream => stream.logStreamName));
            // }
            return nextToken;
        }
        console.error("Error", err);
        return nextToken;
    }
}
// Cheeky function that uses the dynamically updated event log (provided by
// the `showEvents` function) to find the instances that were created during
// the deployment.
function getInstancesFromLogs(eventLog) {
    const instances = [];
    eventLog.forEach(event => {
        const match = event.Message?.match(/EC2 instance\(s\) \[(.*)\]/);
        if (match) {
            const newInstances = match[1].split(', ');
            newInstances.forEach(instance => {
                instances.push(instance.trim());
            });
        }
    });
    return uniq(instances);
}
async function startInstanceLogListener(logGroupName, instanceName) {
    const logStreamName = instanceName;
    try {
        console.log(`Started listening to ${logGroupName}:${instanceName}`);
        let nextToken = await listen(logGroupName, logStreamName);
        return setInterval(async () => {
            nextToken = await listen(logGroupName, logStreamName, nextToken);
        }, 5000);
    }
    catch (err) {
        // @ts-ignore
        if (err.name === "ResourceNotFoundException") {
            console.error("Unable to find log streams for", logGroupName);
        }
        else {
            console.error("Log stream error", err);
        }
        return;
    }
}
async function startInstanceListeners(logGroupName, instanceNames) {
    instanceNames.forEach(async (instanceName) => {
        if (activeInstanceListeners[instanceName]) {
            return;
        }
        const instanceListener = await startInstanceLogListener(logGroupName, instanceName);
        if (instanceListener) {
            activeInstanceListeners[instanceName] = instanceListener;
        }
    });
}
export async function startLogStreamListener(api, eventLog) {
    const config = api.getConfig();
    console.log("Start log stream listener");
    const { environment } = names(config);
    const logFileName = 'var/log/web.stdout.log';
    const logGroupName = `/aws/elasticbeanstalk/${environment}/${logFileName}`;
    await startInstanceListeners(logGroupName, getInstancesFromLogs(eventLog));
    instanceFinderInterval = setInterval(async () => {
        await startInstanceListeners(logGroupName, getInstancesFromLogs(eventLog));
    }, 5000);
}
export async function stopLogStreamListener() {
    clearInterval(instanceFinderInterval);
    Object.values(activeInstanceListeners).forEach(listener => {
        clearInterval(listener);
    });
}
//# sourceMappingURL=deployment-logs.js.map