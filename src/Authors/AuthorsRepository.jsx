import { injectable, inject } from 'inversify'
import { Config } from '../Core/Config'
import { makeObservable, observable } from 'mobx'
import { Types } from '../Core/Types'
import { UserModel } from '../Authentication/UserModel'
import { BooksRepository } from '../Books/BooksRepository'
// import { MessagePacking } from '../Core/Messages/MessagePacking'

@injectable()
class AuthorsRepository {
  baseUrl

  @inject(Types.IDataGateway)
  dataGateway

  @inject(BooksRepository)
  booksRepository

  @inject(UserModel)
  userModel

  @inject(Config)
  config

  authorsPm = 'UNSET'

  showAuthors = true

  constructor() {
    makeObservable(this, { authorsPm: observable, showAuthors: observable })
  }

  load = async () => {
    const dto = await this.dataGateway.get(`/authors?emailOwnerId=${this.userModel.email}`)
    if (dto?.success) {
      // 1. fetch all bookIds from all the authors
      let bookIds = []
      dto.result.forEach((author) => {
        bookIds = bookIds.concat(author.bookIds)
      })

      // 2. fetch bookNames from bookIds and get back bookNames keyed by BookIs
      const booksObj = await this.booksRepository.getAll(bookIds)

      // 3. create authors obj with author name and all corresponding bookNames
      const authors = []
      dto.result.forEach((author) => {
        const bookNamesByAuthor = author.bookIds.map((bookId) => {
          return booksObj[bookId]
        })
        authors.push({
          name: author.name,
          bookNamesByAuthor
        })
      })

      // 4. save to Programmer's Model
      this.authorsPm = {
        success: dto.success,
        authors
      }
    }
    return this.authorsPm
  }

  // addAuthor = async (name) => {
  //   const requestDto = {
  //     name: name,
  //     emailOwnerId: 'a@b.com',
  //     latLon: [1, 2],
  //     bookIds: [1, 2]
  //   }
  //   let responseDto = await this.dataGateway.post(`/authors`, requestDto)
  //   return MessagePacking.unpackServerDtoToPm(responseDto)
  // }

  reset = () => {
    this.authorsPm = null
  }
}
export { AuthorsRepository }
