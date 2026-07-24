from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsHost, IsAdmin
from .models import HostVerification
from .serializers import HostVerificationStepSerializer, VerificationSubmitSerializer


def _ensure_all_steps(host):
    existing = {s.level for s in host.verification_steps.all()}
    for level in HostVerification.Level.values:
        if level not in existing:
            HostVerification.objects.create(host=host, level=level)


class MyVerificationStepsView(APIView):
    """The authenticated host's own 4 verification steps — creating any missing rows on first read."""
    permission_classes = [IsHost]

    def get(self, request):
        _ensure_all_steps(request.user)
        steps = request.user.verification_steps.all()
        return Response(HostVerificationStepSerializer(steps, many=True).data)


class VerificationSubmitView(APIView):
    """Host submits a level for review. Sequential — can't submit level N until N-1 is approved,
    and can't resubmit a level that's already approved or currently in review."""
    permission_classes = [IsHost]

    def post(self, request):
        serializer = VerificationSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        level = serializer.validated_data["level"]

        _ensure_all_steps(request.user)

        if level > 1:
            prior = request.user.verification_steps.get(level=level - 1)
            if prior.status != HostVerification.Status.APPROVED:
                return Response(
                    {"detail": f"Level {level - 1} must be approved before submitting level {level}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        step = request.user.verification_steps.get(level=level)
        if step.status in (HostVerification.Status.APPROVED, HostVerification.Status.IN_REVIEW):
            return Response(
                {"detail": f"Level {level} is already {step.get_status_display().lower()}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        step.status = HostVerification.Status.IN_REVIEW
        step.detail = serializer.validated_data.get("detail", "")
        step.submitted_at = timezone.now()
        step.reviewed_at = None
        step.reviewed_by = None
        step.save(update_fields=["status", "detail", "submitted_at", "reviewed_at", "reviewed_by"])

        return Response(HostVerificationStepSerializer(step).data, status=status.HTTP_200_OK)


class AdminVerificationListView(APIView):
    """List verification steps for admin review."""
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status", HostVerification.Status.IN_REVIEW)
        qs = HostVerification.objects.all()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(HostVerificationStepSerializer(qs, many=True).data)


class AdminVerificationReviewView(APIView):
    """Approve or reject a host verification step as admin."""
    permission_classes = [IsAdmin]

    def post(self, request):
        step_id = request.data.get("step_id")
        action = request.data.get("action")  # "approve" or "reject"
        if not step_id or action not in ("approve", "reject"):
            return Response(
                {"detail": "step_id and valid action ('approve' or 'reject') are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            step = HostVerification.objects.get(pk=step_id)
        except HostVerification.DoesNotExist:
            return Response({"detail": "Verification step not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "approve":
            step.status = HostVerification.Status.APPROVED
        else:
            step.status = HostVerification.Status.REJECTED

        step.reviewed_at = timezone.now()
        step.reviewed_by = request.user
        step.save(update_fields=["status", "reviewed_at", "reviewed_by"])

        return Response(HostVerificationStepSerializer(step).data, status=status.HTTP_200_OK)
