from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

# --- 1. USUÁRIO PERSONALIZADO ---
class User(AbstractUser):
    """
    Usuário estendido para suportar CPF e Telefone.
    O endereço será uma tabela separada para suportar múltiplos endereços se necessário.
    """
    cpf = models.CharField(max_length=14, unique=True, blank=True, null=True, help_text="Formato: 000.000.000-00")
    phone = models.CharField(max_length=20, blank=True, null=True, help_text="WhatsApp ou Celular")
    
    # Campos obrigatórios padrão do Django
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username

class Address(models.Model):
    """Endereço vinculado ao usuário para entregas."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField("Rua", max_length=255)
    number = models.CharField("Número", max_length=20)
    complement = models.CharField("Complemento", max_length=100, blank=True)
    district = models.CharField("Bairro", max_length=100)
    city = models.CharField("Cidade", max_length=100)
    state = models.CharField("Estado", max_length=2)
    zip_code = models.CharField("CEP", max_length=10)
    
    def __str__(self):
        return f"{self.street}, {self.number} - {self.city}"

# --- 2. CONFIGURAÇÃO DO SITE (PAINEL DO DONO) ---
class SiteSettings(models.Model):
    """
    Permite que o dono edite o site sem tocar no código.
    Padrão Singleton: Só deve existir 1 registro dessa tabela.
    """
    site_name = models.CharField(max_length=100, default="Minha Joalheria")
    logo = models.ImageField(upload_to='site_config/', blank=True, null=True)
    
    # Cores do tema (Frontend vai ler isso)
    primary_color = models.CharField(max_length=7, default="#000000", help_text="Código Hex (ex: #000000)")
    secondary_color = models.CharField(max_length=7, default="#D4AF37", help_text="Cor secundária (ex: Dourado #D4AF37)")
    
    # Redes Sociais
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, help_text="Apenas números para o link direto")

    # Jurídico
    terms_of_use = models.TextField("Termos de Uso", blank=True)
    
    class Meta:
        verbose_name = "Configuração do Site"
        verbose_name_plural = "Configuração do Site"

    def __str__(self):
        return f"Configuração: {self.site_name}"

# --- 3. ESTRUTURA DE PRODUTOS E CATEGORIAS ---

class Category(models.Model):
    """
    Categorias com auto-relacionamento.
    Ex: Anéis (Pai) -> Anéis de Formatura (Filho)
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    show_on_home = models.BooleanField(default=False, verbose_name="Mostrar na Página Inicial")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
            return self.name

class ProductAttribute(models.Model):
    """
    Define o NOME do atributo. Ex: 'Material', 'Pedra', 'Cor do Cristal'.
    Isso permite criar filtros dinâmicos no frontend.
    """
    name = models.CharField(max_length=50) # Ex: Material
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class AttributeValue(models.Model):
    """
    Define o VALOR do atributo. Ex: 'Ouro 18k', 'Prata 925', 'Rubi'.
    """
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE, related_name='values')
    value = models.CharField(max_length=50) # Ex: Ouro 18k
    
    def __str__(self):
        return f"{self.attribute.name}: {self.value}"

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    promotional_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    
    # Aqui está a mágica dos filtros. Um produto pode ter vários atributos.
    # Ex: Anel X tem (Material: Ouro) E (Pedra: Esmeralda)
    attributes = models.ManyToManyField(AttributeValue, blank=True, related_name='products')
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Se marcado, aparece na lista de Novidades/Destaques")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    """Permite múltiplas fotos para o mesmo produto"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_cover = models.BooleanField(default=False, help_text="É a foto principal?")

    def __str__(self):
        return f"Imagem de {self.product.name}"

# --- 4. PEDIDOS PERSONALIZADOS ---
class CustomRequest(models.Model):
    """Para o formulário de 'Orçamento Direto/Login Requerido'"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField("Descrição do Pedido")
    reference_image = models.ImageField(upload_to='custom_requests/', blank=True, null=True, help_text="Foto de referência do cliente")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pendente', choices=[
        ('Pendente', 'Pendente'),
        ('Em Analise', 'Em Análise'),
        ('Aprovado', 'Aprovado'),
        ('Rejeitado', 'Rejeitado')
    ])

    def __str__(self):
        return f"Pedido de {self.user.username} - {self.status}"
    
class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('paid', 'Pago'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregue'),
        ('cancelled', 'Cancelado'),
    )

    # Relaciona com o Usuário (Cliente)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Dados do Pedido
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Endereço (Simplificado para o exemplo)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Pedido #{self.id} - {self.customer.email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Preço no momento da compra

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"