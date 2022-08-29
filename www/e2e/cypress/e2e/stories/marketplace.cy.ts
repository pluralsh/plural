import { Application } from '@ctypes/application'
import { LoginPage } from '@pages/login'
import { MarketplacePage } from '@pages/marketplace'

context('Bounce story', () => {
  describe('bounce the first installed app', () => {
    beforeEach(() => LoginPage.login())

    it('should find and open airbyte app', () => {
      MarketplacePage.visit()
      MarketplacePage.openRepository(Application.Airbyte)
    })
  })
})
