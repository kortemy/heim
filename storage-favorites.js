class FavoriteStorage {
  constructor () {
    this.storageKey = 'heim-favorites'
    this.favorites = null
  }

  get () {
    return this.favorites
  }

  isFavorite (key) {
    return !!this.favorites[key]
  }

  async refresh () {
    this.favorites = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(this.storageKey, async result => {
        let favorites = result[this.storageKey]
        if (!favorites) return resolve({})
        resolve(favorites)
      })
    })
  }

  async set (favorites) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [this.storageKey]: favorites }, async () => {
        await this.refresh()
        resolve()
      })
    })
  }
}