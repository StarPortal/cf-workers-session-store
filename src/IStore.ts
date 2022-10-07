export default interface IStore {
  put(key: string, value: string, options: any): Promise<void>
  get(key: string): Promise<string | null>
}
