# Generated by Django 4.2.3 on 2024-01-30 06:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0008_alter_stocktake_options_alter_stocktake_data_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Drawings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pdf_file', models.FileField(upload_to='drawings/')),
            ],
        ),
    ]