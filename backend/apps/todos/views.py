from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
import random

from .models import TodoCategory, TodoTask, TodoHistory
from .serializers import (
    TodoCategorySerializer,
    TodoTaskSerializer,
    TodoHistorySerializer,
)
from apps.gamification.utils import get_user

class TodoCategoryListCreate(generics.ListCreateAPIView):
    queryset = TodoCategory.objects.all().order_by("name")
    serializer_class = TodoCategorySerializer


class TodoCategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TodoCategory.objects.all()
    serializer_class = TodoCategorySerializer

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        if TodoCategory.objects.count() <= 1:
            return Response(
                {"detail": "Cannot delete the last category."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category.tasks.all().delete()
        return super().destroy(request, *args, **kwargs)


class TodoTaskListCreate(generics.ListCreateAPIView):
    serializer_class = TodoTaskSerializer

    def get_queryset(self):
        qs = TodoTask.objects.filter(user=get_user()).order_by("-created_at")
        category_id = self.request.query_params.get("category_id")
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=get_user())


class TodoTaskDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TodoTaskSerializer

    def get_queryset(self):
        return TodoTask.objects.filter(user=get_user())


class TodoHistoryList(generics.ListAPIView):
    serializer_class = TodoHistorySerializer

    def get_queryset(self):
        return TodoHistory.objects.filter(
            task__user=get_user()
        ).order_by("-completion_date")


class CompleteTodoTaskView(APIView):
    def post(self, request, pk):
        task = get_object_or_404(
            TodoTask,
            pk=pk,
            user=get_user(),
        )

        with transaction.atomic():
            if task.is_completed:
                return Response(
                    {
                        "detail": "Task already completed",
                        "already_completed": True,
                    },
                    status=status.HTTP_200_OK,
                )

            history = TodoHistory.objects.create(task=task, xp_gained=0)
            history.complete()

            task.is_completed = True
            task.save(update_fields=["is_completed", "updated_at"])

        return Response(
            {
                "task_id": task.id,
                "xp_gained": history.xp_gained,
                "total_xp": task.user.total_xp,
                "current_level": task.user.current_level,
            },
            status=status.HTTP_200_OK,
        )


class RandomTodoTaskView(APIView):
    def get(self, request):
        qs = TodoTask.objects.filter(
            user=get_user(),
            is_completed=False,
        )

        category_id = request.query_params.get("category_id")
        if category_id:
            qs = qs.filter(category_id=category_id)

        if not qs.exists():
            return Response(None, status=status.HTTP_200_OK)

        task = random.choice(list(qs))
        return Response(TodoTaskSerializer(task).data)
