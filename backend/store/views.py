from django.shortcuts import render
from django.db.models import Q 
from django_filters.rest_framework import DjangoFilterBackend
# CORREÇÃO: Adicionei 'filters' aqui na lista de imports
from rest_framework import viewsets, permissions, status, filters 
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, SiteSettings, Category, Product, CustomRequest, ProductImage, Order
from .serializers import (
    UserSerializer, SiteSettingsSerializer, CategorySerializer, 
    ProductSerializer, CustomRequestSerializer, ProductImageSerializer, OrderSerializer
)
#logica para verificacao de sms
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
import random
from .serializers import RegistrationSerializer

# --- PERMISSÃO PERSONALIZADA ---
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite leitura para todos, mas escrita apenas para admin.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_staff

# --- VIEWS ---

class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    # --- MUDANÇA CRÍTICA AQUI ---
    # Antes estava: queryset = Category.objects.all()
    # Agora: Pegamos apenas quem NÃO tem pai (parent__isnull=True)
    queryset = Category.objects.filter(parent__isnull=True)
    
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['show_on_home', 'slug']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    # AGORA VAI FUNCIONAR: 'filters' foi importado lá em cima
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    filterset_fields = {
        'category__slug': ['exact'],
        'promotional_price': ['isnull', 'lt'], 
        'base_price': ['lt', 'gt'],
        'attributes__value': ['exact'],
    }
    
    ordering_fields = ['id', 'base_price', 'created_at'] 
    search_fields = ['name', 'description']

class CustomRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CustomRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CustomRequest.objects.all()
        return CustomRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# NOVA VIEWSET
class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminOrReadOnly]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at') # Mais recentes primeiro
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrReadOnly] 
    
    # Filtros úteis para o painel
    filterset_fields = ['status', 'customer__email']
    search_fields = ['id', 'customer__email']


# View de Registro
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer

# View para Enviar Código SMS (Fake)
class SendSMSCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        phone = request.data.get('phone')
        
        if phone:
            user.profile.phone = phone
            user.profile.save()

        # Gera código de 6 dígitos
        code = str(random.randint(100000, 999999))
        user.profile.verification_code = code
        user.profile.save()

        # --- LÓGICA DO SMS FAKE ---
        print("\n" + "="*30)
        print(f"📱 [SMS FAKE] Para: {user.profile.phone}")
        print(f"🔑 CÓDIGO: {code}")
        print("="*30 + "\n")
        # --------------------------

        return Response({"message": "Código enviado (verifique o console do servidor)"})

# View para Verificar Código
class VerifySMSCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        user = request.user

        if user.profile.verification_code == code:
            user.profile.is_phone_verified = True
            user.profile.verification_code = None # Limpa o código
            user.profile.save()
            return Response({"message": "Telefone verificado com sucesso!"})
        
        return Response({"error": "Código inválido"}, status=status.HTTP_400_BAD_REQUEST)