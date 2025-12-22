from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, SiteSettings, Category, Product, CustomRequest
from .serializers import (
    UserSerializer, SiteSettingsSerializer, CategorySerializer, 
    ProductSerializer, CustomRequestSerializer
)

# --- PERMISSÃO PERSONALIZADA ---
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite leitura para todos, mas escrita apenas para admin.
    Isso é vital para a segurança da loja pública.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff

# --- VIEWS ---

class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminOrReadOnly] # Só admin muda a logo

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(parent=None) # Traz só as categorias raiz na lista principal
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug' # Vamos buscar produtos pelo nome na URL (SEO)

    # Admin vê tudo, inclusive inativos
    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(is_active=True)

class CustomRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CustomRequestSerializer
    permission_classes = [permissions.IsAuthenticated] # Tem que estar logado

    def get_queryset(self):
        # Usuário normal vê só os seus pedidos. Admin vê todos.
        if self.request.user.is_staff:
            return CustomRequest.objects.all()
        return CustomRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)