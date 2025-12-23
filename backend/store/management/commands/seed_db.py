import random
import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils.text import slugify
from store.models import Category, Product, ProductAttribute, AttributeValue, ProductImage

class Command(BaseCommand):
    help = 'Povoa o banco de dados com dados de teste (Mock Data)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('A iniciar o processo de Seeding...'))

        # 1. Limpeza
        self.stdout.write('A limpar dados antigos...')
        Product.objects.all().delete()
        Category.objects.all().delete()
        ProductAttribute.objects.all().delete()
        
        # 2. Criar Hierarquia de Categorias
        self.stdout.write('A criar categorias e subcategorias...')
        
        # Estrutura: Pai -> Lista de Filhos
        hierarchy = {
            'Anéis': ['Solitários', 'Noivado', 'Formatura', 'Falange'],
            'Colares': ['Correntes', 'Pingentes', 'Gargantilhas'],
            'Brincos': ['Argolas', 'Cascata', 'Ponto de Luz'],
            'Pulseiras': ['Riviera', 'Braceletes'],
            'Alianças': ['Casamento', 'Compromisso']
        }

        all_categories = [] # Lista para guardar todas (pai e filho) para associar produtos depois

        for parent_name, subcats in hierarchy.items():
            # Cria o Pai
            parent = Category.objects.create(name=parent_name, slug=slugify(parent_name))
            all_categories.append(parent)
            
            # Cria os Filhos
            for sub_name in subcats:
                # O slug do filho deve ser unico, ex: anel-solitario
                child_slug = slugify(f"{parent_name} {sub_name}")
                child = Category.objects.create(name=sub_name, slug=child_slug, parent=parent)
                all_categories.append(child)

        # 3. Criar Atributos
        self.stdout.write('A criar atributos...')
        
        attr_material = ProductAttribute.objects.create(name="Material", slug="material")
        vals_material = [
            AttributeValue.objects.create(attribute=attr_material, value="Ouro 18k"),
            AttributeValue.objects.create(attribute=attr_material, value="Prata 925"),
            AttributeValue.objects.create(attribute=attr_material, value="Ouro Branco"),
            AttributeValue.objects.create(attribute=attr_material, value="Ouro Rosé"),
        ]

        attr_aro = ProductAttribute.objects.create(name="Aro", slug="aro")
        vals_aro = []
        for i in range(12, 24, 2): 
            vals_aro.append(AttributeValue.objects.create(attribute=attr_aro, value=str(i)))

        # 4. Criar Produtos
        self.stdout.write('A criar produtos...')
        
        adjetivos = ['Eterno', 'Radiante', 'Clássico', 'Moderno', 'Luxuoso', 'Delicado', 'Real', 'Imperial']
        
        image_urls = [
            "https://images.unsplash.com/photo-1605100804763-eb2fc9f3a369?w=500&q=80",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80",
            "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&q=80",
            "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=500&q=80",
        ]

        # Vamos criar 30 produtos agora para encher bem
        for i in range(30):
            cat = random.choice(all_categories)
            
            # Nome mais inteligente baseado na categoria
            base_name = cat.name 
            if cat.parent: # Se for subcategoria, usa o nome do pai junto para ficar bonito (ex: Anel Solitário)
                base_name = f"{cat.parent.name[:-1]} {cat.name}"
            elif base_name.endswith('s'):
                base_name = base_name[:-1]

            nome = f"{base_name} {random.choice(adjetivos)} #{i+1}"
            
            price = random.randint(150, 5000)
            
            product = Product.objects.create(
                name=nome,
                category=cat,
                description=f"Uma peça exclusiva. Este {nome.lower()} é a definição de elegância. Garantia vitalícia.",
                base_price=price,
                promotional_price=price * 0.9 if random.random() > 0.7 else None,
                is_featured=random.choice([True, False])
            )

            product.attributes.add(random.choice(vals_material))
            
            # Lógica simples para adicionar tamanho se parecer ser um anel
            cat_check = cat.name.lower()
            parent_check = cat.parent.name.lower() if cat.parent else ""
            
            if 'an' in cat_check or 'aliança' in cat_check or 'an' in parent_check or 'aliança' in parent_check:
                for tamanho in random.sample(vals_aro, 3):
                    product.attributes.add(tamanho)

            try:
                img_url = random.choice(image_urls)
                response = requests.get(img_url, timeout=5)
                if response.status_code == 200:
                    img_temp = BytesIO(response.content)
                    prod_img = ProductImage(product=product, is_cover=True)
                    prod_img.image.save(f"image_{i}.jpg", File(img_temp), save=True)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Erro imagem: {e}"))

            self.stdout.write(f"Produto criado: {product.name}")

        self.stdout.write(self.style.SUCCESS('Banco de dados com subcategorias criado! 💎'))