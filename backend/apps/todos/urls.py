from django.urls import path
from .views import (
    TodoCategoryListCreate, TodoCategoryDetail,
    TodoTaskListCreate, TodoTaskDetail,
    CompleteTodoTaskView, RandomTodoTaskView, CategoryHasUncompletedTasksView, TodoReorderView
)

urlpatterns = [
    path("categories/", TodoCategoryListCreate.as_view(), name="todo-categories"),
    path("categories/<int:pk>/", TodoCategoryDetail.as_view(), name="todo-category-detail"),
    path("tasks/", TodoTaskListCreate.as_view(), name="todo-tasks"),
    path("tasks/<int:pk>/", TodoTaskDetail.as_view(), name="todo-task-detail"),
    path("tasks/<int:pk>/complete/", CompleteTodoTaskView.as_view(), name="todo-complete"),
    path("tasks/random/", RandomTodoTaskView.as_view(), name="todo-random"),
    path(
    "categories/<int:category_id>/has-uncompleted/",
    CategoryHasUncompletedTasksView.as_view(),
    ),
    path("reorder/", TodoReorderView.as_view()),
]
