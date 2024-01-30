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
    expected_wastage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    supplier_increments = models.DecimalField(max_digits=12, decimal_places=5, default=Decimal('0.00000'))
    def __str__(self):
        return self.material  # Changed from self.name to self.material
    class Meta:
        verbose_name_plural = "Materials"

class Bom(models.Model):
    material_id = models.ForeignKey('Materials', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    def __str__(self):
        return f'Material ID: {self.material_id}, Quantity: {self.quantity}'
    class Meta:
        verbose_name = "BOM"
    
class Stocktake(models.Model):
    stocktake_id = models.AutoField(primary_key=True)
    datestamp = models.DateField(auto_now_add=True)    
    def __str__(self):
        return f'Stocktake ID: {self.stocktake_id}, Date: {self.datestamp}'
    class Meta:
        verbose_name_plural = "Stocktake"
            
class Stocktake_data(models.Model):
    stocktake_id = models.ForeignKey(Stocktake, on_delete=models.CASCADE)
    material_id = models.ForeignKey(Materials, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self):
        return f'Stocktake ID: {self.stocktake_id}, Material ID: {self.material_id}'
    class Meta:
        verbose_name_plural = "Stocktake Data"
    
class Drawings(models.Model):
    pdf_file = models.FileField(upload_to='drawings/')
    def __str__(self):
        return self.pdf_file.name  # Return the name of the uploaded file
    class Meta:
        verbose_name_plural = "Drawings"