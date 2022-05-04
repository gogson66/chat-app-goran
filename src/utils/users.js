const users = []

const addUser = ({id, username, room}) => {

    // Clearing data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Checking is there room or user
    if (!username || !room) return {error: 'You must provide username and room!'}

    //Checking existing user
    const existingUser = users.find(user => user.room === room && user.username === username)
    if (existingUser) return {error: 'Username already taken!'}

    //Adding user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)    
    if (index !== -1) return users.splice(index, 1)[0]
}


const getUser = (id) => users.find(user => user.id === id)
const getUsersInRoom = (room) => users.filter(user => user.room === room)


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}