import { EventEmitter } from 'node:events'

export abstract class ConfigService<T> extends EventEmitter {
  private config?: T
  private expiryTime = 0
  private timeout: NodeJS.Timeout

  constructor(
    private interval: number,
    private options?: { autoRefresh: boolean },
  ) {
    super()
    this.timeout = setTimeout(() => {}, 0)
    clearTimeout(this.timeout)
  }

  abstract fetch(): Promise<T>

  async getConfig(force = false): Promise<T> {
    if (force || !this.config || this.isExpired()) {
      try {
        this.config = await this.fetch()
        if (this.options?.autoRefresh) this.autoRefresh()
      } catch (error) {
        this.emit('fetch-error', error)
      }
      this.updateExpired()
    }

    if (!this.config) {
      throw new Error('Config could not be loaded')
    }

    return this.config
  }

  private autoRefresh() {
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(async () => {
      await this.getConfig(true)
    }, this.interval)
  }

  private isExpired(): boolean {
    return this.expiryTime < Date.now()
  }

  private updateExpired() {
    this.expiryTime = Date.now() + this.interval
  }
}
