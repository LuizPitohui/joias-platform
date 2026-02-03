from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, SendSMSCodeView, VerifySMSCodeView, UserMeView
from .views import (
    ProductViewSet, 
    CategoryViewSet, 
    ProductImageViewSet, 
    OrderViewSet,
    AddressViewSet
)

router = DefaultRouter()

# --- REGISTROS DO ROUTER ---
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'addresses', AddressViewSet, basename='address')

# --- URLPATTERNS ---
urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('send-sms/', SendSMSCodeView.as_view(), name='send_sms'),
    path('verify-sms/', VerifySMSCodeView.as_view(), name='verify_sms'),
    path('users/me/', UserMeView.as_view(), name='user_me'),
]