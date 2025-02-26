const ampqlib = require('amqplib')

const sendMessage = async() => {
    const connection = await ampqlib.connect('amqp://guest:guest@localhost')
    const channel = await connection.createChannel()

    const queue_name = "test"
    await channel.assertQueue(queue_name, {
        durable: true
    })
    channel.sendToQueue(queue_name, Buffer.from('test message'))
}

sendMessage().catch(console.error)