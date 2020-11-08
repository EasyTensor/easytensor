# Generated by Django 3.1.3 on 2020-11-08 15:57

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('uploads', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='QueryAccessToken',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('udpated_at', models.DateTimeField(auto_now=True)),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='uploads.model')),
            ],
        ),
    ]