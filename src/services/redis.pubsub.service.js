'use strict'

const Redis = require('redis')
 
class RedisPubSubService {
    constructor() {
        this.pubServer = Redis.createClient()
        this.subServer = Redis.createClient()

        this.pubServer.connect().catch(err => console.error('Error connecting pubServer:', err));
        this.subServer.connect().catch(err => console.error('Error connecting subServer:', err));
    }

    publishing = (channel, message) => {
        return new Promise((resolve, reject) => {
            this.pubServer.publish(channel, message, (err, reply) => {
                if(err) {
                    reject(err)
                }
                else {
                    console.log(reply)
                    resolve(reply)
                }
            })
        })
    }

    subscribing = (channel, callback) => {
        this.subServer.subscribe(channel, (message, subChannel) => {
            if (channel === subChannel){
                callback(channel, message);
            }
        });
        // this.subServer.on('message', (subChannel, message) => {
        //     console.log(`sub server listen: subChannel(${subChannel}) and message(${message})`);
        //     if (channel === subChannel && typeof callback === 'function') {
        //         callback(channel, message);
        //     } else {
        //         console.error("Callback is not a function");
        //     }
        // });
    }
    
}


module.exports = new RedisPubSubService()