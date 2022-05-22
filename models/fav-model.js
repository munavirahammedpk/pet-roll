const { default: mongoose } = require('mongoose')
const collections = require('../config/collections')
const schemas = require('../schemas')


module.exports.favouriteModel= new mongoose.model(collections.FAVOURITE_COLLECTION,schemas.favouriteSchema)