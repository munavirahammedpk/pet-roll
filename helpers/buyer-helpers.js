var db = require('../config/connection')
var collection = require('../config/collections')
const objectId = require('mongodb').ObjectId
const { response } = require('express')
const bcrypt = require('bcrypt')
//const { reject, promise } = require('bcrypt/promises')
//const { Promise } = require('mongodb')

module.exports = {
    doSignUp: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                response.status = false
                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                await db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(async (data) => {
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(data.insertedId) })
                    if (user) {
                        response.user = user
                        response.status = true
                    }

                    resolve(response)
                })
            }

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            if (await db.get().collection(collection.BANNED_COLLECTION).findOne({ bannedId: userData.email })) {
                console.log('banned');
                resolve({ banned: true })
            } else {
               let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                //console.log(user);
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        // console.log(status);
                        if (status) {

                            response.user = user,
                                response.status = true
                            resolve(response)
                        } else {
                            resolve({ status: false })
                        }
                    })
                } else {
                    resolve({ status: false })
                }
            }
        })
    },
    getDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            let details = await db.get().collection(collection.PET_COLLECTION).find({ _id: objectId(id) }).toArray()
            //console.log(details);
            resolve(details)
        })

    },
    addToFavourite: (petId, userId) => {
        return new Promise(async (resolve, reject) => {
            let favourite = await db.get().collection(collection.FAVOURITE_COLLECTION).findOne({ user: objectId(userId) })
            //console.log(favourate.user);
            if (favourite) {
                db.get().collection(collection.FAVOURITE_COLLECTION)
                    .updateOne({ user: objectId(userId) },
                        {
                            $push: { pets: objectId(petId) }
                        }
                    ).then((response) => {
                        response.status = true
                        resolve(response)
                    })
            } else {
                let favObj = {
                    user: objectId(userId),
                    pets: [objectId(petId)]
                }
                db.get().collection(collection.FAVOURITE_COLLECTION).insertOne(favObj).then((response) => {
                    response.status = true
                    resolve(response)
                })
            }
            /*let pets = await db.get().collection(collection.PET_COLLECTION).findOne({ _id: objectId(petId) })
            await db.get().collection(collection.PET_COLLECTION).updateOne({ _id: objectId(petId) },

                {
                    $set: {
                        name: pets.name,
                        category: pets.category,
                        price: pets.price,
                        description: pets.description,
                        oname: pets.oname,
                        mobile: pets.mobile,
                        place: pets.place,
                        district: pets.district,
                        favourate: true
                    }

                }

            ).then((response) => {
                response.status = true
                resolve(response)
            })*/
        })
    },
    getFavourite: (userId) => {
        return new Promise(async (resolve, reject) => {
            let favourite = await db.get().collection(collection.FAVOURITE_COLLECTION).findOne({ user: objectId(userId) })
            let details = await db.get().collection(collection.FAVOURITE_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },


                {
                    $lookup: {
                        from: collection.PET_COLLECTION,
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'favourite'
                    }
                }

            ]).toArray()
            if (favourite) {
                resolve(details[0].favourite)
            } else {
                resolve({ status: true })
            }
        })
    },
    deleteFav: (petId, userId) => {
        //console.log(petId);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.FAVOURITE_COLLECTION)
                .updateOne({ user: objectId(userId) },
                    {
                        $pull: { pets: objectId(petId) }
                    }


                ).then((response) => {
                    response.status = true
                    resolve(response)
                })
        })
    },
    getFavouriteId: (userId) => {
        return new Promise(async (resolve, reject) => {
            let ids = await db.get().collection(collection.FAVOURITE_COLLECTION).findOne({ user: objectId(userId) })
            //resolve(ids.pets)

        })
    },
    getOwnerId: (petId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PET_COLLECTION).findOne({ _id: objectId(petId) }).then((details) => {
                resolve(details.userid)
            })

        })
    },
    getOtherPets: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let details = await db.get().collection(collection.PET_COLLECTION).find({ userid: ownerId }).toArray()
            //console.log(details);
            resolve(details)
        })
    },
    emailExist: (userEmail) => {
        console.log(userEmail);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).findOne({ email: userEmail }).then((response) => {
                resolve(response)
                //console.log(response);
            })
        })
    },
    checkIdExist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            //console.log(user);
            if (user) {
                resolve(user)
            } else {

            }
        })
    },
    restPassword: (newpass, userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            newpass = await bcrypt.hash(newpass, 10)
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) },
                    { $set: { password: newpass } }
                ).then(() => {
                    resolve()
                })
        })
    }
}