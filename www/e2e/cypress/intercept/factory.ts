import { GQLOperation, GQLResponseHandler, NoOpGQLResponseHandler } from '@ctypes/graphql'

export class GQLResponseHandlerFactory {
  static new(op: GQLOperation): GQLResponseHandler {
    switch (op) {
    default:
        // Use LogGQLResponseHandler to console.log unhandled operations
      return new NoOpGQLResponseHandler()
    }
  }
}
