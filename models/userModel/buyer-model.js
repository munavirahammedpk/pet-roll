const collections = require('../../config/collections')
const schemas = require('../../schemas')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcrypt')
const petModel = mongoose.model(collections.PET_COLLECTION, schemas.petSchema)
const bannedModel= mongoose.model(collections.BANNED_COLLECTION,schemas.bannedSchema)

module.exports.userModel = new mongoose.model(collections.USER_COLLECTION, schemas.userSchema)
module.exports.favouriteModel = new mongoose.model(collections.FAVOURITE_COLLECTION, schemas.favouriteSchema)


module.exports = {
    doSignUp: (userData) => {
        //console.log(userData);
        return new Promise(async (resolve, reject) => {
            var user = await this.userModel.findOne({ email: userData.email })
            if (user) {
                var response = {
                    status: false
                }
                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                //console.log(userData.password);
                var userCollection = new this.userModel(userData)//.then(async (data) => {
                await userCollection.save().then(async (data) => {
                    //console.log(data._id);
                    let user = await this.userModel.findOne({ _id: ObjectId(data._id) })
                    //console.log(user);
                    if (user) {
                        response = {
                            user: user,
                            status: true
                        }
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
                        resolve({ passwordErr: true })
                    }
                })
            } else {
                resolve({ userIdErr: true })
            }

        })
    },
    getDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            let details = await petModel.find({ _id: ObjectId(id) }).lean().exec((err, details) => {
                if (err) {
                    console.log(err);
                } else {
                    resolve(details)
                }
            })
            //console.log(details);

        })
    },
    addToFavourite: (petId, userId) => {
        return new Promise(async (resolve, reject) => {
            let favourite = await this.favouriteModel.findOne({ user:ObjectId (userId) })
            //console.log(favourate.user);
            if (favourite) {

                this.favouriteModel.updateOne({ user:ObjectId (userId) },
                    {
                        $push: { pets:ObjectId (petId) }
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
                var dashboardCollection = new this.favouriteModel(favObj)
                dashboardCollection.save().then((response) => {
                    response.status = true
                    resolve(response)
                })
            }
        })
    },
    getFavourite: (userId) => {
        return new Promise(async (resolve, reject) => {
            let favourite = await this.favouriteModel.findOne({ user: ObjectId(userId) })
            let details = await this.favouriteModel.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $lookup: {
                        from: 'pets',
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'favourite'
                    }
                }

            ])
            //console.log(details);
            if (favourite) {
                //console.log(details[0].favourite);
                resolve(details[0].favourite)
            } else {
                resolve({ status: true })
            }
        })
    },
    deleteFav: (petId, userId) => {
        //console.log(petId);
        return new Promise(async (resolve, reject) => {
            await this.favouriteModel
                .updateOne({ user: ObjectId(userId) },
                    {
                        $pull: { pets:ObjectId (petId) }
                    }
                ).then((response) => {
                    response.status = true
                    resolve(response)
                })
        })
    },
    getFavouriteId: (userId) => {
        return new Promise(async (resolve, reject) => {
            let ids = await this.favouriteModel.findOne({ user: ObjectId(userId) })
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
            let details = await petModel.find({ userid: ownerId }).lean().exec((err, details) => {
                if (err) {
                    console.log(err);
                } else {
                    resolve(details)
                }
            })
        })
    },
    emailExist: (userEmail) => {
        //console.log(userEmail);
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