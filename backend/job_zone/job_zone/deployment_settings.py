import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR

# Allowed hosts and CSRF settings
ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME')]
CSRF_TRUSTED_ORGINS = [
    'https://jobzone-red.vercel.app',
    'https://'+os.environ.get('RENDER_EXTERNAL_HOSTNAME'),
]

# Production settings
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
]

# CORS configuration
CORS_ALLOWED_ORIGINS = [
    "https://jobzone-red.vercel.app",
]

# Static and media file storage
STORAGES = {
    "default":{
        "BACKEND" : "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND" : "whitenoise.storage.CompressedStaticFilesStorage"
    }
}

# Database configuration
DATABASES = {
    'default' : dj_database_url.config(
        default = os.environ['DATABASE_URL'],
        conn_max_age = 600
    )
}