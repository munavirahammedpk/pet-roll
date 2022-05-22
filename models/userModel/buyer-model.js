const collections = require('../../config/collections')
const schemas = require('../../schemas')
const mongoose = require('mongoose')
const { petModel } = require('../pet-model')
const { favouriteModel } = require('../fav-model')
const { bannedModel } = require('../banned-model')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcrypt')

module.exports.userModel = new mongoose.model(collections.USER_COLLECTION, schemas.userSchema)


module.exports = {
    doSignUp: (userData) => {
        //console.log(userData);
        return new Promise(async (resolve, reject) => {
            var user = await this.userModel.findOne({ email: userData.email })
            if (user) {
                response.status = false
                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                //console.log(userData.password);
                var petCollection = new userModel(userData)//.then(async (data) => {
                await petCollection.save().then(() => {
                    let user = this.userModel.findOne({ _id: ObjectId(data.insertedId) })
                    if (user) {
                        response.user = user
                        response.status = true
                    }

                    resolve(response)
                })
                //})
            }

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await this.userModel.findOne({ email: userData.email })
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

        })
    },
    getDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            let details = await petModel.find({ _id: id }).toArray()
            //console.log(details);
            resolve(details)
        })

    },
    addToFavourite: (petId, userId) => {
        return new Promise(async (resolve, reject) => {
            let favourite = await favouriteModel.findOne({ user: userId })
            //console.log(favourate.user);
            if (favourite) {

                favouriteModel.updateOne({ user: userId },
                    {
                        $push: { pets: petId }
                    }
                ).then((response) => {
                    response.status = true
                    resolve(response)
                })
            } else {
                let favObj = {
                    user: ObjectId(userId),
                    pets: [ObjectId(petId)]
                }
                favouriteModel.insertOne(favObj).then((response) => {
                    response.status = true
                    resolve(response)
                })
            }

        })
    },
    getFavourite: (userId) => {
        return new Promise(async (resolve, reject) => {
            let favourite = await favouriteModel.findOne({ user: objectId(userId) })
            let details = await favouriteModel.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },


                {
                    $lookup: {
                        from: collections.PET_COLLECTION,
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
            await favouriteModel
                .updateOne({ user: ObjectId(userId) },
                    {
                        $pull: { pets: ObjectId(petId) }
                    }


                ).then((response) => {
                    response.status = true
                    resolve(response)
                })
        })
    },
    getFavouriteId: (userId) => {
        return new Promise(async (resolve, reject) => {
            let ids = await favouriteModel.findOne({ user: ObjectId(userId) })
            //resolve(ids.pets)

        })
    },
    getOwnerId: (petId) => {
        return new Promise(async (resolve, reject) => {
            await petModel.findOne({ _id: ObjectId(petId) }).then((details) => {
                resolve(details.userid)
            })

        })
    },
    getOtherPets: (ownerId) => {
        return new Promise(async (resolve, reject) => {
            let details = await petModel.find({ userid: ownerId }).toArray()
            //console.log(details);
            resolve(details)
        })
    },
    emailExist: (userEmail) => {
        console.log(userEmail);
        return new Promise(async (resolve, reject) => {
            await this.userModel.findOne({ email: userEmail }).then((response) => {
                resolve(response)
                //console.log(response);
            })
        })
    },
    checkIdExist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await this.userModel.findOne({ _id: ObjectId(userId) })
            //console.log(user);
            if (user) {
                resolve(user)
            } else {

            }
        })
    },
    restPassword: (newpass, userId) => {
        //console.log(userId);
        return new Promise(async (resolve, reject) => {
            newpass = await bcrypt.hash(newpass, 10)
            this.userModel
                .updateOne({ _id: ObjectId(userId) },
                    { $set: { password: newpass } }
                ).then(() => {
                    resolve()
                })
        })
    },
    checkBanned: (bannedId) => {
        //console.log(bannedId);
        return new Promise(async (resolve, reject) => {
            await bannedModel.findOne({ bannedId: bannedId }).then((response) => {
                if (response) {
                    resolve({ banned: true })
                } else {
                    resolve({ banned: false })
                }
            })
        })
    }
}