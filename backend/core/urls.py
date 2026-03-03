from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# 1. IMPORTAR A VIEW QUE CRIAMOS AGORA
from store.serializers import CustomTokenObtainPairView 
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
    
    # 2. SUBSTITUIR A VIEW PADRÃO PELA NOSSA
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)