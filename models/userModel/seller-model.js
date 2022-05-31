const collections = require('../../config/collections')
const schemas = require('../../schemas')
const mongoose = require('mongoose')
module.exports.dashboardModel = new mongoose.model(collections.DASHBOARD_COLLECTION, schemas.dashboardSchema)

const ObjectId = mongoose.Types.ObjectId
//const petModel = mongoose.model(collections.PET_COLLECTION, schemas.petSchema)


module.exports = {
    addToDashboard: (userId, petId) => {
        //console.log(userId);
        // console.log(petId);
        return new Promise(async (resolve, reject) => {
            let dashboard = await this.dashboardModel.findOne({ user: ObjectId(userId) })
            if (dashboard) {
                this.dashboardModel.updateOne({ user: ObjectId(userId) },
                    {
                        $push: { pets: ObjectId(petId) }
                    }
                ).then((response) => {
                    resolve()
                })
            } else {
                let dashObj = {
                    user: ObjectId(userId),
                    pets: [ObjectId(petId)]
                }
                var dashboardCollection = new this.dashboardModel(dashObj)
                dashboardCollection.save().then((response) => {
                    resolve()
                })
            }
        })
    },
    getDashboard: (userId) => {
        return new Promise(async (resolve, reject) => {
            let dashboard = await this.dashboardModel.findOne({ user: ObjectId(userId) })
            let details = await this.dashboardModel.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },                
                {
                    $lookup: {
                        from: 'pets',
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'dashboard'
                    }
                }
            ])
            //console.log(details);
            if (dashboard) {
                resolve(details[0].dashboard)
            } else {
                resolve({ status: true })
            }
        })
    }

}