class Storage {

  constructor () {
    this.keyFavorites = 'heim-favorites'
    this.keyFolders = 'heim-folders'
    this.keyTheme = 'heim-theme'
  }

  get (key) {
    return localStorage.getItem(key)
  }

  set (key, value) {
    return localStorage.setItem(key, value)
  }

  getFolders () {
    let raw = this.get(this.keyFolders)
    if (raw) return JSON.parse(raw)
    return {}
  }

  setFolders (data) {
    return this.set(this.keyFolders, JSON.stringify(data))
  }

  isExpanded (key) {
    let data = this.getFolders()
    return data && !!data[key]
  }

  getFavorites () {
    let raw = this.get(this.keyFavorites)
    if (raw) return JSON.parse(raw)
    return {}
  }

  setFavorites (data) {
    return this.set(this.keyFavorites,JSON.stringify(data))
  }

  isFavorite (key) {
    let data = this.getFavorites()
    return data && !!data[key]
  }

  getTheme () {
    return this.get(this.keyTheme)
  }

  setTheme (data) {
    return this.set(this.keyTheme, data)
  }
}