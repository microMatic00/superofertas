/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos_collection")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1027380240",
    "max": 0,
    "min": 0,
    "name": "Nombre",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text649502935",
    "max": 0,
    "min": 0,
    "name": "Descripcion",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number285590676",
    "max": null,
    "min": 0,
    "name": "Precio",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file2199507635",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "imagen",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number2331474276",
    "max": null,
    "min": null,
    "name": "Stock",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool2892435498",
    "name": "Activo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos_collection")

  // remove field
  collection.fields.removeById("text1027380240")

  // remove field
  collection.fields.removeById("text649502935")

  // remove field
  collection.fields.removeById("number285590676")

  // remove field
  collection.fields.removeById("file2199507635")

  // remove field
  collection.fields.removeById("number2331474276")

  // remove field
  collection.fields.removeById("bool2892435498")

  return app.save(collection)
})
