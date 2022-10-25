import { Application } from '@ctypes/application'
import { Condition } from '@ctypes/condition'
import { BasePage } from '@pages/base'

export class MarketplacePage extends BasePage {
  private static readonly _url = '/marketplace'

  static visit(): void {
    cy.visit(this._url)
  }

  static openRepository(name: Application): void {
    this._contains('a', name)
      .should(Condition.BeVisible)
      .click({ force: true })
  }
}
