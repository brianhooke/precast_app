from django.shortcuts import render, redirect
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponse
from .models import Suppliers, Materials, Bom, Stocktake, Stocktake_data, Drawings, Orders, Orders_data
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F
from django.core.serializers import serialize
import json
import csv
import datetime
import logging
from logging.handlers import RotatingFileHandler
import io
import chardet
from .forms import DrawingUploadForm
from decimal import Decimal


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = RotatingFileHandler('application.log', maxBytes=2000, backupCount=10)
logger.addHandler(handler)

# Create your views here.
def home(request):
    suppliers = Suppliers.objects.all().values()
    materials = Materials.objects.all().annotate(supplier_name=F('supplier_id__name')).values()
    bom = Bom.objects.all().values()
    orders = Orders.objects.select_related('supplier_id').values('order_id', 'datestamp', 'order_status', 'supplier_id__name')
    orders_data=Orders_data.objects.all().values()
    # Convert suppliers to a dictionary for easy lookup
    suppliers_dict = {supplier['supplier_id']: supplier['name'] for supplier in suppliers}
    # Convert materials to a dictionary for easy lookup
    materials_dict = {material['material_id']: material for material in materials}
    # Add supplier name to each material
    for material in materials:
        material['supplier'] = suppliers_dict.get(material['supplier_id_id'])
    stocktake = [{field.name: getattr(obj, field.name).strftime('%Y-%m-%d') if isinstance(getattr(obj, field.name), datetime.date) else getattr(obj, field.name) for field in Stocktake._meta.fields} for obj in Stocktake.objects.all()]    
    stocktake_data = list(Stocktake_data.objects.all().values())
    # Rename keys
    stocktake_data = [
        {
            'id': item['id'],
            'stocktake_id': item['stocktake_id_id'],
            'material_id': item['material_id_id'],
            'amount': item['amount']
        }
        for item in stocktake_data
    ]
    # Get the sum of 'amount' for each material
    shelf_stock = Materials.objects.annotate(quantity=Sum('stocktake_data__amount')).values('material', 'quantity')
    # Convert QuerySet to list
    shelf_stock = list(shelf_stock)
    # Add wastage_adjusted_quantity to each bom
    for bom_item in bom:
        material = materials_dict.get(bom_item['material_id_id'])
        if material:
            bom_item['wastage_adjusted_quantity'] = bom_item['quantity'] * (1+(material['expected_wastage']) or 0)
            bom_item['material'] = material['material']
    drawings = Drawings.objects.all().order_by('id')  # Fetch all drawings ordered by id
    drawings_data = [{'id': drawing.id, 'pdf_file': drawing.pdf_file.url} for drawing in drawings]    # logger.info('Suppliers: %s', list(suppliers))
    # logger.info('Materials: %s', list(materials))
    return render(request, 'home.html', {'suppliers': list(suppliers), 'materials': list(materials), 'bom': list(bom), 'drawings': drawings_data, 'stocktake': stocktake, 'stocktake_data': stocktake_data, 'shelf_stock': shelf_stock, 'orders': list(orders), 'orders_data': list(orders_data)})

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
    
@csrf_exempt
def materials_upload(request):
    logger.info('about to start materials_upload5')
    if request.method == 'POST':
        if 'csv_file' not in request.FILES:
            return HttpResponse("No CSV file uploaded.", status=400)
        csv_file = request.FILES['csv_file']
        rawdata = csv_file.read()
        result = chardet.detect(rawdata)
        charenc = result['encoding']
        decoded_file = rawdata.decode(charenc).splitlines()
        reader = csv.DictReader(decoded_file)
        with transaction.atomic():
            # Delete all existing data from the Materials table
            Materials.objects.all().delete()
            for row in reader:
                # Log the row data
                logger.info(f'Processing row: {row}')
                # Strip BOM from keys
                row = {k.lstrip('\ufeff'): v for k, v in row.items()}
                material = row['material']
                rate = row['rate'].replace(',', '')
                supplier_id = Suppliers.objects.get(supplier_id=row['supplier_id']) if row['supplier_id'] else None                
                units = row['units']
                expected_wastage = row['expected_wastage'] if row['expected_wastage'] else None
                supplier_increments = row['supplier_increments'] if row['supplier_increments'] else None
                material_data = {
                    'material': material,
                    'units': units,
                    'rate': rate,
                    'supplier_id': supplier_id,
                    'expected_wastage': expected_wastage,
                    'supplier_increments': supplier_increments,
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

@csrf_exempt
def bom_upload(request):
    logger.info('about to start bom_upload')
    if request.method == 'POST':
        if 'csv_file' not in request.FILES:
            return HttpResponse("No CSV file uploaded.", status=400)
        csv_file = request.FILES['csv_file']
        rawdata = csv_file.read()
        result = chardet.detect(rawdata)
        charenc = result['encoding']
        decoded_file = rawdata.decode(charenc).splitlines()
        reader = csv.DictReader(decoded_file)
        with transaction.atomic():
            for row in reader:
                # Log the row data
                logger.info(f'Processing row: {row}')
                # Strip BOM from keys
                row = {k.lstrip('\ufeff'): v for k, v in row.items()}
                material_id = Materials.objects.get(material_id=row['material_id'])
                quantity = row['quantity']
                bom_data = {
                    'material_id': material_id,
                    'quantity': quantity,
                }
                bom, created = Bom.objects.update_or_create(**bom_data)
        return HttpResponse("CSV file uploaded and processed successfully.")
    else:
        # Handle the case for non-POST requests
        pass

@csrf_exempt
def upload_stocktake(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        stocktake = Stocktake(stocktake_type=data['stocktake_type'], datestamp=data['date'])
        stocktake.save()
        for item in data['data']:
            material = Materials.objects.get(material_id=item['material_id'])
            amount = item['amount'] if item['amount'] is not None else '0'
            stocktake_data = Stocktake_data(stocktake_id=stocktake, material_id=material, amount=amount)
            stocktake_data.save()
        return JsonResponse({'stocktake_id': stocktake.stocktake_id})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def upload_drawing(request):
    if request.method == 'POST':
        files = request.FILES.getlist('pdf_file')
        logger.info('Received %d files', len(files))  # Log the number of files received
        for file in files:
            form = DrawingUploadForm(request.POST, {'pdf_file': file})
            if form.is_valid():
                form.save()
            else:
                logger.error('Form is not valid: %s', form.errors)  # Log form errors
                return JsonResponse({'error': form.errors}, status=400)
        return redirect('home')
    else:
        form = DrawingUploadForm()
    return render(request, 'home.html', {'form': form})

@csrf_exempt
def upload_order(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        order = Orders(supplier_id=Suppliers.objects.get(supplier_id=data['supplier_id']), order_status=data['order_status'])
        order.save()
        for item in data['data']:
            material = Materials.objects.get(material_id=item['material_id'])
            quantity = item['quantity']
            rate = item['rate']  # Extract the rate from the item
            order_data = Orders_data(order_id=order, material_id=material, quantity=quantity, rate=rate)  # Include the rate when creating the Orders_data object
            order_data.save()
        return JsonResponse({'order_id': order.order_id})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def receive_order(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        for item in data:
            order_id = item.get('order_id')
            material_id = item.get('material_id')
            quantity = Decimal(item.get('quantity'))
            rate = Decimal(item.get('rate'))
            Orders_data.objects.filter(order_id=order_id, material_id=material_id).update(quantity=quantity, rate=rate)
            Orders.objects.filter(order_id=order_id).update(order_status='2')
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'failed', 'error': 'Invalid request method'})