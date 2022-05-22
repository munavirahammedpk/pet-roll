const collections = require('../config/collections')
const schemas = require('../schemas')
const mongoose = require('mongoose')
const { response } = require('express')
const ObjectId = mongoose.Types.ObjectId



module.exports.petModel = new mongoose.model(collections.PET_COLLECTION, schemas.petSchema)

module.exports = {
     
    addPets: (petDetails, userId) => {
        //console.log(userId);
        return new Promise(async (resolve, reject) => {
            var petCollection = new this.petModel(petDetails)
            petCollection.save()
            //  await db.get().collection(collection.PET_COLLECTION).insertOne(petDetails).then((data) => {
            //     resolve(data.insertedId)
            // })
        })
    },
    getAllPets: () => {
        return new Promise(async(resolve, reject) => {
            let AllPets = await this.petModel.find({}).sort({ _id: -1 }).toArray()
            resolve(AllPets)
        })
    },
    getPetDetails: (petId) => {
        return new Promise(async (resolve, reject) => {
            await this.petModel.findOne({ _id: petId }).then((pet) => {
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
    deletePet:(petId)=>{
        return new Promise(async(resolve,reject)=>{
            await this.petModel.deleteOne({_id:ObjectId(petId)}).then((response)=>{
                //console.log(response);
                resolve()
    
            })
        })
        
    },
    searchPet:(payload) => {
        //console.log(payload);
        return new Promise(async (resolve, reject) => {
            //var regex = new RegExp(payload, 'i')
            //console.log(regex);
            let searchPet = await this.petModel.find({$or:[{name:{$regex:new RegExp('^'+payload+'.*','i')}},{category:{$regex:new RegExp('^'+payload+'.*','i')}},{description:{$regex:new RegExp('^'+payload+'.*','i')}}]}).toArray()
            //searchPet=searchPet.slice(0,10)// for set limt

            //console.log(searchPet);
            resolve(searchPet)
        })
    },
    searched:(key)=>{
        return new Promise(async(resolve,reject)=>{
            let searchPet = await this.petModel.find({$or:[{name:{$regex:new RegExp('^'+key+'.*','i')}},{category:{$regex:new RegExp('^'+key+'.*','i')}},{description:{$regex:new RegExp('^'+key+'.*','i')}}]}).toArray()
            resolve(searchPet)
        })

    }
}