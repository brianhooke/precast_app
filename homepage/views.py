from django.shortcuts import render, redirect
from django.db import transaction
from django.db.models import Sum, F, Case, When, IntegerField, Q
from django.http import HttpResponse
from .models import Suppliers, Materials, Bom, Stocktake, Stocktake_data, Drawings, Orders, Orders_data, Panels, Casting_schedule, Panels_bom, Orders_used
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
from collections import defaultdict


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = RotatingFileHandler('application.log', maxBytes=2000, backupCount=10)
logger.addHandler(handler)



def get_used_materials():
    # Fetch all Orders_used objects
    orders_used = Orders_used.objects.all()
    # Get unique order_ids
    unique_order_ids = set(order.order_id_id for order in orders_used)
    # For each unique order_id, get all related schedule_ids
    order_schedule_mapping = {}
    for order_id in unique_order_ids:
        related_schedule_ids = [order.schedule_id_id for order in orders_used if order.order_id_id == order_id]
        order_schedule_mapping[order_id] = related_schedule_ids
    # Create orders_bom_calculated dataset
    orders_bom_calculated = {}
    for order_id, schedule_ids in order_schedule_mapping.items():
        orders_data = Orders_data.objects.filter(order_id=order_id)
        orders_bom_calculated[order_id] = []
        for order_data in orders_data:
            material_id = order_data.material_id_id
            quantity = order_data.quantity
            orders_bom_calculated[order_id].append({
                'material_id': material_id,
                'quantity': quantity
            })
    # Create panels_bom_calculated dataset
    panels_bom_calculated = {}
    for order_id, schedule_ids in order_schedule_mapping.items():
        panels = Panels.objects.filter(schedule_id__in=schedule_ids)
        panels_bom_calculated[order_id] = []
        for panel in panels:
            panel_id = panel.panel_id
            panels_bom = Panels_bom.objects.filter(panel_id=panel_id)
            for panel_bom in panels_bom:
                material_id = panel_bom.material_id_id
                quantity = panel_bom.quantity
                panels_bom_calculated[order_id].append({
                    'panel_id': panel_id,
                    'material_id': material_id,
                    'quantity': quantity
                })
    # Create used_materials dataset
    used_materials = []
    for order_id in unique_order_ids:
        for order_bom in orders_bom_calculated[order_id]:
            material_id = order_bom['material_id']
            quantity_order = order_bom['quantity']
            quantity_panel = sum(panel_bom['quantity'] for panel_bom in panels_bom_calculated[order_id] if panel_bom['material_id'] == material_id)
            y = quantity_order / quantity_panel if quantity_panel != 0 else 0
            for panel_bom in panels_bom_calculated[order_id]:
                if panel_bom['material_id'] == material_id:
                    used_quantity = panel_bom['quantity'] * y
                    material = Materials.objects.get(material_id=material_id).material
                    used_materials.append({
                        'panel_id': panel_bom['panel_id'],
                        'material_id': material_id,
                        'material': material,
                        'used_quantity': used_quantity
                    })
    logger.info(f'Used Materials: {used_materials}')
    return used_materials

def get_expected_used_materials():
    used_materials = get_used_materials()
    expected_used_materials = []
    unique_materials = set((material['panel_id'], material['material_id']) for material in used_materials)
    for panel_id, material_id in unique_materials:
        material = Materials.objects.get(material_id=material_id).material
        expected_quantity = Panels_bom.objects.get(panel_id=panel_id, material_id=material_id).quantity
        expected_used_materials.append({
            'panel_id': panel_id,
            'material_id': material_id,
            'material': material,
            'expected_quantity': expected_quantity
        })
    logger.info(f'Expected Materials: {expected_used_materials}')
    return expected_used_materials

def metric_calculations():
    # Get the data from the other functions
    used_materials = get_used_materials()
    expected_used_materials = get_expected_used_materials()
    # Create a dictionary for easy lookup of quantities by material_id
    used_quantities = {material['material_id']: material['used_quantity'] for material in used_materials}
    expected_quantities = {material['material_id']: material['expected_quantity'] for material in expected_used_materials}
    # Get all Materials
    all_materials = Materials.objects.all()
    # Calculate panel_consumables_pl for each material
    panel_consumables_pl = []
    for material in all_materials:
        material_id = material.material_id
        rate = material.rate
        used_quantity = used_quantities.get(material_id, 0)
        expected_quantity = expected_quantities.get(material_id, 0)
        material_pl = (used_quantity - expected_quantity) * rate
        panel_consumables_pl.append({
            'material_id': material_id,
            'material_pl': material_pl
        })
    return panel_consumables_pl

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
    panels = Panels.objects.all().values('panel_id', 'panel_width', 'panel_length', 'panel_volume', 'panel_position_x', 'panel_position_y', 'panel_rotation', 'schedule_id_id')
    casting_schedule = Casting_schedule.objects.all().values()
    # Fetch Panels_bom objects and annotate them
    panels_bom = Panels_bom.objects.all().annotate(
        material=F('material_id__material'),
        expected_wastage=F('material_id__expected_wastage'),
        cast_qty=Sum(
            Case(
                When(panel_id__schedule_id__complete=True, then='quantity'),
                default=0,
                output_field=IntegerField(),
            )
        )
    ).values('material_id', 'material', 'expected_wastage', 'quantity', 'panel_id', 'cast_qty')
    # Initialize a dictionary to store the grouped data
    bom_tracking_dict = defaultdict(lambda: {'tender_qty': 0, 'cast_qty': 0})
    # Iterate over the Panels_bom objects and group them by material_id
    for item in panels_bom:
        material_id = item['material_id']
        bom_tracking_dict[material_id]['material'] = item['material']
        bom_tracking_dict[material_id]['tender_qty'] += item['quantity'] * (1 + item['expected_wastage'])
        bom_tracking_dict[material_id]['cast_qty'] += item['cast_qty']
    # Convert the dictionary to a list
    bom_tracking = list(bom_tracking_dict.values())
    used_materials = get_used_materials()
    expected_used_materials = get_expected_used_materials()
    panel_consumables_pl = metric_calculations()
    return render(request, 'home.html', {'used_materials': used_materials, 'expected_used_materials': expected_used_materials, 'panel_consumables_pl': panel_consumables_pl, 'bom_tracking': bom_tracking, 'suppliers': list(suppliers), 'materials': list(materials), 'bom': list(bom), 'drawings': drawings_data, 'stocktake': stocktake, 'stocktake_data': stocktake_data, 'shelf_stock': shelf_stock, 'orders': list(orders), 'orders_data': list(orders_data), 'panels': list(panels), 'casting_schedule': list(casting_schedule)})




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
def panels_bom_upload(request):
    logger.info('about to start panels_bom_upload')
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
            # Delete all existing data from the Panels_bom table
            Panels_bom.objects.all().delete()
            for row in reader:
                # Log the row data
                logger.info(f'Processing row: {row}')
                # Strip BOM from keys
                row = {k.lstrip('\ufeff'): v for k, v in row.items()}
                panel_id = Panels.objects.get(panel_id=row['panel_id']) if row['panel_id'] else None
                material_id = Materials.objects.get(material_id=row['material_id']) if row['material_id'] else None
                quantity = row['quantity'].strip()
                if quantity == '-':
                    quantity = 0
                else:
                    quantity = Decimal(quantity)
                panels_bom_data = {
                    'panel_id': panel_id,
                    'material_id': material_id,
                    'quantity': quantity,
                }
                panels_bom = Panels_bom(**panels_bom_data)
                panels_bom.save()
        return HttpResponse("CSV file uploaded and processed successfully.")
    else:
        # Handle the case for non-POST requests
        pass

@csrf_exempt
def panels_upload(request):
    logger.info('about to start panels csv upload')
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
            Panels.objects.all().delete()
            for row in reader:
                # Log the row data
                logger.info(f'Processing row: {row}')
                # Strip BOM from keys
                row = {k.lstrip('\ufeff'): v for k, v in row.items()}
                panel_id = int(row['panel_id'])
                panel_width = Decimal(row['panel_width'])
                panel_length = Decimal(row['panel_length'])
                panel_volume = Decimal(row['panel_volume'])
                panel_position_x = Decimal(row['panel_position_x'])
                panel_position_y = Decimal(row['panel_position_y'])
                panel_rotation = bool(row['panel_rotation'])
                schedule_id = int(row['schedule_id']) if row['schedule_id'] else None
                schedule = Casting_schedule.objects.get(pk=schedule_id) if schedule_id else None
                panels_data = {
                    'panel_id': panel_id,
                    'panel_width': panel_width,
                    'panel_length': panel_length,
                    'panel_volume': panel_volume,
                    'panel_position_x': panel_position_x,
                    'panel_position_y': panel_position_y,
                    'panel_rotation': panel_rotation,
                    'schedule_id': schedule,  # Assign the Casting_schedule instance
                }
                panels = Panels(**panels_data)
                panels.save()
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
    
@csrf_exempt
def update_panel_position_and_size(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        for panel_data in data:
            try:
                panel = Panels.objects.get(panel_id=panel_data['panel_id'])
                panel.panel_position_x = panel_data['panel_position_x']
                panel.panel_position_y = panel_data['panel_position_y']
                panel.panel_rotation = panel_data['panel_rotation']
                panel.save()
            except Panels.DoesNotExist:
                return JsonResponse({'error': 'Panel not found'}, status=404)
        return JsonResponse({'message': 'Panels updated successfully'}, status=200)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
@csrf_exempt
def update_casting_schedule(request):
    if request.method == 'POST':
        schedule_id = request.POST.get('scheduleId')
        complete = request.POST.get('complete') == '1'
        try:
            schedule = Casting_schedule.objects.get(schedule_id=schedule_id)
            schedule.complete = complete
            schedule.save()
            return JsonResponse({'status': 'success'})
        except Casting_schedule.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'No schedule found with the given id'}, status=404)
    else:
        return JsonResponse({'status': 'error', 'error': 'Invalid request method'}, status=405)

@csrf_exempt
def allocate_order(request):
    if request.method == 'POST':
        order_id = request.POST.get('order_id')
        schedule_ids = request.POST.getlist('schedule_ids[]')
        # Retrieve the Orders object with the given order_id
        order = Orders.objects.get(pk=order_id)
        # Update the order_status
        order.order_status = '3'
        order.save()
        for schedule_id in schedule_ids:
            schedule = Casting_schedule.objects.get(pk=schedule_id)
            Orders_used.objects.create(order_id=order, schedule_id=schedule)
        return JsonResponse({'message': 'Order successfully allocated'}, status=200)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)