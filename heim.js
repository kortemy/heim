class Heim {
  constructor (renderer, favoriteStorage, folderStorage, periodStorage) {
    this.renderer = renderer
    this.favoriteStorage = favoriteStorage
    this.folderStorage = folderStorage
    this.periodStorage = periodStorage
  }
  async toggleFavorite (item, element) {
    element = element.classList.contains('favorite') ? element : element.parentElement
    let favorites = this.favoriteStorage.get()
    let id = btoa(item.id || item.url)

    if (this.favoriteStorage.isFavorite(id)) {
      delete favorites[id]
      element.classList.remove('active')
    } else {
      favorites[id] = item
      element.classList.add('active')
    }

    await this.favoriteStorage.set(favorites)
    await this.initFavorites()

    document.querySelectorAll('.favorite').forEach(async el => {
      let data = el.getAttribute('data-favorite')
      if (this.favoriteStorage.isFavorite(data)) {
        el.classList.add('active')
      } else {
        el.classList.remove('active')
      }
    })
  }
  async toggleFolder (bookmark) {
    let folders = this.folderStorage.get()
    let expanded = this.folderStorage.isExpanded(bookmark.id)
    if (expanded) {
      folders[bookmark.id] = false
    } else {
      folders[bookmark.id] = true
    }
    await this.folderStorage.set(folders)
  }
  async launchApp (el) {
    let parent = el.target.parentElement
    if (!parent.getAttribute('data-app')) {
      parent = parent.parentElement
    }
    let appId = atob(parent.getAttribute('data-app'))
    return new Promise((resolve, reject) => {
      chrome.management.launchApp(appId, () => {
        resolve()
      })
    })
  }
  async initialize () {
    
    await this.initMenuEvents()

    await Promise.all([
      this.initFavorites(),
      this.initMostVisited(),
      this.initRecentlyClosed(),
      this.initBookmarks(),
      this.initDevices(),
      this.initApps(),
    ])
  }

  async initMenuEvents () {
    ['home', 'bookmarks', 'devices', 'apps'].forEach(item => {
      document.querySelector(`#link-${item}`).addEventListener('click', (el) => {
        document.querySelectorAll('.page').forEach(el => el.style.display = 'none')
        document.querySelector(`#${item}`).style.display = 'block'
        document.querySelectorAll('.link-item').forEach(el => el.classList.remove('uk-active'))
        if (item !== 'home') el.target.parentElement.classList.add('uk-active')
      })
    });
    ['1', '7', '30', '365'].forEach(item => {
      document.querySelector(`#period-${item}`).addEventListener('click', async (el) => {
        document.querySelectorAll('.period-item').forEach(el => el.classList.remove('uk-active'))
        el.target.parentElement.classList.add('uk-active')

        await this.periodStorage.set(Number(item))
        await this.initMostVisited()
      })
    });
  }
  async initFavorites () {
    let list = document.querySelector('#list-fv')
    while (list.firstChild) list.removeChild(list.firstChild)

    let favorites = this.favoriteStorage.get()

    if (Object.values(favorites).length === 0) {
      let markup = `
        <li>
          <div>
            Nothing here!
          </div>
          <div>
            You can add favorites by clicking on the <span uk-icon="icon: star; ratio: 0.7"></span> next to bookmarks or links
          </div>
        </li>
      `
      let el = await this.renderer.render(markup)
      list.appendChild(el)
      return
    }

    return Promise.all(Object.values(favorites).map(async fv => {
      if (fv.id) {
        return this.renderer.renderBookmark(fv, 'list-fv', 'home')
      }
      return this.renderer.renderLink(fv, 'list-fv', 'home')
    }))
  }
  async initMostVisited () {
    let list = document.querySelector('#list-mv')
    while (list.firstChild) list.removeChild(list.firstChild)

    const period = this.periodStorage.get()
    const query = ''
    const maxResults = 2147483647 // maximum
    const duration = (period * 24 * 60 * 60 * 1000)
    const maxItems = 25
    const startTime = new Date().getTime() - duration

    await new Promise((resolve, reject) => {
      chrome.history.search({ text: query, maxResults: maxResults, startTime: startTime}, async result => {
        let sorted = result.sort((a, b) => {
          if (a.typedCount > b.typedCount) return -1
          if (a.typedCount < b.typedCount) return 1
          return 0
        }).slice(0, maxItems)
        await Promise.all(sorted.map(item => {
          return this.renderer.renderLink(item, 'list-mv', 'home')
        }))
        resolve()
      })
    })
  
  }
  async initRecentlyClosed () {
    return new Promise((resolve, reject) => {
      chrome.sessions.getRecentlyClosed({}, async (result) => {
        await Promise.all(result.map(item => {
          return this.renderer.renderLink(item.tab, 'list-rc', 'home')
        }))
        let period = this.periodStorage.get()
        document.querySelectorAll(`.period-item`).forEach(el => el.classList.remove('uk-active'))
        document.querySelector(`#period-${period}`).parentElement.classList.add('uk-active')
        resolve()
      })
    })
  }
  async initBookmarks () {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree(async result => {
        await Promise.all(result[0].children.map(async category => {
          await this.renderer.renderColumn(category, 'bookmarks-grid')
          return Promise.all(category.children.map(b => {
            return this.renderer.renderBookmark(b, `column-${category.id}`, 'bookmarks')
          }))
        }))
        resolve()
      })
    })
  }
  async initDevices () {
    return new Promise((resolve, reject) => {
      chrome.sessions.getDevices({}, async result => {
        await Promise.all(result.map(async device => {
          let category = {
            index: result.indexOf(device),
            id: `device-${result.indexOf(device)}`,
            title: device.deviceName
          }
          await this.renderer.renderColumn(category, 'devices-grid')
          return Promise.all(device.sessions[0].window.tabs.map(tab => {
            return this.renderer.renderLink(tab, `column-${category.id}`, 'devices')
          }))
        }))
        resolve()
      })
    })
  }
  async initApps () {
    return new Promise((resolve, reject) => {
      chrome.management.getAll(async result => {
        let apps = result.filter(app => app.type === 'packaged_app')
        await Promise.all(apps.map(app => {
          return this.renderer.renderApp({
            index: apps.indexOf(app),
            icon: app.icons[app.icons.length - 1],
            name: app.name,
            id: app.id
          }, 'apps-grid')
        }))
        resolve()
      })
    })
  }
}

