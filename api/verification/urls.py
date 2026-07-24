from django.urls import path
from .views import (
    MyVerificationStepsView,
    VerificationSubmitView,
    AdminVerificationListView,
    AdminVerificationReviewView,
)

urlpatterns = [
    path("me/", MyVerificationStepsView.as_view(), name="verification-me"),
    path("me/submit/", VerificationSubmitView.as_view(), name="verification-submit"),
    path("admin/list/", AdminVerificationListView.as_view(), name="verification-admin-list"),
    path("admin/review/", AdminVerificationReviewView.as_view(), name="verification-admin-review"),
]
