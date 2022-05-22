const collections = require('../config/collections')
const schemas = require('../schemas')
const mongoose = require('mongoose')




module.exports.dashboardModel=new mongoose.model(collections.DASHBOARD_COLLECTION,schemas.dashboardSchema)
    