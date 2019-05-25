var APP

(() => {
  const storage = new Storage()
  const themes = new Themes(storage)
  themes.load()
  const renderer = new Render(storage)
  APP = new Heim(storage, renderer, themes)
})()