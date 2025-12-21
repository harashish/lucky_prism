from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import TodoCategory, TodoTask, TodoHistory
from .serializers import TodoCategorySerializer, TodoTaskSerializer, TodoHistorySerializer
from django.db import transaction
import random
from django.db.models import Q
class TodoCategoryListCreate(generics.ListCreateAPIView):
    queryset = TodoCategory.objects.all().order_by('name')
    serializer_class = TodoCategorySerializer

class TodoCategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TodoCategory.objects.all()
    serializer_class = TodoCategorySerializer

    def destroy(self, request, *args, **kwargs):
        cat = self.get_object()
        total_categories = TodoCategory.objects.count()
        if total_categories <= 1:
            return Response(
                {"detail": "Cannot delete the last category."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cat.tasks.all().delete()
        return super().destroy(request, *args, **kwargs)

class TodoTaskListCreate(generics.ListCreateAPIView):
    queryset = TodoTask.objects.all().order_by('-created_at')
    serializer_class = TodoTaskSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get("user_id")
        category_id = self.request.query_params.get("category_id")
        if user_id:
            qs = qs.filter(user_id=user_id)
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

class TodoTaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TodoTask.objects.all()
    serializer_class = TodoTaskSerializer

class TodoHistoryList(generics.ListAPIView):
    queryset = TodoHistory.objects.all().order_by('-completion_date')
    serializer_class = TodoHistorySerializer

class CompleteTodoTaskView(APIView):
    def post(self, request, pk):
        task = get_object_or_404(TodoTask, pk=pk)
        with transaction.atomic():
            if task.is_completed:
                return Response({"detail": "Task already completed", "already_completed": True}, status=status.HTTP_200_OK)

            history = TodoHistory.objects.create(task=task, xp_gained=0)
            history.complete()

            task.is_completed = True
            task.save(update_fields=["is_completed", "updated_at"])

            return Response({
                "task_id": task.id,
                "xp_gained": history.xp_gained,
                "total_xp": task.user.total_xp,
                "current_level": task.user.current_level
            }, status=status.HTTP_200_OK)

class RandomTodoTaskView(APIView):
    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id required"}, status=400)

        qs = TodoTask.objects.filter(
            Q(user_id=user_id) | Q(is_default=True),
            is_completed=False
        )

        if not qs.exists():
            return Response(None, status=200)

        task = random.choice(list(qs))
        return Response(TodoTaskSerializer(task).data)


