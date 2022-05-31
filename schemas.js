const mongoose=require('mongoose')

module.exports={
    petSchema: new mongoose.Schema({
        name:String,
        category:String,
        price:Number,
        description:String,
        oname:String,
        mobile:String,
        place:String,
        district:String,
        userid:String

    }),
    userSchema: new mongoose.Schema({
        name:String,
        email:String,
        password:String
    }),
    dashboardSchema: new mongoose.Schema({
        user:mongoose.Types.ObjectId,
        pets:Array
    }),
    favouriteSchema: new mongoose.Schema({
        user:mongoose.Types.ObjectId,
        pets:Array
    }),
    adminSchema: new mongoose.Schema({
        name:String,
        email:String,
        password:String
    }),
    bannedSchema: new mongoose.Schema({
        bannedId:String
    })
}