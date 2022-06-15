// let form = document.getElementById('lobby__form')

// let handleSubmit = async (e) => {
//     e.preventDefault()
//     let room = e.target.room.value
//     let response = await fetch(`/get_token/?channel=${room}`)
//     let data = await response.json()

//     let UID = data.UID
//     let token = data.token

//     sessionStorage.setItem('UID', UID)
//     sessionStorage.setItem('token', token)
//     sessionStorage.setItem('room', room)

//     window.open('/room/', '_self')
    
// }

// form.addEventListener('submit', handleSubmit)

// form.addEventListener('submit', (e) => {
//     e.preventDefault()

//     let inviteCode = e.target.room.value
//     if(!inviteCode){
//         inviteCode = String(Math.floor(Math.random() * 10000))
//     }

//     window.location = `room.html?room=${inviteCode}`

// })