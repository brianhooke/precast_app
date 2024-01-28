from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('update_suppliers/', views.update_suppliers, name='update_suppliers'),
    path('materials_upload/', views.materials_upload, name='materials_upload'),
    path('delete_supplier/', views.delete_supplier, name='delete_supplier'),
    path('bom_upload/', views.bom_upload, name='bom_upload'),
    path('upload_stocktake/', views.upload_stocktake, name='upload_stocktake'),
]