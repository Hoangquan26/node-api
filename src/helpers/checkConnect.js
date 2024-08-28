'use strict'
const mongoose = require('mongoose')
const countConnect = () => {
    const numberConnection = mongoose.connections.length
    console.log(`Number of connections: ${numberConnection}`)
}

module.exports = {
    countConnect
}