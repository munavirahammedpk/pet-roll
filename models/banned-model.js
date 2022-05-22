const { default: mongoose } = require('mongoose')
const collections = require('../config/collections')
const schemas = require('../schemas')


module.exports.bannedModel= new mongoose.model(collections.BANNED_COLLECTION,schemas.bannedSchema)