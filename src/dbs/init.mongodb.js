'use strict'
const mongoose = require('mongoose')
const { countConnect } = require('../helpers/checkConnect')

class Database {
    constructor() {
        this.connect();
    }

    connectString = "mongodb+srv://hquan26122003:fYavA3Ak6WcoDRYH@cluster0.dctecec.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

    connect = (type = 'mongodb') => {
        if(1 === 1) {
            mongoose.set('debug' , true)
            mongoose.set('debug', {color: true})
        }

        mongoose.connect(this.connectString)
        .then(_ => {
            console.log(`Connected MongoDb By Mongoose`)
            countConnect()
        })
        .catch(err => console.log(`Connect To MongoDb Fail!\nError: ${err} `))
    }

    static getInstances = () => {
        if(!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance
    }
}

const instaceMongoDb = Database.getInstances()
module.exports = instaceMongoDb