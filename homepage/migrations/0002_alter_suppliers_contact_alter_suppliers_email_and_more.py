# Generated by Django 4.2.7 on 2024-01-22 09:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='suppliers',
            name='contact',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='suppliers',
            name='email',
            field=models.EmailField(max_length=100),
        ),
        migrations.AlterField(
            model_name='suppliers',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='suppliers',
            name='phone',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='suppliers',
            name='webpage',
            field=models.URLField(max_length=100),
        ),
    ]
