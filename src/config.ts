import { EventEmitter } from 'node:events'

export abstract class ConfigService<T> extends EventEmitter {
  private config?: T
  private expiryTime = 0

  constructor(private interval: number) {
    super()
  }

  abstract fetch(): Promise<T>

  async getConfig(force = false): Promise<T> {
    if (force || !this.config || this.isExpired()) {
      try {
        this.config = await this.fetch()
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

  private isExpired(): boolean {
    return this.expiryTime < Date.now()
  }

  private updateExpired() {
    this.expiryTime = Date.now() + this.interval
  }
}
