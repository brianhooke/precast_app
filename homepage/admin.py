from django.contrib import admin
from .models import Suppliers, Materials

class SuppliersAdmin(admin.ModelAdmin):
    list_display = ("supplier_id", "name", "contact", "phone", "email", "webpage")

class MaterialsAdmin(admin.ModelAdmin):
    list_display = ("material_id", "supplier_id", "material", "units", "rate")

admin.site.register(Suppliers, SuppliersAdmin)
admin.site.register(Materials, MaterialsAdmin)