'use strict'

const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3001
    },
    db: {

    }
}

const pro = {
    app: {
        port: process.env.PRO_APP_PORT || 3002
    },
    dev: {

    }
}

const config = {dev, pro}

const env = process.env.NODE_ENV || "dev"

module.exports = config[env]
