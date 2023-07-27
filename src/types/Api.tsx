export type PresignedUrlType = {
    fields: {
        AWSAccessKeyId: string;
        key: string;
        policy: string;
        signature: string;
        "x-amz-security-token": string;
    },
    url: string;
}
