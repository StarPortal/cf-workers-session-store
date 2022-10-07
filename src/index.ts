import { Encrypter } from './Encrypter'
import { CookieStore } from './CookieStore'
import IStore from './IStore'

export * from './IStore'
export * from './CookieStore'
export * from './Encrypter'

export type SessionArgs = {
  password?: string
}

const AES128BIT_HEXSIZE: number = 32
const AES256BIT_HEXSIZE: number = 64

export function isValidPassword(password: string): boolean {
  if(!password) {
    return false
  }

  if(password.length == AES128BIT_HEXSIZE || password.length == AES256BIT_HEXSIZE) {
    return true
  }

  return false
}

export function createCookieStore(args: SessionArgs): PagesFunction {
  return async function({ request, next, data }) {
    const tmpResponse = new Response()

    data.session = new CookieStore({ reader: request, writer: tmpResponse })
    if (isValidPassword(args.password)) {
      data.session = new Encrypter(data.session as IStore, args.password)
    }

    const response = await next()
    tmpResponse.headers.getAll('Set-Cookie').forEach(cookie => {
      response.headers.append('Set-Cookie', cookie)
    })

    return response
  }
}
