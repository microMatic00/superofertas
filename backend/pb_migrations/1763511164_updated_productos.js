/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos_collection")

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "categorias_collection",
    "hidden": false,
    "id": "relation3437334670",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Categoria",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos_collection")

  // remove field
  collection.fields.removeById("relation3437334670")

  return app.save(collection)
})
