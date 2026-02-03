from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User, Address, SiteSettings, Category, Product, ProductImage, AttributeValue, CustomRequest, Order, OrderItem

# --- CONFIGURAÇÃO DO SITE ---
class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

# --- ENDEREÇOS (Definido antes de User para poder ser usado nele) ---
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'name', 'zip_code', 'street', 'neighborhood', 
            'city', 'state', 'number', 'complement', 'reference_point'
        ]

# --- USUÁRIOS ---
class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'cpf', 'phone', 'addresses']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# --- REGISTRO DE USUÁRIO ---
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    phone = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'phone')
    
    def validate_password(self, value):
        import re
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("A senha deve ter pelo menos uma letra maiúscula.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("A senha deve ter pelo menos uma letra minúscula.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("A senha deve ter pelo menos um número.")
        # if not re.search(r'[@$!%*?&#]', value):
        #     raise serializers.ValidationError("A senha deve ter pelo menos um caractere especial.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        # Força minúsculo no email/username para evitar duplicidade e erro de login
        email_lower = validated_data['email'].lower()
        
        user = User.objects.create(
            username=email_lower,
            email=email_lower,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        if phone:
            user.profile.phone = phone
            user.profile.save()
            
        return user

# --- CATEGORIAS ---
class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'parent', 'show_on_home', 'subcategories']

    def get_subcategories(self, obj):
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
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 
            'base_price', 'promotional_price', 
            'category', 'category_name',
            'attributes', 'images',
            'uploaded_images', 
            'is_active', 'is_featured'
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        product = Product.objects.create(**validated_data)
        for image in uploaded_images:
            ProductImage.objects.create(product=product, image=image)
        return product

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if uploaded_images:
            for image in uploaded_images:
                ProductImage.objects.create(product=instance, image=image)
        return instance

# --- PEDIDOS PERSONALIZADOS ---
class CustomRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CustomRequest
        fields = '__all__'
        read_only_fields = ['user']

# --- PEDIDOS ---
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']

    def get_product_image(self, obj):
        img = obj.product.images.first()
        if img:
            return img.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_data = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'guest_name', 'guest_email', 'status', 'total', 'created_at', 'address', 'items', 'items_data']
        extra_kwargs = {
            'customer': {'read_only': True}
        }

    def create(self, validated_data):
        items_payload = validated_data.pop('items_data', [])
        request = self.context.get('request')
        
        # Define o cliente se estiver logado
        if request and request.user.is_authenticated:
            validated_data['customer'] = request.user
            if not validated_data.get('guest_email'):
                validated_data['guest_email'] = request.user.email

        order = Order.objects.create(**validated_data)

        # Cria os itens
        for item in items_payload:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price']
            )
        return order