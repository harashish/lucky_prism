# apps/todos/urls.py
from django.urls import path
from .views import (
    TodoCategoryListCreate, TodoCategoryDetail,
    TodoTaskListCreate, TodoTaskDetail,
    TodoHistoryList, CompleteTodoTaskView, UndoCompleteTodoTaskView
)

urlpatterns = [
    path("categories/", TodoCategoryListCreate.as_view(), name="todo-categories"),
    path("categories/<int:pk>/", TodoCategoryDetail.as_view(), name="todo-category-detail"),
    path("tasks/", TodoTaskListCreate.as_view(), name="todo-tasks"),
    path("tasks/<int:pk>/", TodoTaskDetail.as_view(), name="todo-task-detail"),
    path("tasks/<int:pk>/complete/", CompleteTodoTaskView.as_view(), name="todo-complete"),
    path("tasks/<int:pk>/undo-complete/", UndoCompleteTodoTaskView.as_view(), name="todo-undo-complete"),
    path("history/", TodoHistoryList.as_view(), name="todo-history"),
]
