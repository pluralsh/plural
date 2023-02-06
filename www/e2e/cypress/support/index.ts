// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { GQLInterceptor } from '@intercept/graphql'

Cypress.on('uncaught:exception', () => false)

// The name of the cookie holding whether the user has accepted
// the cookie policy
const COOKIE_NAME = "CookieConsent";
// The value meaning that user has accepted the cookie policy
const COOKIE_VALUE = "{stamp:%27AChnN7ryDrPdHdS3SZUtqfIwORvkzlm6fuG079kDXtk4OOwDDiCXsQ==%27%2Cnecessary:true%2Cpreferences:false%2Cstatistics:false%2Cmarketing:false%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1675377976778%2Cregion:%27us-06%27}";

Cypress.on("window:before:load", window => {
  window.document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}`;
});

before(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
})
beforeEach(() => {
  GQLInterceptor.setup()
})
