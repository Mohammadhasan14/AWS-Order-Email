import { S3Client } from "@aws-sdk/client-s3";

export const s3Clint = new S3Client({
    region: "ap-southeast-2",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_Id,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
})