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
    supplier_id = models.ForeignKey('Suppliers', on_delete=models.CASCADE, null=True, blank=True)
    units = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=12, decimal_places=5, default=Decimal('0.00000'))
    expected_wastage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    supplier_increments = models.DecimalField(max_digits=12, decimal_places=5, default=Decimal('0.00000'))
    def __str__(self):
        return self.material  # Changed from self.name to self.material
    class Meta:
        verbose_name_plural = "Materials"

class Bom(models.Model): # Note, now Panels_bom has been created, this model should eventually only be used for bom not attributable to a panel
    material_id = models.ForeignKey('Materials', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    bom_type = models.IntegerField(default=0)  # 0 is undefined, 1 is consumables, 2+ to follow later
    def __str__(self):
        return f'Material ID: {self.material_id}, Quantity: {self.quantity}'
    class Meta:
        verbose_name = "BOM"
    
class Stocktake(models.Model):
    stocktake_id = models.AutoField(primary_key=True)
    stocktake_type = models.CharField(max_length=100) #1 to denote opening stock, 2 to denote ongoing stocktakes
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

class Orders(models.Model):
    order_id = models.AutoField(primary_key=True)
    datestamp = models.DateField(auto_now_add=True)
    supplier_id = models.ForeignKey(Suppliers, on_delete=models.SET_NULL, null=True, blank=True)
    order_status = models.CharField(max_length=100) #1 for pending, 2 for received & stocked, 3 for used
    def __str__(self):
        return f'Order ID: {self.order_id}, Date: {self.datestamp}, Supplier: {self.supplier_id}, Status: {self.order_status}'
    class Meta:
        verbose_name_plural = "Orders"

class Orders_data(models.Model):
    order_id = models.ForeignKey(Orders, on_delete=models.CASCADE)
    material_id = models.ForeignKey(Materials, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))  # New 'rate' field
    def __str__(self):
        return f'Order ID: {self.order_id}, Material ID: {self.material_id}, Quantity: {self.quantity}, Rate: {self.rate}'
    class Meta:
        verbose_name_plural = "Order Data"

class Orders_used(models.Model):
    order_id = models.ForeignKey('Orders', on_delete=models.CASCADE)
    schedule_id = models.ForeignKey('Casting_schedule', on_delete=models.CASCADE)
    def __str__(self):
        return f'Order ID: {self.order_id}, Schedule ID: {self.schedule_id}'
    class Meta:
        verbose_name_plural = "Orders Used"
    
class Drawings(models.Model):
    pdf_file = models.FileField(upload_to='drawings/')
    def __str__(self):
        return self.pdf_file.name  # Return the name of the uploaded file
    class Meta:
        verbose_name_plural = "Drawings"

class Panels(models.Model):
    panel_id = models.IntegerField(primary_key=True)  
    panel_width = models.DecimalField(max_digits=12, decimal_places=2)
    panel_length = models.DecimalField(max_digits=12, decimal_places=2)
    panel_volume = models.DecimalField(max_digits=12, decimal_places=2)
    panel_position_x = models.DecimalField(max_digits=12, decimal_places=2)
    panel_position_y = models.DecimalField(max_digits=12, decimal_places=2)
    panel_rotation = models.BooleanField(default=False)
    schedule_id = models.ForeignKey('Casting_schedule', on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return f'Panel ID: {self.panel_id}, Width: {self.panel_width}, Length: {self.panel_length}, Volume: {self.panel_volume}, Rotation: {self.panel_rotation}, Position X: {self.panel_position_x}, Position Y: {self.panel_position_y}, Schedule ID: {self.schedule_id}'
    class Meta:
        verbose_name_plural = "Panels"

class Panels_bom(models.Model):
    panel_id = models.ForeignKey('Panels', on_delete=models.CASCADE)
    material_id = models.ForeignKey('Materials', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=10)
    def __str__(self):
        return f'Panel ID: {self.panel_id}, Material ID: {self.material_id}, Quantity: {self.quantity}'
    class Meta:
        verbose_name_plural = "Panels BOM"

class Casting_schedule(models.Model):
    schedule_id = models.AutoField(primary_key=True)
    schedule_date = models.DateField()  # User needs to select a date
    complete = models.BooleanField(default=False)
    def __str__(self):
        return f'Schedule ID: {self.schedule_id}, Date: {self.schedule_date}, Complete: {self.complete}'
    class Meta:
        verbose_name_plural = "Casting Schedule"