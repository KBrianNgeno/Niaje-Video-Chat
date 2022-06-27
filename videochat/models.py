# from django.db import models

# class User(models.Model):
#     # UUID = 
#     name = models.CharField(max_length=200)

# class Room(models.Model):
#     username = models.ForeignKey(User, on_delete=models.CASCADE)
#     roomname = models.CharField(max_length=200, unique=True)
#     password = models.CharField(max_length=32)
#     # created = models.DateTimeField(auto_now_add=True)
#     def __str__(self):
#         return self.name

from django.db import models

class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=100)
    room_name = models.CharField(max_length=200)

    def __str__(self):
        return self.name