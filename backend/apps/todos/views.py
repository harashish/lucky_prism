# apps/todos/views.py
from rest_framework import generics
from .models import TodoCategory, TodoTask, TodoHistory
from .serializers import TodoCategorySerializer, TodoTaskSerializer, TodoHistorySerializer

class TodoCategoryListCreate(generics.ListCreateAPIView):
    queryset = TodoCategory.objects.all()
    serializer_class = TodoCategorySerializer

class TodoTaskListCreate(generics.ListCreateAPIView):
    queryset = TodoTask.objects.all()
    serializer_class = TodoTaskSerializer

class TodoTaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = TodoTask.objects.all()
    serializer_class = TodoTaskSerializer

class TodoHistoryList(generics.ListAPIView):
    queryset = TodoHistory.objects.all()
    serializer_class = TodoHistorySerializer
