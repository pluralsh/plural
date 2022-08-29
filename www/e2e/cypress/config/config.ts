export class Config {
  // ENV: CYPRESS_EMAIL
  static readonly EMAIL = Cypress.env('EMAIL')

  // ENV: CYPRESS_PASSWORD
  static readonly PASSWORD = Cypress.env('PASSWORD')
}
