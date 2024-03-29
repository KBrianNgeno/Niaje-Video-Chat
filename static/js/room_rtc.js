const APP_ID = 'f0c8d127f8434b5ba355114d9e3a2f6f'
const CHANNEL = sessionStorage.getItem('room')
const channelId = String(sessionStorage.getItem('room'))
const TOKEN = sessionStorage.getItem('token')
let token = sessionStorage.getItem('rtmToken')
// let uid = sessionStorage.getItem('uid')
let uid = String(sessionStorage.getItem('uid'))
let client;
let rtmClient;
let rtmChannel;

let displayName = sessionStorage.getItem('name')

let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false

let joinRoomInit = async () => {

    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid, token})

    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})
    // try{
    //      await rtmClient.login({uid, token})
    // }catch(error){
    //     console.log(error)
    //     window.open('/', '_self')
    // }

    rtmChannel = await rtmClient.createChannel(channelId)
    await rtmChannel.join()

    rtmChannel.on('MemberJoined', handleMemberJoined)
    rtmChannel.on('MemberLeft', handleMemberLeft)
    rtmChannel.on('ChannelMessage', handleChannelMessage)

    getMembers()
    addBotMessageToDom(`${displayName} has joined the room! 👋🏿`)

    client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, CHANNEL, TOKEN, uid)
    
    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)

    // try{
    //     await client.join(APP_ID, CHANNEL, TOKEN, uid)
    // }catch(error){
    //     console.log(error)
    //     window.open('/', '_self')
    // }

    // client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })  
    // await client.join(APP_ID, CHANNEL, TOKEN, uid)

    // client.on('user-published', handleUserPublished)
    // client.on('user-left', handleUserLeft)
    

    joinStream()
}

let joinStream = async () => {

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
        {}, {videoConfig:{
            width:{min:600, ideal:640, max:700},
            height:{min:400, ideal:480, max:500}
        }}, {audioConfig:{
            AudioEncoderConfigurationPreset: "speech_low_quality"
        }}
        )
    
    let member = await createMember()

    // localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig:{
    //     width:{min:640, ideal:1920, max:1920},
    //     height:{min:480, ideal:1080, max:1080}
    // }})

    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    <div class="video-player" id="user-${uid}"></div>
                </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)
     
    localTracks[1].play(`user-${uid}`)

    await client.publish([localTracks[0], localTracks[1]])

}

let switchToCamera = async () => {
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="username-wrapper"><span class="user-name">${displayName}</span></div>
                    <div class="video-player" id="user-${uid}"></div>
                </div>`
    displayFrame.insertAdjacentHTML('beforeend', player)

    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('screen-btn').classList.remove('active')

    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[1]])

}

let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    let member = await getMember(user)

    let player = document.getElementById(`user-container-${user.uid}`)
    if(player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    <div class="video-player" id="user-${user.uid}"></div>
                </div>`

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)
    }

    if(displayFrame.style.display){
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '200px'
        videoFrame.style.width = '200px'
    }

    if (mediaType === 'video'){
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play(`user-${user.uid}`)
    }

}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()

    if(userIdInDisplayFrame === `user-container-${user.uid}`){
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

        document.getElementById(`user-container-${uid}`).remove()
        displayFrame.style.display = 'block'

        let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="username-wrapper"><span class="user-name">${displayName}</span></div>
                        <div class="video-player" id="user-${uid}"></div>
                    </div>`

        displayFrame.insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

        userIdInDisplayFrame = `user-container-${uid}`
        localScreenTracks.play(`user-${uid}`)

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
        document.getElementById(`user-container-${uid}`).remove()
        await client.unpublish([localScreenTracks])

        switchToCamera()
    }
}

let leaveStream = async (e) => {
    e.preventDefault()

    for(let i = 0; localTracks.LENGTH > i; I++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.unpublish([localTracks[0], localTracks[1]])

    if(localScreenTracks){
        await client.unpublish([localScreenTracks])
    }

    document.getElementById(`user-container-${uid}`).remove()

    if(userIdInDisplayFrame === `user-container-${uid}`){
        displayFrame.style.display = null

        for(let i = 0; videoFrames.length > i; i++){
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }

    handleUserLeft()
    deleteMember()

    window.open('/', '_self')

}

let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({'name': displayName, 'room_name': CHANNEL, 'uid': uid})
    })

    let member = await response.json()
    return member
}

let getMember = async (user) => {
    let response = await fetch(`/get_member/?uid=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({'name': displayName, 'room_name': CHANNEL, 'uid': uid})
    })

    let member = await response.json()
}

window.addEventListener('beforeunload', deleteMember)

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)
document.getElementById('leave-btn').addEventListener('click', leaveStream)

joinRoomInit()