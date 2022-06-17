const APP_ID = 'f0c8d127f8434b5ba355114d9e3a2f6f'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let RTM_TOKEN = sessionStorage.getItem('rtmToken')
// let UID = Number(sessionStorage.getItem('UID'))
let UID = sessionStorage.getItem('UID')
let client;
let rtmClient;
let rtmChannel;
// let uid = UID.toString()

// const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

// let UID = sessionStorage.getItem('UID')
// if (!UID) {
//     UID = String(Math.floor(Math.random() * 10000))
//     sessionStorage.setItem('UID', UID)
// }

// let token = null;
// let client;

//room.html?room=234
// const queryString = window.location.search
// const urlParams = new URLSearchParams(queryString)
// let CHANNEL = urlParams.get('room')

// if (!CHANNEL) {
//     CHANNEL = 'main'
// }

let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false

let rtmInit = async() => {
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    // let uid = UID.toString()
    console.log(typeof(UID))
    await rtmClient.login({UID, RTM_TOKEN})

    rtmChannel = await rtmClient.createChannel(CHANNEL)
    await rtmChannel.join()

    rtmChannel.on('MemberJoined', handleMemberJoined)
}

let joinRoomInit = async () => {
    // let rtmUID = UID.toString()

    // rtmClient = await AgoraRTM.createInstance(APP_ID)
    // await rtmClient.login({UID, TOKEN})

    // rtmChannel = await rtmClient.createChannel(CHANNEL)
    // await rtmChannel.join()

    // rtmChannel.on('MemberJoined', handleMemberJoined)

    rtmInit()

    client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, CHANNEL, TOKEN, UID)
    
    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)

    // try{
    //     await client.join(APP_ID, CHANNEL, TOKEN, UID)
    // }catch(error){
    //     console.log(error)
    //     window.open('/', '_self')
    // }

    // client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })  
    // await client.join(APP_ID, CHANNEL, TOKEN, UID)

    // client.on('user-published', handleUserPublished)
    // client.on('user-left', handleUserLeft)
    

    joinStream()
}

let joinStream = async () => {

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    
    // localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig:{
    //     width:{min:640, ideal:1920, max:1920},
    //     height:{min:480, ideal:1080, max:1080}
    // }})

    let player = `<div class="video__container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">Name</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${UID}`).addEventListener('click', expandVideoFrame)
     
    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])

}

let switchToCamera = async () => {
    let player = `<div class="video__container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">Name</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`
    displayFrame.insertAdjacentHTML('beforeend', player)

    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('screen-btn').classList.remove('active')

    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[1]])

}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.UID] = user

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.UID}`)
    if(player === null) {
        player = `<div class="video__container" id="user-container-${user.UID}">
                    <div class="username-wrapper"><span class="user-name">Name</span></div>
                    <div class="video-player" id="user-${user.UID}"></div>
                </div>`

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.UID}`).addEventListener('click', expandVideoFrame)
    }

    if(displayFrame.style.display){
        let videoFrame = document.getElementById(`user-container-${user.UID}`)
        videoFrame.style.height = '200px'
        videoFrame.style.width = '200px'
    }

    if (mediaType === 'video'){
        user.videoTrack.play(`user-${user.UID}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play(`user-${user.UID}`)
    }

}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.UID]
    document.getElementById(`user-container-${user.UID}`).remove()

    if(userIdInDisplayFrame === `user-container-${user.UID}`){
        displayFrame.style.display = null

        let videoFrames = document.getElementsByClassName('video__container')
        
        for(let i = 0; videoFrames.length > i; i++){
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
}

let toggleMic = async (e) => {
    let button = e.currentTarget

    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleCamera = async (e) => {
    let button = e.currentTarget

    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async(e) => {
    let screenButton = e.currentTarget
    let cameraButton = document.getElementById('camera-btn')

    if(!sharingScreen){
        sharingScreen = true

        screenButton.classList.add('active')
        cameraButton.classList.remove('active')
        cameraButton.style.display = 'none'

        localScreenTracks = await AgoraRTC.createScreenVideoTrack(
            // {encoderConfig: "1080_1",
            // optimizationMode: "detail",}
            )

        document.getElementById(`user-container-${UID}`).remove()
        displayFrame.style.display = 'block'

        let player = `<div class="video__container" id="user-container-${UID}">
                        <div class="username-wrapper"><span class="user-name">Name</span></div>
                        <div class="video-player" id="user-${UID}"></div>
                    </div>`

        displayFrame.insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${UID}`).addEventListener('click', expandVideoFrame)

        userIdInDisplayFrame = `user-container-${UID}`
        localScreenTracks.play(`user-${UID}`)

        await client.unpublish([localTracks[1]])
        await client.publish([localScreenTracks])

        let videoFrames = document.getElementsByClassName('video__container')
        for(let i = 0; videoFrames.length > i; i++){
            if(videoFrames[i].id != userIdInDisplayFrame){
              videoFrames[i].style.height = '200px'
              videoFrames[i].style.width = '200px'
            }  
        }

    }else{
        sharingScreen = false
        // screenButton.classList.remove('active')
        cameraButton.style.display = 'block'
        document.getElementById(`user-container-${UID}`).remove()
        await client.unpublish([localScreenTracks])

        switchToCamera()
    }
}

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)

joinRoomInit()