const collections = require('../config/collections')
const cloudinary = require('cloudinary').v2;
const schemas = require('../schemas')
const mongoose = require('mongoose')
const { response } = require('express')
const ObjectId = mongoose.Types.ObjectId


module.exports.petModel = new mongoose.model(collections.PET_COLLECTION, schemas.petSchema)

module.exports = {

    addPets: (petDetails) => {
        return new Promise(async (resolve, reject) => {
            var petCollection = new this.petModel(petDetails)
            await petCollection.save().then((data) => {
                resolve(data._id)
            })
        })
    },
    getAllPets: () => {
        return new Promise(async (resolve, reject) => {
            await this.petModel.find({}).sort({ _id: -1 }).lean().exec((err, data) => {
                if (err) {
                    console.log(err);
                } else {


                    resolve(data)
                }
            })
        })
    },
    getPetDetails: (petId) => {
        return new Promise(async (resolve, reject) => {
            await this.petModel.findOne({ _id: petId }).lean().then((pet) => {
                resolve(pet)
            })
        })
    },
    updatePet: (petId, petDetails) => {
        return new Promise(async (resolve, reject) => {
            await this.petModel.updateOne({ _id: petId },
                {
                    $set: {
                        name: petDetails.name,
                        category: petDetails.category,
                        price: petDetails.price,
                        description: petDetails.description,
                        oname: petDetails.oname,
                        mobile: petDetails.mobile,
                        place: petDetails.place,
                        district: petDetails.district
                    }
                }
            ).then((response) => {
                resolve()
            })
        })
    },
    deletePet: (petId) => {
        return new Promise(async (resolve, reject) => {
            await this.petModel.findOne({ _id: petId }).lean().then(async (pet) => {
                await cloudinary.uploader.destroy(pet.pub_id_0, async (err, result) => {
                    await cloudinary.uploader.destroy(pet.pub_id_1, async (err, result) => {
                        await cloudinary.uploader.destroy(pet.pub_id_2, async (err, result) => {
                            await this.petModel.deleteOne({ _id: ObjectId(petId) }).then((response) => {
                                resolve()
                            })
                        });
                    });
                });
            })

        })

    },
    searchPet: (payload) => {
        return new Promise(async (resolve, reject) => {
            let searchPet = await this.petModel.find({ $or: [{ name: { $regex: new RegExp('^' + payload + '.*', 'i') } }, { category: { $regex: new RegExp('^' + payload + '.*', 'i') } }, { description: { $regex: new RegExp('^' + payload + '.*', 'i') } }] }).lean()
            resolve(searchPet)
        })
    },
    searched: (key) => {
        return new Promise(async (resolve, reject) => {
            let searchPet = await this.petModel.find({ $or: [{ name: { $regex: new RegExp('^' + key + '.*', 'i') } }, { category: { $regex: new RegExp('^' + key + '.*', 'i') } }, { description: { $regex: new RegExp('^' + key + '.*', 'i') } }] }).lean()
            resolve(searchPet)
        })

    }
}