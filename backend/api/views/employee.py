from rest_framework.viewsets import ModelViewSet
from ..models import Employee
from ..serializers import EmployeeSerializer

class EmployeeViewSet(ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer