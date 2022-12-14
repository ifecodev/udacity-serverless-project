import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly attachmentBucketName = process.env.ATTACHMENT_S3_BUCKET,

  ) {
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todos for user: ${userId}`)

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todoUpdate: TodoUpdate, todoId: string,userId: string): Promise<void> {
    logger.info(`update on userId: ${userId} with item `,todoUpdate)
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {todoId: todoId,userId: userId},
      UpdateExpression: 'set #name = :nam, dueDate = :dueDate, #done = :don',
      ExpressionAttributeNames: {"#name": "name","#done" : "done"},
      ExpressionAttributeValues: {
        ':nam': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':don': todoUpdate.done,
      }
    }).promise()

  }

  async deleteTodo(todoId: string,userId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {todoId: todoId,userId: userId},
    }).promise()

  }

  async  saveAttachmentUrl(todoId: string,userId: string): Promise<void> {
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {todoId: todoId,userId: userId},
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${this.attachmentBucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise()
    }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
