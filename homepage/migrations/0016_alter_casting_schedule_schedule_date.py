# Generated by Django 4.2.3 on 2024-02-13 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0015_panels_casting_schedule'),
    ]

    operations = [
        migrations.AlterField(
            model_name='casting_schedule',
            name='schedule_date',
            field=models.DateField(),
        ),
    ]
