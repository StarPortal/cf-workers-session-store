import { base64 } from 'rfc4648'
import IStore from './IStore'

export class EncryptError extends Error {}
export class DecryptError extends Error {}

export class Encrypter implements IStore {
  protected readonly store: IStore
  private readonly password: string
  private _key: CryptoKey

  constructor(store: IStore, password: string) {
    this.store = store
    this.password = password
  }

  async key(): Promise<CryptoKey> {
    if(!this._key) {
      const buffer = Uint8Array.from(this.password.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
      this._key = await crypto.subtle.importKey('raw', buffer, 'AES-GCM', false, ['encrypt', 'decrypt'])
    }

    return this._key
  }

  async put(key, value, options) {
    const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(12))
    try {
      const encryptedValue: ArrayBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, await this.key(), new TextEncoder().encode(value))
      const data: Array<number>  = Array.from(iv).concat(Array.from(new Uint8Array(encryptedValue)))
      return this.store.put(key, base64.stringify(data), options)
    } catch(e: any) {
      throw new EncryptError(e.message)
    }
  }

  async get(key): Promise<string | null> {
    const raw = await this.store.get(key)
    if (!raw) {
      return
    }

    const data: Uint8Array = base64.parse(raw)
    try {
      const decryptedData: ArrayBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(0, 12) }, await this.key(), data.slice(12))
      return new TextDecoder().decode(decryptedData)
    } catch(e: any) {
      throw new DecryptError(e.message)
    }
  }
}
