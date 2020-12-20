require('dotenv').config({path:'./config/dev.env'})
const express=require('express')
const path=require('path')
const socketio=require('socket.io')
const http=require('http')
const app=express()

const {addUser,getUser,getUsersInRoom,removeUser}=require('./utils/users')

const publicPathDirectory=path.join(__dirname,'../public')
const PORT=process.env.PORT

app.use(express.static(publicPathDirectory))

const server=http.createServer(app)
const io=socketio(server)

io.on('connection',(socket)=>{
    console.log('New web socket connection')
    
    socket.on('join',({mySymbol,username,room},callback)=>{
        const users=getUsersInRoom(room)
        const noOfUsers=users.length
        if(noOfUsers==2||noOfUsers>2){
            const error='Number of members filled'
            return callback(error)
        }
        const {user,error}=addUser({id:socket.id,username,room,mySymbol})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.broadcast.to(user.room).emit('message',`${user.username} has entered`)
        callback()
    })

    socket.on('startgame',(msz)=>{
        const user=getUser(socket.id)
        socket.to(user.room).broadcast.emit('startgamemessage',msz)
        socket.broadcast.to(user.room).emit('message',`${user.username} started game`)
    })

    socket.on('handleclick',(data)=>{
        const user=getUser(socket.id)
        socket.to(user.room).broadcast.emit('handleclickmessage',data)
    })

    socket.on('restartgame',(msz)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('restartgamemessage',msz)
    })
    
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        // if(user){
            io.to(user.room).emit('message',`${user.username} has left`)
        // }
    })
})

server.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)})