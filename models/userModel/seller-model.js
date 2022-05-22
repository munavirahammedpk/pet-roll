const collections = require('../../config/collections')
const schemas = require('../../schemas')
const mongoose = require('mongoose')
const { dashboardModel } = require('../dash-model')
const ObjectId = mongoose.Types.ObjectId

module.exports = {
    addToDashboard: (userId, petId) => {
        //console.log(userId);
        // console.log(petId);
        return new Promise(async (resolve, reject) => {
            let dashboard = await dashboardModel.findOne({ user: userId })
            if (dashboard) {
                dashboardModel.updateOne({ user: ObjectId(userId) },
                    {
                        $push: { pets: ObjectId(petId) }
                    }
                ).then((response) => {
                    resolve()
                })
            } else {
                let dashObj = {
                    user: userId,
                    pets: [petId]
                }
                dashboardModel.insertOne(dashObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getDashboard: (userId) => {
        return new Promise(async (resolve, reject) => {
            let dashboard = await dashboardModel.findOne({ user: ObjectId(userId) })
            let details = await dashboardModel.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },


                {
                    $lookup: {
                        from: collections.PET_COLLECTION,
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'dashboard'
                    }
                }

            ]).toArray()
            if (dashboard) {
                resolve(details[0].dashboard)
            } else {
                resolve({ status: true })
            }
        })
    }

}