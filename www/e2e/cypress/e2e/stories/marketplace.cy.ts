import { LoginPage } from '@pages/login'
import { RootPage } from '@pages/root'

context('Bounce story', () => {
  describe('bounce the first installed app', () => {
    beforeEach(() => LoginPage.login())

    it('should visit the marketplace', () => {
      RootPage.visit()
    })
  })
})
