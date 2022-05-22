const { response } = require('express')
const collections = require('../config/collections')
const mongoose = require('mongoose')
const schemas = require('../schemas')
const petModel = require('./pet-model')
const userModel = require('./userModel/buyer-model')
const bannedModel=require('./banned-model')
const dashboardModel=require('./dash-model')
const bcrypt = require('bcrypt')
const ObjectId = mongoose.Types.ObjectId

module.exports.adminModel = new mongoose.model(collections.ADMIN_COLLECTION, schemas.adminSchema)

module.exports={
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await userModel.find({}).toArray()
            resolve(users)
        })
    },
    deleteUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await userModel.findOne({_id:userId}).then(async(response)=>{
                let bannedId=response.email
                await bannedModel.insertOne({bannedId})
            })
            await userModel.deleteOne({_id:userId}).then(()=>{
                resolve()
            })
        })
    },
    getPets: (userId) => {
        return new Promise(async (resolve, reject) => {
            let dashboard = await dashboardModel.findOne({ user: ObjectId(userId) })
            let pets = await dashboardModel.aggregate([
                {
                    $match: { user:userId }
                },
                {
                    $lookup: {
                        from: collections.PET_COLLECTION,
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
            await petModel.deleteOne({ _id: petId}).then((response) => {
                //console.log(response);
                resolve()

            })
        })
    },
    doSignUp: (adminData) => {
        //console.log(adminData);

        return new Promise(async (resolve, reject) => {

            adminData.password = await bcrypt.hash(adminData.password, 10)

            await this.adminModel.insertOne(adminData).then(async (data) => {
                let admin = await this.adminModel.findOne({ _id: ObjectId(data.insertedId) })
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
    },
    deletePets: (userId) => {
        
    }
}