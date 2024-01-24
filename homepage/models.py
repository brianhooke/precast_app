from django.db import models
from decimal import Decimal

class Suppliers(models.Model):
    supplier_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    webpage = models.URLField(max_length=100)
    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = "Suppliers"

class Materials(models.Model):
    material_id = models.AutoField(primary_key=True)
    material = models.CharField(max_length=100)
    supplier_id = models.ForeignKey('Suppliers', on_delete=models.CASCADE)
    units = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=12, decimal_places=5, default=Decimal('0.00000'))
    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = "Materials"