import { Application } from '@ctypes/application'
import { Condition } from '@ctypes/condition'
import { Queries } from '@ctypes/queries'
import { GQLInterceptor } from '@intercept/graphql'
import { BasePage } from '@pages/base'

export class MarketplacePage extends BasePage {
  private static readonly _url = '/marketplace'

  static visit(): void {
    cy.visit(this._url)
  }

  static openRepository(name: Application): void {
    GQLInterceptor.wait([Queries.Repos, Queries.Tags])

    this._contains('a', name)
      .should(Condition.BeVisible)
      .click()
  }
}
