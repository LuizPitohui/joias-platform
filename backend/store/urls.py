from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, SendSMSCodeView, VerifySMSCodeView, UserMeView, FAQListView
from .views import (
    ProductViewSet, 
    CategoryViewSet, 
    ProductImageViewSet, 
    OrderViewSet,
    AddressViewSet,
    DashboardStatsView,
    ProductAttributeViewSet, 
    ProductAttributeValueViewSet,
    UserViewSet,
    SiteSettingsViewSet
)

router = DefaultRouter()

# --- REGISTROS DO ROUTER ---
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'product-attributes', ProductAttributeViewSet)
router.register(r'attribute-values', ProductAttributeValueViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'settings', SiteSettingsViewSet, basename='settings')

# --- URLPATTERNS ---
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('send-sms/', SendSMSCodeView.as_view(), name='send_sms'),
    path('verify-sms/', VerifySMSCodeView.as_view(), name='verify_sms'),
    path('users/me/', UserMeView.as_view(), name='user_me'),
    path('faqs/', FAQListView.as_view(), name='faq-list'),
    path('admin/dashboard/stats/', DashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('', include(router.urls)),
]