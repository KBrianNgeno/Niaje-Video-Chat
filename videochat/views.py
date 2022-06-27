from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from agora_token_builder import RtcTokenBuilder, RtmTokenBuilder
from django.utils.crypto import get_random_string
from .forms import RoomForm
# import random
import time

def lobby(request):
    return render(request, 'lobby.html')

def room(request):
    return render(request, 'room.html')

# def createRoom(request):
#     if request.method == "POST":
#         room_form = RoomForm(request.POST)
#         if room_form.is_valid():
#             cd = room_form.cleaned_data
#             room = authenticate(request,
#                     username=cd['username'],
#                     roomname=cd['roomname'],
#                     password=cd['password'])
#             if room is not None:
#                 login(request, room)
#                 return HttpResponse('Authenticated '\
#                 'successfully')
#             else:
#                 return HttpResponse('Disabled account')
#         else:
#             return HttpResponse('Invalid login')
#     else:
#         room_form = RoomForm()
#     return render(request, 'lobby.html', {'room_form': room_form})

def getToken(request):
    appId = 'f0c8d127f8434b5ba355114d9e3a2f6f'
    appCertificate = '213c8aa7cb4643d18e6d08b1bf6c0474'
    channelName = request.GET.get('channel')
    userAccount = get_random_string(length=16)
    # userAccount = "123"
    role = 1
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds

    # token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    token = RtcTokenBuilder.buildTokenWithAccount(appId, appCertificate, channelName, userAccount, role, privilegeExpiredTs)
    # rtmToken = RtmTokenBuilder.buildToken(appId, appCertificate, userAccount, role, privilegeExpiredTs)
    rtmToken = RtmTokenBuilder.buildToken(appId, appCertificate, userAccount, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'rtmToken': rtmToken, 'userAccount': userAccount}, safe=False)