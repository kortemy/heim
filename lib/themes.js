class Themes {
  themes = {
    dark: `
      body, nav, .app { background-color: #121212 !important; }
      .link { color: #75baff !important; }
      .link.hover:hover { color: #8dc6ff !important; }
      .text.normal { color: #eee !important; }
      .text.light { color: #bbb !important; }
      .text.hover:hover { color: #fff !important; }
      .icon path, .icon line, .icon circle { stroke: #ddd; }
      .icon.icon-favorite path { stroke: #777; }
      .active .icon path { stroke: #ffbe6d; stroke-width: 30px; }
      .logo path, .logo line { stroke: #75baff; stroke-width: 20px; }
    `,
    light: `
      body, nav, .app { background-color: #f8f8f8 !important; }
      .link { color: #1e87f0 !important; }
      .link.hover:hover { color: #0f6ecd !important; }
      .text.normal { color: #666 !important; }
      .text.light { color: #999 !important; }
      .text.hover:hover { color: #333 !important; }
      .icon path, .icon line, .icon circle { stroke: #000; }
      .icon.icon-favorite path { stroke: #999; }
      .active .icon path { stroke: #fab95b; stroke-width: 40px; }
      .logo path, .logo line { stroke: #1e87f0; stroke-width: 20px; }
    `,
  }

  constructor (storage) {
    this.storage = storage
    this.style = null
  }

  set (theme) {
    this.storage.setTheme(theme)
    this.load()
  }

  load () {
    let theme = this.storage.getTheme()  || 'light'
    if (!this.style) {
      this.style = document.createElement('style')
      document.head.appendChild(this.style)
    }
    this.style.innerText = this.themes[theme].trim()
  }
}