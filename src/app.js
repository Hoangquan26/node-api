require('dotenv').config()

const express = require('express')

//morgan => trả về trạng thái request
const morgan = require('morgan')
//helmet => bảo vệ thông tin server (X-Powered-By: Type Language Backend), ngăn chặn các trang thứ 3 truy cập vào thông tin server
const helmet = require('helmet')
//compression => nén dữ liệu trước khi chuyển dữ liệu tới phía client để tiết kiệm băng thông 
const compression = require('compression')
//express => khởi tạo server express.js
const app = express()

// **init middlewares
/*
morgan("dev"): trạng thái được tô màu, sử dụng cho mục đích phát triển 
morgan("combined"): tiêu chuẩn apache (full: user agent, ip, time, ..)
morgan("common")
morgan("short")
morgan("tiny")
*/
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(express.json())
// **init db
const instanceMongoDb = require('./dbs/init.mongodb')

// **init routers
app.use('', require('./routers/index'))


// **handling error
app.use((req, res, next) => {
    const statusCode = 404
    const error = new Error('Not Found')
    error.status = statusCode
    return next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
        stack: error.stack
    })
})

module.exports = app