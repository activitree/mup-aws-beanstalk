import { logStep, names } from './utils.js';
import { beanstalk } from './aws.js';
import { getRecheckInterval, checkForThrottlingException, handleThrottlingException } from './recheck.js';
export async function getLastEvent(config) {
    const { environment } = names(config);
    const { Events } = await beanstalk.describeEvents({
        EnvironmentName: environment,
        MaxRecords: 5
    });
    if (!Events || Events.length === 0) {
        return;
    }
    return Events[0].EventDate;
}
export async function showEvents(config, eventHistory, lastEventDate) {
    const { environment, app } = names(config);
    const { Events } = await beanstalk.describeEvents({
        EnvironmentName: environment,
        ApplicationName: app,
        StartTime: lastEventDate
    });
    if (!Events || Events.length === 0) {
        return lastEventDate;
    }
    Events.forEach((event) => {
        if (event.EventDate?.toString() === lastEventDate?.toString()) {
            return;
        }
        console.log(`  Env Event: ${event.Message}`);
        eventHistory.push(event);
    });
    return Events[0].EventDate ? new Date(Events[0].EventDate) : undefined;
}
async function checker(config, prop, wantedValue, showProgress, eventHistory) {
    const { environment, app } = names(config);
    let lastEventDate;
    let lastStatus;
    if (showProgress) {
        lastEventDate = await getLastEvent(config);
    }
    return new Promise((resolve, reject) => {
        async function check() {
            let result;
            try {
                result = await beanstalk.describeEnvironments({
                    EnvironmentNames: [environment],
                    ApplicationName: app
                });
            }
            catch (e) {
                if (checkForThrottlingException(e)) {
                    handleThrottlingException();
                    return setTimeout(check, getRecheckInterval());
                }
                console.log(e);
                reject(e);
            }
            const Environment = result.Environments?.[0];
            const value = Environment?.[prop];
            if (value !== wantedValue && value !== lastStatus) {
                const text = prop === 'Health' ? `be ${wantedValue}` : `finish ${value}`;
                logStep(`=> Waiting for Beanstalk environment to ${text.toLocaleLowerCase()}`);
                lastStatus = value;
            }
            else if (value === wantedValue) {
                // TODO: run showEvents one last time
                resolve();
                return;
            }
            if (showProgress) {
                try {
                    lastEventDate = await showEvents(config, eventHistory, lastEventDate);
                }
                catch (e) {
                    if (checkForThrottlingException(e)) {
                        handleThrottlingException();
                    }
                    else {
                        console.log(e);
                    }
                }
            }
            return setTimeout(check, getRecheckInterval());
        }
        check();
    });
}
export async function waitForEnvReady(config, showProgress, eventHistory = []) {
    await checker(config, 'Status', 'Ready', showProgress, eventHistory);
}
export async function waitForHealth(config, health = 'Green', showProgress) {
    await checker(config, 'Health', health, showProgress, []);
}
//# sourceMappingURL=env-ready.js.map