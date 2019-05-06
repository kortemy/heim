class PeriodStorage {
  constructor () {
    this.storageKey = 'heim-period'
    this.period = null
  }

  get () {
    return this.period
  }

  async refresh () {
    this.period = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(this.storageKey, async result => {
        let period = result[this.storageKey]
        if (!period) return resolve(30)
        resolve(period)
      })
    })
  }

  async set (period) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [this.storageKey]: period }, async () => {
        await this.refresh()
        resolve()
      })
    })
  }
}