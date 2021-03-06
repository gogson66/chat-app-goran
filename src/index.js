const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages.js')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000

const publicPathDirectory = path.join(__dirname, '../public')

app.use(express.static(publicPathDirectory))


io.on('connection', (socket) => {
    console.log('Found new connection');


    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})
        if (error) return callback(error)
        
        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!', 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} entered the chat`, 'Admin'))   

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) return callback('We do not use profanities here!')

        io.to(user.room).emit('message', generateMessage(message, user.username))

        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {

            io.to(user.room).emit('message', generateMessage(`${user.username} leaved room!`, 'Admin'))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
    
        } 
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`, user.username))
        callback()
    })

})

server.listen(port, () => {
    console.log('server started');
    
})