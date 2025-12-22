from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls), # Mantemos o admin só para nós desenvolvedores (debug)
    path('api/', include('store.urls')), # Nossa API fica em /api/...
]

# Configuração para servir as imagens durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)