import { injectable, inject } from 'inversify'
import { makeObservable, computed } from 'mobx'
import { AuthorsRepository } from './AuthorsRepository'
import { MessagesPresenter } from '../Core/Messages/MessagesPresenter'

@injectable()
class AuthorsPresenter extends MessagesPresenter {
  @inject(AuthorsRepository)
  authorsRepository

  newBookName = null

  lastAddedBook = null

  load = async () => {
    await this.authorsRepository.load()
  }

  get viewModel() {
    const authorsPm = this.authorsRepository.authorsPm
    console.log('AuthorsPresenter.viewModel: authorsPm=', authorsPm)
    if (authorsPm?.success) {
      return authorsPm.authors.map((author) => {
        return { visibleAuthor: `(${author.name}) | (${author.bookNamesByAuthor.join(',')})` }
      })
    } else {
      return []
    }
  }

  get showAuthors() {
    return this.authorsRepository.showAuthors
  }

  constructor() {
    super()
    makeObservable(this, {
      viewModel: computed,
      showAuthors: computed
    })
  }

  toggleShowAuthors = () => {
    this.authorsRepository.showAuthors = !this.authorsRepository.showAuthors
  }

  // addAuthor = async () => {
  //   const authorsPm = await this.authorsRepository.addAuthor(this.newBookName)
  //   if (authorsPm.success) {
  //     this.lastAddedBook = this.newBookName
  //   }
  //   this.unpackRepositoryPmToVm(authorsPm, 'Author added')
  // }

  reset = () => {
    this.authorsPm = null
  }
}
export { AuthorsPresenter }
