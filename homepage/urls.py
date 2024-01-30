from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from .views import upload_drawing


urlpatterns = [
    path('', views.home, name='home'),
    path('update_suppliers/', views.update_suppliers, name='update_suppliers'),
    path('materials_upload/', views.materials_upload, name='materials_upload'),
    path('delete_supplier/', views.delete_supplier, name='delete_supplier'),
    path('bom_upload/', views.bom_upload, name='bom_upload'),
    path('upload_stocktake/', views.upload_stocktake, name='upload_stocktake'),
    path('upload_drawing/', views.upload_drawing, name='upload_drawing'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)