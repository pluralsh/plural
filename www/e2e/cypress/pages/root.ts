import { BasePage } from '@pages/base'

export class RootPage extends BasePage {
  private static readonly _url = '/'

  static visit(): void {
    cy.visit(this._url)
  }
}
