# settings/local.py
from .base import *

DEBUG = True
# Other local settings...

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static'),]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# STATICFILES_STORAGE = 'precast_app.storage_backends.StaticStorage'
# DEFAULT_FILE_STORAGE = 'precast_app.storage_backends.PublicMediaStorage'
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'