from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address, SiteSettings, Category, ProductAttribute, AttributeValue, Product, ProductImage, CustomRequest

# --- 1. CONFIGURAÇÃO DE USUÁRIO ---
admin.site.register(User, UserAdmin)
admin.site.register(Address)

# --- 2. CONFIGURAÇÃO GERAL DO SITE ---
@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin): # CORRIGIDO AQUI
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

# --- 3. ATRIBUTOS E VALORES ---
class AttributeValueInline(admin.TabularInline):
    model = AttributeValue
    extra = 1

@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin): # CORRIGIDO AQUI
    inlines = [AttributeValueInline]
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

# --- 4. CATEGORIAS ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin): # CORRIGIDO AQUI
    list_display = ('name', 'parent', 'slug')
    list_filter = ('parent',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

# --- 5. PRODUTOS ---
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin): # CORRIGIDO AQUI
    list_display = ('name', 'base_price', 'category', 'is_active', 'is_featured')
    list_filter = ('category', 'is_active', 'is_featured', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    filter_horizontal = ('attributes',)

# --- 6. PEDIDOS PERSONALIZADOS ---
@admin.register(CustomRequest)
class CustomRequestAdmin(admin.ModelAdmin): # CORRIGIDO AQUI
    list_display = ('user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    readonly_fields = ('user', 'description', 'reference_image')