from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- 1. USUÁRIO PERSONALIZADO ---
class User(AbstractUser):
    """
    Usuário estendido para suportar CPF e Telefone.
    """
    cpf = models.CharField(max_length=14, unique=True, blank=True, null=True, help_text="Formato: 000.000.000-00")
    phone = models.CharField(max_length=20, blank=True, null=True, help_text="WhatsApp ou Celular")
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username

# (AQUI EU REMOVI A CLASSE ADDRESS ANTIGA QUE CAUSAVA O ERRO)

# --- 2. CONFIGURAÇÃO DO SITE (PAINEL DO DONO) ---
class SiteSettings(models.Model):
    """
    Permite que o dono edite o site sem tocar no código.
    """
    site_name = models.CharField(max_length=100, default="Minha Joalheria")
    logo = models.ImageField(upload_to='site_config/', blank=True, null=True)
    
    # Cores
    primary_color = models.CharField(max_length=7, default="#000000", help_text="Código Hex (ex: #000000)")
    secondary_color = models.CharField(max_length=7, default="#D4AF37", help_text="Cor secundária (ex: Dourado #D4AF37)")
    
    # Redes Sociais
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, help_text="Apenas números")

    # Jurídico
    terms_of_use = models.TextField("Termos de Uso", blank=True)
    
    class Meta:
        verbose_name = "Configuração do Site"
        verbose_name_plural = "Configuração do Site"

    def __str__(self):
        return f"Configuração: {self.site_name}"

# --- 3. ESTRUTURA DE PRODUTOS E CATEGORIAS ---

class Category(models.Model):
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
    name = models.CharField(max_length=50) # Ex: Material
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class AttributeValue(models.Model):
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
    attributes = models.ManyToManyField(AttributeValue, blank=True, related_name='products')
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Destaque na Home")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_cover = models.BooleanField(default=False, help_text="Foto principal?")

    def __str__(self):
        return f"Imagem de {self.product.name}"

# --- 4. PEDIDOS ---
class CustomRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField("Descrição do Pedido")
    reference_image = models.ImageField(upload_to='custom_requests/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pendente', choices=[
        ('Pendente', 'Pendente'),
        ('Em Analise', 'Em Análise'),
        ('Aprovado', 'Aprovado'),
        ('Rejeitado', 'Rejeitado')
    ])

    def __str__(self):
        return f"Pedido de {self.user.username}"
    
class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('paid', 'Pago'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregue'),
        ('canceled', 'Cancelado'),
    )

    # Cliente é opcional (null=True) para permitir Compras como Visitante no futuro
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Dados do Visitante (para quando não tem customer)
    guest_name = models.CharField(max_length=255, blank=True, null=True)
    guest_email = models.EmailField(blank=True, null=True)

    # CORREÇÃO PRINCIPAL: O endereço deve ser TEXTO para gravar o histórico
    address = models.TextField(verbose_name="Endereço de Entrega") 
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido {self.id} - {self.guest_name or self.customer}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
# --- 5. PERFIL E ENDEREÇOS ---

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_phone_verified = models.BooleanField(default=False)
    address = models.TextField(blank=True, null=True)
    verification_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

# ESTA É A VERSÃO CORRETA DA CLASS ADDRESS (A MAIS COMPLETA)
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    name = models.CharField(max_length=50, default="Casa") 
    zip_code = models.CharField(max_length=9)
    street = models.CharField(max_length=200)
    neighborhood = models.CharField(max_length=100) # (Antes era district, agora é neighborhood)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    number = models.CharField(max_length=20)
    complement = models.CharField(max_length=100, blank=True, null=True)
    reference_point = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.zip_code}"

# Signals
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()