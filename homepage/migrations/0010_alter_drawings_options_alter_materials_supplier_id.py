# Generated by Django 4.2.3 on 2024-02-05 05:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0009_drawings'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='drawings',
            options={'verbose_name_plural': 'Drawings'},
        ),
        migrations.AlterField(
            model_name='materials',
            name='supplier_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='homepage.suppliers'),
        ),
    ]
