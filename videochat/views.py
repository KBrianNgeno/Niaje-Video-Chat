from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
from agora_token_builder import RtmTokenBuilder
import random
import time

def lobby(request):
    return render(request, 'lobby.html')

def room(request):
    return render(request, 'room.html')

def getToken(request):
    appId = '631c8eeec6134d3994e7ac0eb14edf3f'
    appCertificate = 'df3ac7eeb53140f0a521b493ad757d5d'
    channelName = request.GET.get('channel')
    uid = str(random.randint(1, 255))
    # uid = random.randint(1, 1000)
    # rtmUID = str(uid)
    role = 1
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    # rtmToken = RtmTokenBuilder.buildToken(appId, appCertificate, rtmUID, role, privilegeExpiredTs)
    rtmToken = RtmTokenBuilder.buildToken(appId, appCertificate, uid, role, privilegeExpiredTs)

    return JsonResponse({'token': token,'rtmToken': rtmToken, 'uid': uid}, safe=False)