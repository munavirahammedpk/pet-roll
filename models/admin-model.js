const { response } = require('express')
const collections = require('../config/collections')
const mongoose = require('mongoose')
const schemas = require('../schemas')


const bcrypt = require('bcryptjs')
const ObjectId = mongoose.Types.ObjectId

module.exports.adminModel = new mongoose.model(collections.ADMIN_COLLECTION, schemas.adminSchema)
const userModel = mongoose.model(collections.USER_COLLECTION, schemas.userSchema)
const bannedModel= mongoose.model(collections.BANNED_COLLECTION,schemas.bannedSchema)
const dashboardModel = mongoose.model(collections.DASHBOARD_COLLECTION, schemas.dashboardSchema)
const petModel = mongoose.model(collections.PET_COLLECTION, schemas.petSchema)

module.exports={
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await userModel.find({}).lean()
            //console.log(users);
            resolve(users)
        })
    },
    deleteUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await userModel.findOne({_id:userId}).then(async(response)=>{
                let bannedId=response.email
                var bannedCollection=new bannedModel({bannedId})
                await bannedCollection.save().then(async()=>{
                    await userModel.deleteOne({_id:userId}).then(()=>{
                        resolve()
                    })
                })
            })
            
        })
    },
    getPets: (userId) => {
        return new Promise(async (resolve, reject) => {
            let dashboard = await dashboardModel.findOne({ user: ObjectId(userId) })
            let pets = await dashboardModel.aggregate([
                {
                    $match: { user:ObjectId (userId) }
                },
                {
                    $lookup: {
                        from: 'pets',
                        localField: 'pets',
                        foreignField: '_id',
                        as: 'pet'
                    }
                }

            ])
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
            await petModel.deleteOne({ _id:ObjectId(petId)}).then((response) => {
                //console.log(response);
                resolve()

            })
        })
    },
    doSignUp: (adminData) => {
        //console.log(adminData);

        return new Promise(async (resolve, reject) => {

            adminData.password = await bcrypt.hash(adminData.password, 10)

             var adminCollection=new this.adminModel(adminData)
             await adminCollection.save().then(async (data) => {
                let admin = await this.adminModel.findOne({  _id: ObjectId(data._id) })
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
            let admin = await this.adminModel.findOne({ email: adminData.email })
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
    }
}