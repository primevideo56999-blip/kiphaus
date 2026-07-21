from django.conf import settings
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from users.throttles import AuthRateThrottle
from .email import send_raw_email


class ContactMessageSerializer(serializers.Serializer):
    name    = serializers.CharField(max_length=200)
    email   = serializers.EmailField()
    subject = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=5000)


class ContactMessageView(APIView):
    """POST /api/v1/notifications/contact/ — public "Send a message" form on /contact."""
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRateThrottle]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        send_raw_email(
            subject=f"[Kiphaus contact] {data['subject']}",
            to=settings.SUPPORT_EMAIL,
            text=f"From: {data['name']} <{data['email']}>\n\n{data['message']}",
            reply_to=data["email"],
        )
        return Response({"detail": "Message sent — we'll reply within one business day."})
