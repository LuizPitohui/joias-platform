from rest_framework import serializers
from .models import User, Address, SiteSettings, Category, Product, ProductImage, ProductAttribute, AttributeValue, CustomRequest, Order, OrderItem


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
        # ADICIONEI 'show_on_home' NA LISTA ABAIXO
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

# --- CAMPO: Para receber o upload ---
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

# --- MÉTODO MÁGICO: Sobrescreve a criação padrão ---
    def create(self, validated_data):
        # 1. Separa as imagens dos dados do produto
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # 2. Cria o produto normalmente (Nome, Preço, etc)
        product = Product.objects.create(**validated_data)

        # 3. Agora cria as imagens vinculadas a esse produto
        for image in uploaded_images:
            ProductImage.objects.create(product=product, image=image)

# --- MÉTODO: Sobrescreve a atualização ---
        return product
    def update(self, instance, validated_data):
        # 1. Tira as imagens da validação (se houver)
        uploaded_images = validated_data.pop('uploaded_images', None)

        # 2. Atualiza os campos normais (nome, preço, etc)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3. Se o usuário mandou imagens novas, adiciona elas
        if uploaded_images:
            # Opcional: Se quiser que substitua a foto antiga, descomente a linha abaixo:
            # instance.images.all().delete() 
            
            for image in uploaded_images:
                ProductImage.objects.create(product=instance, image=image)

        return instance

# --- PEDIDOS PERSONALIZADOS ---
class CustomRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CustomRequest
        fields = '__all__'
        read_only_fields = ['user'] # O usuário é pego automaticamente do login

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']

    def get_product_image(self, obj):
        # Tenta pegar a primeira imagem do produto
        img = obj.product.images.first()
        if img:
            return img.image.url # Retorna a URL completa
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    # Campo para receber os dados dos itens na criação (Write Only)
    # Esperamos uma lista de dicionários: [{'product_id': 1, 'quantity': 2, 'price': 100}, ...]
    items_data = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'guest_name', 'guest_email', 'status', 'total', 'created_at', 'address', 'items', 'items_data']
        extra_kwargs = {
            'customer': {'read_only': True} # O backend define o user, não o frontend
        }

    def create(self, validated_data):
        # 1. Separa os dados dos itens
        items_payload = validated_data.pop('items_data', [])
        
        # 2. Pega o usuário logado (se houver) do contexto da requisição
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['customer'] = request.user
            # Se logado, usa o email/nome do cadastro como fallback se não vier no payload
            if not validated_data.get('guest_email'):
                validated_data['guest_email'] = request.user.email

        # 3. Cria o Pedido
        order = Order.objects.create(**validated_data)

        # 4. Cria os Itens do Pedido
        for item in items_payload:
            # O frontend manda 'product_id', precisamos pegar a instância do produto
            product = Product.objects.get(id=item['product_id'])
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price'] # Salvamos o preço da época da compra
            )
        
        return order