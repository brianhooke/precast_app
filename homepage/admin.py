from django.contrib import admin
from .models import Suppliers, Materials, Bom, Stocktake, Stocktake_data, Drawings, Orders, Orders_data, Panels, Casting_schedule, Panels_bom


class SuppliersAdmin(admin.ModelAdmin):
    list_display = ("supplier_id", "name", "contact", "phone", "email", "webpage")

class MaterialsAdmin(admin.ModelAdmin):
    list_display = ("material_id", "supplier_id", "material", "units", "rate", "expected_wastage", "supplier_increments")

class BomAdmin(admin.ModelAdmin):
    list_display = ("material_id", "quantity", "bom_type")

class StocktakeAdmin(admin.ModelAdmin):
    list_display = ("stocktake_id", "stocktake_type", "datestamp")

class Stocktake_dataAdmin(admin.ModelAdmin):
    list_display = ("stocktake_id", "material_id", "amount")

class DrawingAdmin(admin.ModelAdmin):
    list_display = ("pdf_file",)  # Add the fields of the Drawing model you want to display in the admin site

class OrdersAdmin(admin.ModelAdmin):
    list_display = ("order_id", "datestamp", "supplier_id", "order_status")

class Orders_dataAdmin(admin.ModelAdmin):
    list_display = ("order_id", "material_id", "rate", "quantity")

class Panels_dataAdmin(admin.ModelAdmin):
    list_display = ("panel_id", "panel_width", "panel_length", "panel_volume", "panel_rotation", "panel_position_x", "panel_position_y", "schedule_id")

class Panels_bomAdmin(admin.ModelAdmin):
    list_display = ("panel_id", "material_id", "quantity")

class Casting_scheduleAdmin(admin.ModelAdmin):
    list_display = ('schedule_id', 'schedule_date', 'complete')

admin.site.register(Suppliers, SuppliersAdmin)
admin.site.register(Materials, MaterialsAdmin)
admin.site.register(Bom, BomAdmin)
admin.site.register(Stocktake, StocktakeAdmin)
admin.site.register(Stocktake_data, Stocktake_dataAdmin)
admin.site.register(Drawings, DrawingAdmin)
admin.site.register(Orders, OrdersAdmin)
admin.site.register(Orders_data, Orders_dataAdmin)
admin.site.register(Panels, Panels_dataAdmin)
admin.site.register(Casting_schedule, Casting_scheduleAdmin)
admin.site.register(Panels_bom, Panels_bomAdmin)  