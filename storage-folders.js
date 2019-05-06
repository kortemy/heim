class FolderStorage {
  constructor () {
    this.storageKey = 'heim-folders'
    this.folders = null
  }

  get () {
    return this.folders
  }

  isExpanded (key) {
    return !!this.folders[key]
  }

  async refresh () {
    this.folders = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(this.storageKey, async result => {
        let folders = result[this.storageKey]
        if (!folders) return resolve({})
        resolve(folders)
      })
    })
  }

  async set (folders) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [this.storageKey]: folders }, async () => {
        await this.refresh()
        resolve()
      })
    })
  }
}