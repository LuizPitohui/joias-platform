from rest_framework import serializers
from .models import User, Address, SiteSettings, Category, Product, ProductImage, ProductAttribute, AttributeValue, CustomRequest

# --- CONFIGURAÇÃO DO SITE ---
class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

# --- USUÁRIOS E ENDEREÇOS ---
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'cpf', 'phone', 'addresses']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# --- CATEGORIAS ---
class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        # Recursividade para pegar os filhos
        children = obj.subcategories.all()
        return CategorySerializer(children, many=True).data

# --- PRODUTOS ---
class AttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute.name', read_only=True)

    class Meta:
        model = AttributeValue
        fields = ['id', 'attribute', 'attribute_name', 'value']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_cover']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    attributes = AttributeValueSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 
            'base_price', 'promotional_price', 
            'category', 'category_name',
            'attributes', 'images', 
            'is_active', 'is_featured'
        ]

# --- PEDIDOS PERSONALIZADOS ---
class CustomRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CustomRequest
        fields = '__all__'
        read_only_fields = ['user'] # O usuário é pego automaticamente do login