import { NavigationPresenter } from './NavigationPresenter'
import { Router } from '../Routing/Router'
import { AppTestHarness } from '../TestTools/AppTestHarness'
import { GetSuccessfulRegistrationStub } from '../TestTools/GetSuccessfulRegistrationStub'

let appTestHarness = null
let navigationPresenter = null
let router = null

describe('navigation', () => {
  beforeEach(async () => {
    appTestHarness = new AppTestHarness()
    appTestHarness.init()
    appTestHarness.bootStrap(() => {})
    navigationPresenter = appTestHarness.container.get(NavigationPresenter)
    router = appTestHarness.container.get(Router)
  })

  describe('before login', () => {
    it('anchor default state', () => {
      expect(navigationPresenter.viewModel.currentSelectedVisibleName).toBe('')
      expect(navigationPresenter.viewModel.showBack).toBe(false)
      expect(navigationPresenter.viewModel.menuItems).toEqual([])
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      await appTestHarness.setupLogin(GetSuccessfulRegistrationStub, 'login')
    })
    it('should navigate down the navigation tree', () => {
      // drill down one
      router.goToId('authorsLink')

      expect(navigationPresenter.viewModel.currentSelectedVisibleName).toBe('Authors > authorsLink')
      expect(navigationPresenter.viewModel.showBack).toBe(true)
      expect(navigationPresenter.viewModel.menuItems).toEqual([
        {
          id: 'authorsLink-authorPolicyLink',
          visibleName: 'Author Policy'
        },
        {
          id: 'authorsLink-mapLink',
          visibleName: 'View Map'
        }
      ])

      // drill down two
      router.goToId('authorsLink-authorPolicyLink')

      expect(navigationPresenter.viewModel.currentSelectedVisibleName).toBe(
        'Author Policy > authorsLink-authorPolicyLink'
      )
      expect(navigationPresenter.viewModel.showBack).toBe(true)
      expect(navigationPresenter.viewModel.menuItems).toEqual([])
    })

    it('should move back twice', () => {
      // drill down one
      router.goToId('authorsLink')
      // drill down two
      router.goToId('authorsLink-authorPolicyLink')

      navigationPresenter.back()
      navigationPresenter.back()

      expect(navigationPresenter.viewModel.currentSelectedVisibleName).toBe('Home > homeLink')
      expect(navigationPresenter.viewModel.showBack).toBe(false)
      expect(navigationPresenter.viewModel.menuItems).toEqual([
        {
          id: 'booksLink',
          visibleName: 'Books'
        },
        {
          id: 'authorsLink',
          visibleName: 'Authors'
        }
      ])
    })
  })
})
