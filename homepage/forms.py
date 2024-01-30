from django import forms
from .models import Drawings

class DrawingUploadForm(forms.ModelForm):
    class Meta:
        model = Drawings
        fields = ['pdf_file']