from django.urls import path
from .views import (
    TodoCategoryListCreate, TodoCategoryDetail,
    TodoTaskListCreate, TodoTaskDetail,
    TodoHistoryList, CompleteTodoTaskView, RandomTodoTaskView
)

urlpatterns = [
    path("categories/", TodoCategoryListCreate.as_view(), name="todo-categories"),
    path("categories/<int:pk>/", TodoCategoryDetail.as_view(), name="todo-category-detail"),
    path("tasks/", TodoTaskListCreate.as_view(), name="todo-tasks"),
    path("tasks/<int:pk>/", TodoTaskDetail.as_view(), name="todo-task-detail"),
    path("tasks/<int:pk>/complete/", CompleteTodoTaskView.as_view(), name="todo-complete"),
    path("history/", TodoHistoryList.as_view(), name="todo-history"),
    path("tasks/random/", RandomTodoTaskView.as_view(), name="todo-random"),

]
