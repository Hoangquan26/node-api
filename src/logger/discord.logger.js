'use strict'

const { Client, GatewayIntentBits } = require('discord.js')
const { BadRequestError } = require('../core/error.response')
const botToken = process.env.DISCORD_BOT_TOKEN
const channelId = process.env.DISCORD_CHANNEL_ID
class DiscordLogger {
    constructor(CHANNELID) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        })
        this.channelId = CHANNELID
        this.client.on('ready', () => {
            console.log(`Discord bot: ${this.client.user.tag}`)
        })
        this.client.login(botToken)
    }

    sendMessage = (message) => {
        const channel = this.client.channels.cache.get(this.channelId)
        if(!channel) {
            console.error('Not found channel')
            return
        }
        channel.send(message)
    }

    logCode = ({message = 'Trống', code = 'Trống', title = "Thông báo gửi từ ứng dụng Truy Xuất Nguồn Gốc"}) => {
        const body = JSON.stringify(code, null, 2)
        const logMesssage = {
            content: message,
            embeds: [
                {
                    color: parseInt('00ff00', 16), //convert hexadecimal color code to integer
                    title, 
                    description: '``json: \n' + body + '``'
                }
            ]
        }
        this.sendMessage(logMesssage)
    }
}

const discordLogger = new DiscordLogger(channelId) 

module.exports = discordLogger