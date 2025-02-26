const amqplib = require('amqplib')

const consumerMessage = async() => {
    const connection = await amqplib.connect('amqp://guest:guest@localhost')
    const channel = await connection.createChannel()

    const queue_name = 'test'
    await channel.assertQueue(queue_name, {
        durable: true
    })

    channel.consume(queue_name, (message) => {
        console.log(message.content.toString())
    }, {
        noAck: true
    })
}

consumerMessage().catch(console.error)