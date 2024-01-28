from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0003_alter_bom_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bom',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=2, default=0.00, max_digits=12)),
                ('material_id', models.ForeignKey(on_delete=models.CASCADE, to='homepage.Materials')),
            ],
        ),
    ]