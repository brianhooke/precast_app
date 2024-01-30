from django.contrib import admin
from .models import Suppliers, Materials, Bom, Stocktake, Stocktake_data, Drawings


class SuppliersAdmin(admin.ModelAdmin):
    list_display = ("supplier_id", "name", "contact", "phone", "email", "webpage")

class MaterialsAdmin(admin.ModelAdmin):
    list_display = ("material_id", "supplier_id", "material", "units", "rate", "expected_wastage", "supplier_increments")

class BomAdmin(admin.ModelAdmin):
    list_display = ("material_id", "quantity")

class StocktakeAdmin(admin.ModelAdmin):
    list_display = ("stocktake_id", "datestamp")

class Stocktake_dataAdmin(admin.ModelAdmin):
    list_display = ("stocktake_id", "material_id", "amount")

class DrawingAdmin(admin.ModelAdmin):
    list_display = ("pdf_file",)  # Add the fields of the Drawing model you want to display in the admin site

admin.site.register(Suppliers, SuppliersAdmin)
admin.site.register(Materials, MaterialsAdmin)
admin.site.register(Bom, BomAdmin)
admin.site.register(Stocktake, StocktakeAdmin)
admin.site.register(Stocktake_data, Stocktake_dataAdmin)
admin.site.register(Drawings, DrawingAdmin)  # Register the Drawing model