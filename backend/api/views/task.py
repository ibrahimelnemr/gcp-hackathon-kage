from rest_framework.viewsets import ModelViewSet
from ..models import Project, Task
from ..serializers import ProjectSerializer, TaskSerializer

class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer