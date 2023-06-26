

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


const acceskeyid = process.env.ACCES_KEY_ID;
const secretacceskey = process.env.SECRET_ACCES_KEY;

const client = new S3Client({
    region: "eu-west-3",
    credentials: {
        accessKeyId: acceskeyid,
        secretAccessKey: secretacceskey
    }
});

export const main = async () => {
    const command = new PutObjectCommand({
        Bucket: "eu-west-3",
        Key: "hello-s3.txt",
        Body: "Hello S3!",
    });

    try {
        const response = await client.send(command);
        console.log(response);
    } catch (err) {
        console.error(err);
    }
};
