from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('update_suppliers/', views.update_suppliers, name='update_suppliers'),
    path('materials_upload/', views.materials_upload, name='materials_upload'),
    path('materials_upload/', views.materials_upload, name='materials_upload'),
]