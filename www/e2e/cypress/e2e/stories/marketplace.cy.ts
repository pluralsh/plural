import { Application } from '@ctypes/application'
import { LoginPage } from '@pages/login'
import { MarketplacePage } from '@pages/marketplace'

context('Marketplace story', () => {
  describe('visit application page', () => {
    beforeEach(() => LoginPage.login())

    it('should find and open airbyte app', () => {
      MarketplacePage.visit()
      MarketplacePage.openRepository(Application.Airbyte)
    })
  })
})
