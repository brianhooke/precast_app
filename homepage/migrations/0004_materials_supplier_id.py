# Generated by Django 4.2.3 on 2024-01-23 11:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0003_materials_alter_suppliers_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='materials',
            name='supplier_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='homepage.suppliers'),
            preserve_default=False,
        ),
    ]