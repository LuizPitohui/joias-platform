from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Importe todas as views necessárias
from .views import (
    ProductViewSet, 
    CategoryViewSet, 
    ProductImageViewSet, 
    OrderViewSet  # <--- Não esqueça de importar
)

router = DefaultRouter()
# --- OS REGISTROS FICAM AQUI (FORA DO URLPATTERNS) ---
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'orders', OrderViewSet) 

# --- A LISTA URLPATTERNS FICA AQUI EMBAIXO ---
urlpatterns = [
    path('', include(router.urls)),
]