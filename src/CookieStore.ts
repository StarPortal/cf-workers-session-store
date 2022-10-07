import IStore from './IStore'

export type CookieIO = {
  reader: Request
  writer: Response
}

export class CookieStore implements IStore {
  public readonly io: CookieIO;
  private _cookie: { [key: string]: string }

  constructor(io: CookieIO) {
    this.io = io
  }

  get cookie(): { [key: string]: string } {
    if(this._cookie) {
      return this._cookie
    }

    this._cookie = {}
    const items = (this.io.reader.headers.get('Cookie') || '').split('; ')
    for(let item of items) {
      try {
        const [_, key, value] = item.match(/([^=]+)=(.+)/)
        this._cookie[key] = value
      } catch(e: any) {
        continue
      }
    }

    return this._cookie
  }

  async put(key, value, options: string[]): Promise<void> {
    this.io.writer.headers.append('Set-Cookie', Array.from([`${key}=${value}`]).concat(options).join('; '))
  }

  async get(key): Promise<string | null> {
    return this.cookie[key]
  }
}
