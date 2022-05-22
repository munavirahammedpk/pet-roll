var db = require('../config/connection')
var collection = require('../config/collections')
const { PET_COLLECTION } = require('../config/collections')
const objectId = require('mongodb').ObjectId
//const objid=mongoose.Types.ObjectId()
const { response } = require('express')
const { default: mongoose } = require('mongoose')



module.exports = {
    addToDashboard: (userId, petId) => {
        //console.log(userId);
        // console.log(petId);
        return new Promise(async (resolve, reject) => {
            let dashboard = await db.get().collection(collection.DASHBOARD_COLLECTION).findOne({ user: objectId(userId) })
            if (dashboard) {
                db.get().collection(collection.DASHBOARD_COLLECTION)
                    .updateOne({ user: objectId(userId) },
                        {
                            $push: { pets: objectId(petId) }
                        }
                    ).then((response) => {
                        resolve()
                    })
            } else {
                let dashObj = {
                    user: objectId(userId),
                    pets: [objectId(petId)]
                }
                db.get().collection(collection.DASHBOARD_COLLECTION).insertOne(dashObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    getDashboard: (userId) => {
        return new Promise(async (resolve, reject) => {
            let dashboard = await db.get().collection(collection.DASHBOARD_COLLECTION).findOne({ user: objectId(userId) })
            let details = await db.get().collection(collection.DASHBOARD_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },


                {
                    $lookup: {
                        from: collection.PET_COLLECTION,
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'dashboard'
                    }
                }

            ]).toArray()
            if (dashboard) {
                resolve(details[0].dashboard)
            }else{
                resolve({status:true})
            }
        })
    }
}