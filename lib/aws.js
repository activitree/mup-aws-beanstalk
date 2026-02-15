import { IAM } from '@aws-sdk/client-iam';
import { S3 } from '@aws-sdk/client-s3';
import { ElasticBeanstalk } from '@aws-sdk/client-elastic-beanstalk';
import { ACM } from '@aws-sdk/client-acm';
import { AutoScaling } from '@aws-sdk/client-auto-scaling';
import { CloudWatchEvents } from '@aws-sdk/client-cloudwatch-events';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { CloudTrail } from '@aws-sdk/client-cloudtrail';
import { EC2InstanceConnect } from '@aws-sdk/client-ec2-instance-connect';
import { STS } from '@aws-sdk/client-sts';
import { SSM } from '@aws-sdk/client-ssm';
import { EC2 } from '@aws-sdk/client-ec2';
export let s3;
export let beanstalk;
export let iam;
export let autoScaling;
export let acm;
export let cloudTrail;
export let cloudWatchEvents;
export let sts;
export let ssm;
export let ec2;
export let logs;
export let ec2InstanceConnect;
const MAX_RETRY_DELAY = 1000 * 60 * 2;
// const AWS_UPLOAD_TIMEOUT = 1000 * 60 * 60;
export default function configure({ auth, name: _name, region }) {
    const commonOptions = {
        credentials: {
            accessKeyId: auth.id,
            secretAccessKey: auth.secret
        },
        region: region || 'us-east-1',
        maxRetries: 25,
        retryDelayOptions: {
            customBackoff: (retryCount) => Math.min((2 ** retryCount * 1000), MAX_RETRY_DELAY)
        }
    };
    s3 = new S3({
        ...commonOptions
        // params: { Bucket: `mup-${name}` },
        // httpOptions: { timeout: AWS_UPLOAD_TIMEOUT },
    });
    beanstalk = new ElasticBeanstalk({ ...commonOptions });
    iam = new IAM({ ...commonOptions });
    autoScaling = new AutoScaling({ ...commonOptions });
    acm = new ACM({ ...commonOptions });
    cloudTrail = new CloudTrail({ ...commonOptions });
    sts = new STS({ ...commonOptions });
    cloudWatchEvents = new CloudWatchEvents({ ...commonOptions });
    ssm = new SSM({ ...commonOptions });
    ec2 = new EC2({ ...commonOptions });
    logs = new CloudWatchLogs({ ...commonOptions });
    ec2InstanceConnect = new EC2InstanceConnect({ ...commonOptions });
}
//# sourceMappingURL=aws.js.map