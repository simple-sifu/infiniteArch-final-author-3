import { injectable, inject } from 'inversify'
import { Config } from '../Core/Config'
import { makeObservable, observable } from 'mobx'
import { Types } from '../Core/Types'
import { UserModel } from '../Authentication/UserModel'
import { MessagePacking } from '../Core/Messages/MessagePacking'

@injectable()
class BooksRepository {
  baseUrl

  @inject(Types.IDataGateway)
  dataGateway

  @inject(UserModel)
  userModel

  @inject(Config)
  config

  booksPm = 'UNSET'
  bookPm = 'UNSET'

  constructor() {
    makeObservable(this, {
      bookPm: observable,
      booksPm: observable
    })
  }

  load = async () => {
    const booksDto = await this.dataGateway.get(`/books?emailOwnerId=${this.userModel.email}`)
    console.log('BooksRepository.load() booksDto=', booksDto)
    if (booksDto?.success) {
      this.booksPm = {
        success: booksDto.success,
        books: booksDto.result.map((book) => {
          return book
        })
      }
    }
    return this.booksPm
  }

  get = async (bookId) => {
    const path = `/book?emailOwnerId=${this.userModel.email}&bookId=${bookId}`
    const bookDto = await this.dataGateway.get(path)
    console.log('BooksRespository.get bookDto=', bookDto)
    if (bookDto?.success) {
      this.bookPm = {
        success: bookDto.success,
        name: bookDto.result[0].name
      }
    }
    return this.bookPm
  }

  // fetch bookNames from bookIds concurrently using Promise.all
  getAll = async (bookIds) => {
    const booksObj = {}
    await Promise.all(
      bookIds.map(async (bookId) => {
        const bookDto = await this.get(bookId)
        booksObj[bookId] = bookDto.name
      })
    )
    return booksObj
  }

  addBook = async (name) => {
    const requestDto = {
      name: name,
      emailOwnerId: 'a@b.com'
    }
    let responseDto = await this.dataGateway.post(`/books`, requestDto)
    return MessagePacking.unpackServerDtoToPm(responseDto)
  }

  reset = () => {
    this.bookPm = null
    this.booksPm = null
  }
}

export { BooksRepository }
