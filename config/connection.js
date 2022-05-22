// const mongoClient=require('mongodb').MongoClient
// const state={
//     db:null
// }

// module.exports.connect=function(done){
//     const url='mongodb://localhost:27017'
//     const dbname='petsway'

//     mongoClient.connect(url,(err,data)=>{
//         if(err) return done(err)
//         state.db=data.db(dbname)
//         done()

//     })
// }
// module.exports.get=function(){
//     return state.db
// }

const mongoose = require('mongoose')

module.exports.connect = () => {
    mongoose.connect("mongodb+srv://mnvr:mnvr@samplecluster.n0zzr.mongodb.net/petroll?retryWrites=true&w=majority")
        .then(() => {
            console.log('Database connection successful');
        }).catch(() => {
            console.log('Database connection error');
        })
}
