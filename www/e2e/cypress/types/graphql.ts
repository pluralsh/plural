import { Mutations } from './mutations'
import { Queries } from './queries'

export type GQLOperation = keyof typeof Mutations | keyof typeof Queries

export interface GQLResponseHandler {
  handle(res?: unknown): void;
}

export class NoOpGQLResponseHandler implements GQLResponseHandler {
  handle(): void {}
}

export class LogGQLResponseHandler implements GQLResponseHandler {
  handle(res: unknown): void {
    console.log(res)
  }
}
