const socket = io()

//Elements
const $messageForm = document.querySelector('.chat-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#share-location')
const $message = document.querySelector('#message')


//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $urlTemplate = document.querySelector('#url-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const [username, room] = location.search.slice(1).split('&').map(item => item.split('=')[1])

const autoscrolling = function() {
    const $newMessage = $message.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $message.offsetHeight
    const containerHeight = $message.scrollHeight
    const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
        
    
}

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        message: message.text, 
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html) 
    autoscrolling()   
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render($urlTemplate, {
        url: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscrolling()
    
} )

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {room, users })
    document.querySelector('.chat__sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()
    $messageFormButton.disabled = true
    const message = $messageFormInput.value

    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.disabled = false
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) return console.log(error);

        console.log('Message delivered');
        
        
    })
    
    
} )

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Your browser does not support location sharing!')
    $locationButton.disabled = true

    navigator.geolocation.getCurrentPosition((position) => {

        const {latitude, longitude} = position.coords
        socket.emit('sendLocation', {latitude, longitude}, () => {
            $locationButton.disabled = false
            console.log('Location shared');
            
        })
        
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})