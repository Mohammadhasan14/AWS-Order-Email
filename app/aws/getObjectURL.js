import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Clint } from "./config"

export const getObjectURL = async (key) => {
    const command = new GetObjectCommand({
        Bucket: "bucket.movies.server",
        Key: key
    })

    const url = getSignedUrl(s3Clint, command, { expiresIn: 86400 })
    return url
}