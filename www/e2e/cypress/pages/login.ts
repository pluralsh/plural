import { Config } from '@config/config'
import { BasePage } from '@pages/base'
import { RootPage } from '@pages/root'
import { Condition } from '@ctypes/condition'
import { Mutations } from '@ctypes/mutations'
import { Queries } from '@ctypes/queries'
import { GQLInterceptor } from '@intercept/graphql'

export class LoginPage extends BasePage {
  static login(email: string = Config.EMAIL, password: string = Config.PASSWORD): void {
    cy.session([email, password], () => {
      RootPage.visit()

      this._emailInput.type(email)
      this._continueButton.should(Condition.BeVisible).and(Condition.BeEnabled).click()

      GQLInterceptor.wait(Queries.LoginMethod)

      this._passwordInput.type(password)
      this._continueButton.should(Condition.BeVisible).and(Condition.BeEnabled).click()

      GQLInterceptor.wait([Mutations.Login])
    })
  }

  private static get _emailInput(): Cypress.Chainable {
    return this._get('[name=\'Email address\']')
  }

  private static get _passwordInput(): Cypress.Chainable {
    return this._get('[name=\'Password\']')
  }

  private static get _continueButton(): Cypress.Chainable {
    return this._contains('button', 'Continue')
  }
}
