const users=[]
const addUser=({id,username,room,mySymbol})=>{
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()
    mySymbol=mySymbol.trim().toLowerCase()
    if(!username || !room || !mySymbol){
        return{
            error:'User , room , mySymbol are required !'
        }
    }

    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })

    const existingSymbol=users.find((user)=>{
        return user.mySymbol===mySymbol && user.room===room
    })

    if(existingUser){
        return{
            error:'Username is in use !'
        }
    }

    if(existingSymbol){
        return{
            error:'Choose another symbol !'
        }
    }

    const user={id,username,room,mySymbol}
    users.push(user)
    return{user}
}

const removeUser=(id)=>{
    const index=users.findIndex(user=>user.id===id)
    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

const getUser=(id)=>{
    return users.find(user=>user.id===id)
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={addUser,getUser,getUsersInRoom,removeUser}