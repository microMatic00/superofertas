/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pedidos_collection")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1224148405",
    "max": 0,
    "min": 0,
    "name": "Cliente_nombre",
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
    "id": "text1827272348",
    "max": 0,
    "min": 0,
    "name": "Cliente_telefono",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json551536201",
    "maxSize": 0,
    "name": "Items",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number65982042",
    "max": null,
    "min": null,
    "name": "Total",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select569500885",
    "maxSelect": 1,
    "name": "Estado",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "pendiente",
      "confirmado",
      "entregado",
      "cancelado"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pedidos_collection")

  // remove field
  collection.fields.removeById("text1224148405")

  // remove field
  collection.fields.removeById("text1827272348")

  // remove field
  collection.fields.removeById("json551536201")

  // remove field
  collection.fields.removeById("number65982042")

  // remove field
  collection.fields.removeById("select569500885")

  return app.save(collection)
})
