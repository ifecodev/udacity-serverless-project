import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'


const logger = createLogger('businessLogic')

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(
  userId: string
): Promise<TodoItem[]> {
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  logger.info('itemId: ', itemId)

  return await todosAccess.createTodo({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
  })
}

export async function updateTodo(
  updatedTodo: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<void> {

  logger.info('update items: ', updatedTodo)

  return await todosAccess.updateTodo({
    name: updatedTodo.name,
    dueDate: updatedTodo.dueDate,
    done: updatedTodo.done
  }, todoId,userId)

}

export async function deleteTodo(
  todoId: string,
  userId: string
  ) {
  logger.info('delete itemId: ', todoId)

  return await todosAccess.deleteTodo(
    todoId,userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
  ): Promise<string> {
  logger.info('generate url itemId: ', todoId)

  const uploadUrl = attachmentUtils.getUploadUrl(
    todoId)

  await todosAccess.saveAttachmentUrl(
    todoId,userId)

  return uploadUrl;

}
