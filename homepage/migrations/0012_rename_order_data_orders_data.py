# Generated by Django 4.2.3 on 2024-02-07 11:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0011_orders_order_data'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Order_data',
            new_name='Orders_data',
        ),
    ]
