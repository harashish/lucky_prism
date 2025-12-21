from django.urls import path
from .views import DifficultyTypeList

urlpatterns = [
    path("difficulties/", DifficultyTypeList.as_view(), name="common-difficulties"),
    
]
