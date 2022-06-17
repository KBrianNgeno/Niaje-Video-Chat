from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
from agora_token_builder import RtmTokenBuilder
from django.utils.crypto import get_random_string
import random
import time

def lobby(request):
    return render(request, 'lobby.html')

def room(request):
    return render(request, 'room.html')

def getToken(request):
    appId = 'f0c8d127f8434b5ba355114d9e3a2f6f'
    appCertificate = '213c8aa7cb4643d18e6d08b1bf6c0474'
    channelName = request.GET.get('channel')
    # uid = str(random.randint(1, 1000))
    # uid = random.randint(1, 232)
    userAccount = get_random_string(length=16)
    role = 1
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds

    # token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    token = RtcTokenBuilder.buildTokenWithAccount(appId, appCertificate, channelName, userAccount, role, privilegeExpiredTs)
    # rtmToken = RtmTokenBuilder.buildToken(appId, appCertificate, userAccount, role, privilegeExpiredTs)
    rtmToken = RtmTokenBuilder.buildToken(appId, appCertificate, userAccount, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'rtmToken': rtmToken, 'userAccount': userAccount}, safe=False)