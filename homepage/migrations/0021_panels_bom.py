# Generated by Django 4.2.3 on 2024-02-15 04:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0020_bom_bom_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='Panels_bom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=10, max_digits=12)),
                ('material_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='homepage.materials')),
                ('panel_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='homepage.panels')),
            ],
            options={
                'verbose_name_plural': 'Panels BOM',
            },
        ),
    ]