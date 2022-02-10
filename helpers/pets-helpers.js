var db = require('../config/connection')
var collection = require('../config/collections')
const { PET_COLLECTION } = require('../config/collections')
const { ObjectId } = require('mongodb')
const { response } = require('express')
module.exports = {
    addPets: (petDetails, userId) => {
        //console.log(userId);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PET_COLLECTION).insertOne(petDetails).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllPets: () => {
        return new Promise(async (resolve, reject) => {
            let AllPets = await db.get().collection(collection.PET_COLLECTION).find({}).sort({_id:-1}).toArray()
            //console.log(AllPets);
            resolve(AllPets)
        })

    },
    getPetDetails: (petId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PET_COLLECTION).findOne({ _id: ObjectId(petId) }).then((pet) => {
                //console.log(pet);
                resolve(pet)
            })
        })
    },
    updatePet: (petId, petDetails) => {
        return new Promise(async(resolve, reject) => {
           // console.log(petDetails);
            await db.get().collection(collection.PET_COLLECTION).updateOne({ _id:ObjectId(petId)},

                {
                    $set: {
                        name: petDetails.name,
                        category:petDetails.category,
                        price:petDetails.price,
                        description:petDetails.description,
                        oname:petDetails.oname,
                        mobile:petDetails.mobile,
                        place:petDetails.place,
                        district:petDetails.district
                    }

                }

            ).then((response)=>{
                resolve()
            })
        })
    },
    deletePet:(petId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PET_COLLECTION).deleteOne({_id:ObjectId(petId)}).then((response)=>{
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
            let searchPet = await db.get().collection(collection.PET_COLLECTION).find({$or:[{name:{$regex:new RegExp('^'+payload+'.*','i')}},{category:{$regex:new RegExp('^'+payload+'.*','i')}},{description:{$regex:new RegExp('^'+payload+'.*','i')}}]}).toArray()
            //searchPet=searchPet.slice(0,10)// for set limt

            //console.log(searchPet);
            resolve(searchPet)
        })
    },
    searched:(key)=>{
        return new Promise(async(resolve,reject)=>{
            let searchPet = await db.get().collection(collection.PET_COLLECTION).find({$or:[{name:{$regex:new RegExp('^'+key+'.*','i')}},{category:{$regex:new RegExp('^'+key+'.*','i')}},{description:{$regex:new RegExp('^'+key+'.*','i')}}]}).toArray()
            resolve(searchPet)
        })

    }

}