from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsViewSet, CategoryViewSet, ProductViewSet, CustomRequestViewSet

router = DefaultRouter()
router.register(r'settings', SiteSettingsViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'custom-requests', CustomRequestViewSet, basename='customrequest')

urlpatterns = [
    path('', include(router.urls)),
]