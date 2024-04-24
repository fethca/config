import mockdate from 'mockdate'
import { ConfigService } from '../src/config.js'

mockdate.set(1000)

class MockService extends ConfigService<string> {
  fetch = vi.fn().mockResolvedValue('titi')
}

describe('getConfig', () => {
  it('should fetch config if config is undefined', async () => {
    const service = new MockService(0)
    await service.getConfig()
    expect(service.fetch).toHaveBeenCalled()
  })

  it('should update expiry time if config is undefined', async () => {
    const service = new MockService(0)
    service['updateExpired'] = vi.fn()
    await service.getConfig()
    expect(service['updateExpired']).toHaveBeenCalled()
  })

  it('should fetch config if config is expired', async () => {
    const service = new MockService(0)
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(true)
    await service.getConfig()
    expect(service.fetch).toHaveBeenCalled()
  })

  it('should update expiry time if config is expired', async () => {
    const service = new MockService(0)
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(true)
    service['updateExpired'] = vi.fn()
    await service.getConfig()
    expect(service['updateExpired']).toHaveBeenCalled()
  })

  it('should fetch config if config is defined, not expired and force is true', async () => {
    const service = new MockService(0)
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(false)
    await service.getConfig(true)
    expect(service.fetch).toHaveBeenCalled()
  })

  it('should not fetch config if config is defined and not expired', async () => {
    const service = new MockService(0)
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(false)
    await service.getConfig()
    expect(service.fetch).not.toHaveBeenCalled()
  })

  it('should not update expiry time if config is defined and not expired', async () => {
    const service = new MockService(0)
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(false)
    service['updateExpired'] = vi.fn()
    await service.getConfig()
    expect(service['updateExpired']).not.toHaveBeenCalled()
  })

  it('should not update config if fetch fails', async () => {
    const service = new MockService(0)
    service.fetch.mockRejectedValue(new Error('500'))
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(true)
    await service.getConfig()
    expect(service['config']).toBe('toto')
  })

  it('should emit fetch-error event if fetch fails', async () => {
    const service = new MockService(0)
    service.fetch.mockRejectedValue(new Error('500'))
    service['config'] = 'toto'
    service['isExpired'] = vi.fn().mockReturnValue(true)
    service.emit = vi.fn()
    await service.getConfig()
    expect(service.emit).toHaveBeenCalledWith('fetch-error', new Error('500'))
  })

  it('should throw if config is undefined after a fetch', async () => {
    const service = new MockService(0)
    service.fetch.mockRejectedValue(new Error('500'))
    await expect(service.getConfig()).rejects.toThrow(new Error('Config could not be loaded'))
  })

  it('should return config', async () => {
    const service = new MockService(0)
    const config = await service.getConfig()
    expect(config).toBe('titi')
  })
})

describe('isExpired', () => {
  it('should return true if expiry time is before now', () => {
    const service = new MockService(0)
    service['expiryTime'] = 900
    expect(service['isExpired']()).toBe(true)
  })

  it('should return false if expiry time is now', () => {
    const service = new MockService(0)
    service['expiryTime'] = 1000
    expect(service['isExpired']()).toBe(false)
  })

  it('should return false if expiry time is after now', () => {
    const service = new MockService(0)
    service['expiryTime'] = 1100
    expect(service['isExpired']()).toBe(false)
  })
})

describe('updateExpired', () => {
  it('should set expiry time according to interval', () => {
    const service = new MockService(200)
    service['updateExpired']()
    expect(service['expiryTime']).toBe(1200)
  })
})
