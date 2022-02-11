var db = require('../config/connection')
var collection = require('../config/collections')
const objectId = require('mongodb').ObjectId
const { response } = require('express')
const bcrypt = require('bcrypt')

module.exports = {
    getUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
            resolve(users)
        })

    },
    deleteUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then(async(response)=>{
                let bannedId=response.email
                await db.get().collection(collection.BANNED_COLLECTION).insertOne({bannedId})
            })
            await db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) }).then(() => {               
                resolve()
            })
        })

    },
    getPets: (userId) => {
        return new Promise(async (resolve, reject) => {
            let dashboard = await db.get().collection(collection.DASHBOARD_COLLECTION).findOne({ user: objectId(userId) })
            let pets = await db.get().collection(collection.DASHBOARD_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $lookup: {
                        from: collection.PET_COLLECTION,
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'pet'
                    }
                }

            ]).toArray()
            if (dashboard) {
                resolve(pets[0].pet)
            } else {
                resolve({ status: true })
            }
            //console.log(pets[0].pet);

        })
    },
    deletePet: (petId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PET_COLLECTION).deleteOne({ _id: objectId(petId) }).then((response) => {
                //console.log(response);
                resolve()

            })
        })
    },
    doSignUp: (adminData) => {
        //console.log(adminData);

        return new Promise(async (resolve, reject) => {

            adminData.password = await bcrypt.hash(adminData.password, 10)

            await db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then(async (data) => {
                let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: objectId(data.insertedId) })
                //console.log(admin);
                if (admin) {
                    response.admin = admin
                    response.status = true
                }

                resolve(response)
            })
        })
    },
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            // let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            //console.log(user);
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    // console.log(status);
                    if (status) {

                        response.admin = admin,
                            response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })

            } else {
                resolve({ status: false })
            }
        })
    },
    deletePets: (userId) => {
        
    }
}