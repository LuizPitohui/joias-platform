import random
from datetime import timedelta

# --- IMPORTS DO DJANGO ---
from django.db.models import Q, Sum
from django.utils import timezone
from django.shortcuts import render

# --- IMPORTS DO DJANGO REST FRAMEWORK ---
from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

# --- IMPORTS LOCAIS (MODELS & SERIALIZERS) ---
from .models import (
    User, SiteSettings, Category, Product, CustomRequest, 
    ProductImage, Order, Address, FAQ
)
from .serializers import (
    UserSerializer, SiteSettingsSerializer, CategorySerializer, 
    ProductSerializer, CustomRequestSerializer, ProductImageSerializer, 
    OrderSerializer, AddressSerializer, FAQSerializer, RegistrationSerializer
)


# ==========================================
# PERMISSÕES CUSTOMIZADAS
# ==========================================
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite leitura para todos, mas escrita apenas para admin.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff


# ==========================================
# VIEWS DE CATÁLOGO E CONFIGURAÇÕES
# ==========================================
class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    # Pega apenas quem NÃO tem pai (categorias principais)
    queryset = Category.objects.filter(parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['show_on_home', 'slug']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    filterset_fields = {
        'category__slug': ['exact'],
        'promotional_price': ['isnull', 'lt'], 
        'base_price': ['lt', 'gt'],
        'attributes__value': ['exact'],
    }
    
    ordering_fields = ['id', 'base_price', 'created_at'] 
    search_fields = ['name', 'description']

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]

class FAQListView(generics.ListAPIView):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]


# ==========================================
# VIEWS DE PEDIDOS E SOLICITAÇÕES
# ==========================================
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(customer=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class CustomRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CustomRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CustomRequest.objects.all()
        return CustomRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ==========================================
# VIEWS DE USUÁRIO E AUTENTICAÇÃO
# ==========================================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "phone": user.profile.phone if hasattr(user, 'profile') else None
        })

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ==========================================
# VIEWS DE VERIFICAÇÃO (SMS)
# ==========================================
class SendSMSCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        phone = request.data.get('phone')
        
        if phone:
            user.profile.phone = phone
            user.profile.save()

        code = str(random.randint(100000, 999999))
        user.profile.verification_code = code
        user.profile.save()

        print("\n" + "="*30)
        print(f"📱 [SMS FAKE] Para: {user.profile.phone}")
        print(f"🔑 CÓDIGO: {code}")
        print("="*30 + "\n")

        return Response({"message": "Código enviado (verifique o console do servidor)"})

class VerifySMSCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        user = request.user

        if user.profile.verification_code == code:
            user.profile.is_phone_verified = True
            user.profile.verification_code = None
            user.profile.save()
            return Response({"message": "Telefone verificado com sucesso!"})
        
        return Response({"error": "Código inválido"}, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# ADMIN DASHBOARD
# ==========================================
class DashboardStatsView(APIView):
    """
    Retorna métricas e dados de faturamento para o Dashboard do Admin (Next.js).
    """
    permission_classes = [IsAdminUser] 

    def get(self, request):
        today = timezone.now().date()
        
        # Consideramos válidos os pedidos que não estão cancelados ou aguardando pagamento
        pedidos_validos = Order.objects.exclude(status__in=['canceled', 'pending'])
        
        # 1. Vendas Hoje
        hoje_orders = pedidos_validos.filter(created_at__date=today)
        vendas_hoje = hoje_orders.aggregate(total=Sum('total'))['total'] or 0
        
        # 2. Total de Pedidos (Geral, excluindo apenas os cancelados)
        pedidos_total = Order.objects.exclude(status='canceled').count()
        
        # 3. Produtos Ativos no Catálogo
        produtos_ativos = Product.objects.filter(is_active=True).count()
        
        # 4. Ticket Médio
        vendas_totais = pedidos_validos.aggregate(total=Sum('total'))['total'] or 0
        pedidos_pagos_count = pedidos_validos.count()
        ticket_medio = (vendas_totais / pedidos_pagos_count) if pedidos_pagos_count > 0 else 0

        # 5. Gráfico de Faturamento: Últimos 7 dias
        grafico = []
        for i in range(6, -1, -1):
            dia = today - timedelta(days=i)
            total_dia = pedidos_validos.filter(created_at__date=dia).aggregate(t=Sum('total'))['t'] or 0
            grafico.append({
                "name": dia.strftime("%d/%m"),
                "total": float(total_dia)
            })

        return Response({
            "vendas_hoje": float(vendas_hoje),
            "pedidos_total": pedidos_total,
            "produtos_ativos": produtos_ativos,
            "ticket_medio": float(ticket_medio),
            "chart_data": grafico
        })