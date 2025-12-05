# apps/todos/urls.py
from django.urls import path
from .views import (
    TodoCategoryListCreate,
    TodoTaskListCreate, TodoTaskDetail,
    TodoHistoryList
)

urlpatterns = [
    path("categories/", TodoCategoryListCreate.as_view(), name="todo-categories"),
    path("tasks/", TodoTaskListCreate.as_view(), name="todo-tasks"),
    path("tasks/<int:pk>/", TodoTaskDetail.as_view(), name="todo-task-detail"),
    path("history/", TodoHistoryList.as_view(), name="todo-history"),
]
