import { Dispatch } from '@ctypes/dispatch'
import { GQLOperation, GQLResponseHandler } from '@ctypes/graphql'
import { Mutations } from '@ctypes/mutations'
import { Queries } from '@ctypes/queries'
import { GQLResponseHandlerFactory } from '@intercept/factory'
import { CyHttpMessages, Interception } from 'cypress/types/net-stubbing'

export class GQLInterceptor {
  private static readonly _endpoint = '/gql'

  private static readonly _method = 'POST'

  private static readonly _operations = new Set<GQLOperation>([
    ...Object.values(Mutations),
    ...Object.values(Queries),
  ])

  static setup(): void {
    cy.intercept(GQLInterceptor._method, GQLInterceptor._endpoint, GQLInterceptor._routeHandler)
  }

  private static _routeHandler(req: CyHttpMessages.IncomingHttpRequest): void {
    const { body } = req
    const operation = body?.operationName

    if (GQLInterceptor._operations.has(operation)) {
      const handler = GQLResponseHandlerFactory.new(operation)

      req.alias = operation
      req.on('after:response', GQLInterceptor._responseHandler(handler))
    }
  }

  private static _responseHandler(handler: GQLResponseHandler): (res: CyHttpMessages.IncomingResponse) => void {
    return (res: CyHttpMessages.IncomingResponse) => {
      const { body: { data } } = res

      handler.handle(data)
    }
  }

  static wait(op: GQLOperation, timeout?: number): void

  static wait(op: GQLOperation, onResponse?: Dispatch<Interception>): void

  static wait(op: Array<GQLOperation>, timeout?: number): void

  static wait(op: GQLOperation | Array<GQLOperation>, timeoutOrCb?: number | Dispatch<Interception>): void {
    const handler = (o: GQLOperation): void => {
      const alias = `@${o}`

      if (timeoutOrCb instanceof Function) {
        cy.wait(alias).then(timeoutOrCb)

        return
      }

      const timeout: number = timeoutOrCb

      cy.wait(alias, timeout ? { timeout } : undefined)
    }

    if (op instanceof Array) {
      op.forEach(handler)

      return
    }

    handler(op)
  }

  static response<T extends GQLResponseHandler>(op: GQLOperation): T {
    return GQLResponseHandlerFactory.new(op) as T
  }
}
