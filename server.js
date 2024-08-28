const app = require('./src/app')
const config = require('./src/configs/config')


const PORT = config.app.port
const server = app.listen( PORT, () => {
    console.log(`server is running with ${PORT}`)
}) 

process.on("SIGINT", () => {
    server.close(() => {
        console.log("Exit server Express")
    });
})