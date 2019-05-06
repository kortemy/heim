var APP
(async () => {
  const favoriteStorage = new FavoriteStorage()
  await favoriteStorage.refresh()
  const folderStorage = new FolderStorage()
  await folderStorage.refresh()
  const periodStorage = new PeriodStorage()
  await periodStorage.refresh()
  
  const renderer = new Render(favoriteStorage, folderStorage, periodStorage)
  APP = new Heim(renderer, favoriteStorage, folderStorage, periodStorage)
  APP.initialize()
})()