import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('attachmentUtils')
// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class AttachmentUtils {

  constructor(
    private readonly attachmentBucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) { }

 getUploadUrl(todoId: string): string {
    logger.info(`Processing S3 signed url with key: ${todoId} ${this.attachmentBucketName} ${this.signedUrlExpiration}`)

    return s3.getSignedUrl('putObject', {
      Bucket: this.attachmentBucketName,
      Key: todoId,
      Expires: this.signedUrlExpiration
    })

  }
  
}
