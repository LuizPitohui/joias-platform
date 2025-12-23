from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, SendSMSCodeView, VerifySMSCodeView
# Importe todas as views necessárias
from .views import (
    ProductViewSet, 
    CategoryViewSet, 
    ProductImageViewSet, 
    OrderViewSet,
    UserMeView,
    AddressViewSet
)

router = DefaultRouter()
# --- OS REGISTROS FICAM AQUI (FORA DO URLPATTERNS) ---
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'addresses', AddressViewSet, basename='address') # basename é importante aqui

# --- A LISTA URLPATTERNS FICA AQUI EMBAIXO ---
urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('send-sms/', SendSMSCodeView.as_view(), name='send_sms'),
    path('verify-sms/', VerifySMSCodeView.as_view(), name='verify_sms'),
    path('users/me/', UserMeView.as_view(), name='user_me'),
]