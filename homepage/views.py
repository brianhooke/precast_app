from django.shortcuts import render
from django.db import transaction
from django.http import HttpResponse
from .models import Suppliers, Materials
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F
import json
import csv
import logging

# Create your views here.
def home(request):
    logger = logging.getLogger(__name__)
    suppliers = Suppliers.objects.all().values()
    materials = Materials.objects.all().annotate(supplier_name=F('supplier_id__name')).values()
    # Convert suppliers to a dictionary for easy lookup
    suppliers_dict = {supplier['supplier_id']: supplier['name'] for supplier in suppliers}
    # Add supplier name to each material
    for material in materials:
        material['supplier'] = suppliers_dict.get(material['supplier_id_id'])
    # logger.info('Suppliers: %s', list(suppliers))
    # logger.info('Materials: %s', list(materials))
    return render(request, 'home.html', {'suppliers': list(suppliers), 'materials': list(materials)})

@csrf_exempt
def update_suppliers(request):
    logger = logging.getLogger(__name__)
    if request.method == 'POST':
        data = json.loads(request.body)
        logger.info('Data: %s', data)
        for item in data:
            if 'supplier_id' in item and item['supplier_id']:
                # Update existing supplier
                try:
                    supplier = Suppliers.objects.get(supplier_id=item['supplier_id'])
                    for key, value in item.items():
                        setattr(supplier, key, value)
                    supplier.save()
                except Suppliers.DoesNotExist:
                    return JsonResponse({'status': 'Supplier not found'}, status=404)
            elif 'name' in item and item['name']:
                # Create new supplier
                Suppliers.objects.create(
                    name=item['name'],
                    contact=item.get('contact', ''),
                    phone=item.get('phone', ''),
                    email=item.get('email', ''),
                    webpage=item.get('webpage', '')
                )
        return JsonResponse({'status': 'success'}, status=200)
    else:
        return JsonResponse({'status': 'bad request'}, status=400)
    
def materials_upload(request):
    if request.method == 'POST':
        if 'csv_file' not in request.FILES:
            return HttpResponse("No CSV file uploaded.", status=400)
        csv_file = request.FILES['csv_file']
        decoded_file = csv_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        with transaction.atomic():
            # Delete all existing data from the Materials table
            Materials.objects.all().delete()
            for row in reader:
                rate = row['rate'].replace(',', '')
                supplier = Suppliers.objects.get(supplier_id=row['supplier_id'])
                material_data = {
                    'material': row['material'],
                    'units': row['units'],
                    'rate': rate,
                    'supplier_id': supplier_id,
                }
                material = Materials(**material_data)
                material.save()
        return HttpResponse("CSV file uploaded and processed successfully.")
    else:
        # Handle the case for non-POST requests
        pass

@csrf_exempt
def delete_supplier(request):
    logger = logging.getLogger(__name__)
    if request.method == 'POST':
        data = json.loads(request.body)
        supplier_id = data.get('supplier_id')
        if supplier_id:
            try:
                supplier = Suppliers.objects.get(supplier_id=supplier_id)
                supplier.delete()
                return JsonResponse({'status': 'success'}, status=200)
            except Suppliers.DoesNotExist:
                return JsonResponse({'status': 'Supplier not found'}, status=404)
        else:
            return JsonResponse({'status': 'Invalid request'}, status=400)
    else:
        return JsonResponse({'status': 'Invalid method'}, status=405)
