class Render {
  constructor (favoriteStorage, folderStorage, periodStorage) {
    this.favoriteStorage = favoriteStorage
    this.folderStorage = folderStorage
    this.periodStorage = periodStorage
  }

  async render (markup) {
    let template = document.createElement('template')
    template.innerHTML = markup.trim()
    return template.content.firstChild
  }
  async renderColumn (column, parentId) {
    let grid = document.querySelector(`#${parentId}`)
    let markup = `
      <div class="${column.index === 0 ? 'uk-first-column' : ''}">
        <div class="uk-text-uppercase">${column.title}</div>
        <ul id="column-${column.id}" class="uk-list">
        </ul>
      </div>
    `
    let el = await this.render(markup)
    grid.appendChild(el)
  }
  async renderLink (link, parentId, page) {
    let list = document.querySelector(`#${page}`).querySelector(`#${parentId}`)
    let domain = link.url.includes('chrome://') ? 'https://developers.chrome.com' : new URL(link.url).origin
    let isFavorite = this.favoriteStorage.isFavorite(btoa(link.url))
    let markup = `
      <li>
        <span class="favorite ${isFavorite && 'active'}" uk-icon="icon: star; ratio: 0.7" 
          data-favorite="${btoa(encodeURI(link.url))}"></span>
        <div class="link-container">
          <a href="${link.url}">
            <img class="favicon uk-margin-small-right" style="vertical-align:middle" src="https://www.google.com/s2/favicons?domain=${domain}" />
            <span style="vertical-align:middle">${link.title}</span>
          </a>
        </div>
      </li>
    `
    let el = await this.render(markup)
    delete link.id
    el.querySelector('.favorite').addEventListener('click', el => APP.toggleFavorite(link, el.target))
    list.appendChild(el)
  }
  async renderBookmark (bookmark, parentId, page) {
    let list = document.querySelector(`#${page}`).querySelector(`#${parentId}`)
    if (!bookmark) {
      let markup = `
        <span>\< empty \></span>
      `
      let el = await this.render(markup)
      list.appendChild(el)
      return
    }
    if (bookmark.url) {
      return this.renderLink(bookmark, parentId, page)
    }
    let isFavorite = this.favoriteStorage.isFavorite(btoa(bookmark.id))
    let expanded = this.folderStorage.isExpanded(bookmark.id)
    let markup = `
      <li class="uk-margin-small-bottom">
        <span class="favorite ${isFavorite && 'active'}" uk-icon="icon: star; ratio: 0.7" 
          data-favorite="${btoa(encodeURI(bookmark.id))}"></span>
        <a uk-toggle="target: #folder-${bookmark.id}" class="folder uk-link-text">
          <span class="uk-margin-small-right uk-icon" uk-icon="folder"></span>${bookmark.title}
        </a>
        <ul id="folder-${bookmark.id}" ${expanded || 'hidden'} class="uk-list"></ul>
      </li>
    `
    let el = await this.render(markup)
    el.querySelector('.favorite').addEventListener('click', el => APP.toggleFavorite(bookmark, el.target))
    el.querySelector('.folder').addEventListener('click', el => APP.toggleFolder(bookmark))
    list.appendChild(el)

    if (bookmark.children.length === 0) return this.renderBookmark(null, `folder-${bookmark.id}`, page)
    return Promise.all(bookmark.children.map(b => {
      return this.renderBookmark(b, `folder-${bookmark.id}`, page)
    }))
  }
  async renderApp (app, parentId) {
    let grid = document.querySelector(`#${parentId}`)
    let markup = `  
      <div class="app uk-card uk-card-default ${app.index > 0 ? 'uk-margin-left' : ''}" 
        data-app='${btoa(app.id)}'>      
        <div class="uk-card-media-top uk-cover-container">
          <img src="${app.icon.url}" style="width: 128px; height: 128px;" alt="" uk-cover>
          <canvas width="128" height="128"></canvas>
        </div>
        <div class="uk-card-body">${app.name}</div>
      </div>
    `
    let el = await this.render(markup)
    el.addEventListener('click', el => APP.launchApp(el))
    grid.appendChild(el)
  }
}