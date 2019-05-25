class Render {
  constructor (storage) {
    this.storage = storage
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
        <div class="uk-text-uppercase text light">${column.title}</div>
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
    let isFavorite = this.storage.isFavorite(btoa(link.url))
    let markup = `
      <li>
        <span class="favorite ${isFavorite && 'active'}" 
          data-favorite="${btoa(encodeURI(link.url))}">
          <svg class="uk-margin-small-right icon icon-favorite" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
            <path id="XMLID_1_" fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" d="M260.5,43.8l62.2,126.4
              c0.7,1.5,2.1,2.5,3.8,2.7L466,193.1c4.1,0.6,5.7,5.6,2.8,8.5l-101,98.3c-1.2,1.1-1.7,2.8-1.4,4.4l24,138.9c0.7,4.1-3.6,7.2-7.3,5.3
              l-124.7-65.7c-1.5-0.8-3.2-0.8-4.7,0L129,448.4c-3.7,1.9-8-1.2-7.3-5.3l24-138.9c0.3-1.6-0.3-3.3-1.4-4.4l-101-98.3
              c-3-2.9-1.3-7.9,2.8-8.5l139.5-20.1c1.6-0.2,3-1.3,3.8-2.7l62.2-126.4C253.3,40,258.7,40,260.5,43.8z"/>
          </svg>
        </span>
        <div class="link-container">
          <a class="link hover" href="${link.url}">
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
    let isFavorite = this.storage.isFavorite(btoa(bookmark.id))
    let expanded = this.storage.isExpanded(bookmark.id)
    let markup = `
      <li class="uk-margin-small-bottom">
        <span class="favorite ${isFavorite && 'active'}" 
          data-favorite="${btoa(encodeURI(bookmark.id))}">
          <svg class="uk-margin-small-right icon icon-favorite" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
            <path id="XMLID_1_" fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" d="M260.5,43.8l62.2,126.4
              c0.7,1.5,2.1,2.5,3.8,2.7L466,193.1c4.1,0.6,5.7,5.6,2.8,8.5l-101,98.3c-1.2,1.1-1.7,2.8-1.4,4.4l24,138.9c0.7,4.1-3.6,7.2-7.3,5.3
              l-124.7-65.7c-1.5-0.8-3.2-0.8-4.7,0L129,448.4c-3.7,1.9-8-1.2-7.3-5.3l24-138.9c0.3-1.6-0.3-3.3-1.4-4.4l-101-98.3
              c-3-2.9-1.3-7.9,2.8-8.5l139.5-20.1c1.6-0.2,3-1.3,3.8-2.7l62.2-126.4C253.3,40,258.7,40,260.5,43.8z"/>
          </svg>
        </span>
        <a toggle="#folder-${bookmark.id}" class="folder uk-link-text">
          <svg class="uk-margin-small-right icon icon-folder" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
            <path id="XMLID_1_" fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" d="M332.5,103.7h145.9
              c6.6,0,12,5.4,12,12v340.8c0,6.6-5.4,12-12,12H38.2c-6.6,0-12-5.4-12-12V65.7c0-6.6,5.4-12,12-12h180.1c21.3,0,46.4,75.3,68.3,75.3
              c0,0,147.1-0.1,147.1-0.1"/>
          </svg>
          <span class="text normal hover" style="vertical-align:middle">${bookmark.title}</span>
        </a>
        <ul id="folder-${bookmark.id}" style="display: ${expanded ? 'block' : 'none'}" class="uk-list"></ul>
      </li>
    `
    let el = await this.render(markup)
    el.querySelector('.favorite').addEventListener('click', el => APP.toggleFavorite(bookmark, el.target))
    el.querySelector('.folder').addEventListener('click', el => APP.toggleFolder(bookmark, el.target))
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
        </div>
        <div class="uk-card-body text normal">${app.name}</div>
      </div>
    `
    let el = await this.render(markup)
    el.addEventListener('click', el => APP.launchApp(el))
    grid.appendChild(el)
  }
}