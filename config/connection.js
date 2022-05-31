const mongoose = require('mongoose')

module.exports.connect = () => {
    mongoose.connect("mongodb+srv://mnvr:mnvr@samplecluster.n0zzr.mongodb.net/petroll?retryWrites=true&w=majority")
        .then(() => {
            console.log('Database connection successful');
        }).catch(() => {
            console.log('Database connection error');
        })
}
