import random
import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils.text import slugify
from store.models import Category, Product, ProductAttribute, AttributeValue, ProductImage

class Command(BaseCommand):
    help = 'Popula o banco de dados com MUITOS produtos profissionais e imagens corretas'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('💎 Iniciando o "Turbo Seeding"...'))

        # 1. LIMPEZA
        self.stdout.write('🧹 Limpando dados antigos...')
        Product.objects.all().delete()
        Category.objects.all().delete()
        ProductAttribute.objects.all().delete()

        # 2. CONFIGURAÇÃO DE IMAGENS POR CATEGORIA (URLs Reais do Unsplash)
        # Usamos listas para variar as fotos dentro da mesma categoria
        CATEGORY_IMAGES = {
            'Anéis': [
                "https://images.unsplash.com/photo-1605100804763-eb2fc9f3a369?w=600&q=80", # Anel Diamante
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80", # Anel Ouro
                "https://images.unsplash.com/photo-1598560976772-09869696e427?w=600&q=80", # Anel Prata
            ],
            'Colares': [
                "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=600&q=80", # Corrente Ouro
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80", # Colar Prata
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&q=80", # Pingente
            ],
            'Brincos': [
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80", # Brinco Ouro
                "https://images.unsplash.com/photo-1630019852942-f89202989a51?w=600&q=80", # Argola
                "https://images.unsplash.com/photo-1596944924616-b0e1215a8b5e?w=600&q=80", # Ponto de luz
            ],
            'Pulseiras': [
                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80", # Pulseira
                "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80", # Bracelete
            ]
        }
        
        # Cache para não baixar a mesma imagem 50 vezes (Performance)
        image_cache = {}

        def get_image_content(url):
            if url in image_cache:
                return image_cache[url]
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    content = response.content
                    image_cache[url] = content
                    return content
            except Exception:
                return None
            return None

        # 3. CRIAÇÃO DE CATEGORIAS
        self.stdout.write('📂 Criando categorias...')
        
        hierarchy = {
            'Anéis': ['Solitários', 'Noivado', 'Formatura', 'Falange', 'Alianças'],
            'Colares': ['Correntes', 'Pingentes', 'Gargantilhas', 'Chokers'],
            'Brincos': ['Argolas', 'Cascata', 'Ponto de Luz', 'Ear Cuff'],
            'Pulseiras': ['Riviera', 'Braceletes', 'Berloques'],
        }

        all_subcategories = []

        for parent_name, subcats in hierarchy.items():
            parent = Category.objects.create(name=parent_name, slug=slugify(parent_name))
            for sub_name in subcats:
                child_slug = slugify(f"{parent_name}-{sub_name}")
                child = Category.objects.create(name=sub_name, slug=child_slug, parent=parent)
                # Guardamos também o nome do pai para saber qual foto usar
                child.parent_name_ref = parent_name 
                all_subcategories.append(child)

        # 4. ATRIBUTOS
        self.stdout.write('⚙️ Criando atributos...')
        attr_material = ProductAttribute.objects.create(name="Material", slug="material")
        materials = ["Ouro Amarelo 18k", "Prata 925", "Ouro Branco", "Rose Gold", "Ródio Negro"]
        vals_material = [AttributeValue.objects.create(attribute=attr_material, value=m) for m in materials]

        attr_stone = ProductAttribute.objects.create(name="Pedra", slug="pedra")
        stones = ["Diamante", "Zircônia", "Rubi", "Safira", "Esmeralda", "Sem Pedra"]
        vals_stone = [AttributeValue.objects.create(attribute=attr_stone, value=s) for s in stones]

        attr_aro = ProductAttribute.objects.create(name="Aro", slug="aro")
        vals_aro = [AttributeValue.objects.create(attribute=attr_aro, value=str(i)) for i in range(10, 26, 2)]

        # 5. GERADOR DE PRODUTOS
        self.stdout.write('🔨 Fabricando produtos...')

        collections = ["Coleção Aurora", "Linha Imperial", "Coleção Vivere", "Linha Minimal", "Royal Edition", "Eternity", "Classic"]
        adjectives = ["Delicado", "Luxuoso", "Moderno", "Vintage", "Sofisticado", "Radiante"]
        
        # QUANTIDADE DE PRODUTOS A GERAR
        TOTAL_PRODUCTS = 120 

        for i in range(TOTAL_PRODUCTS):
            cat = random.choice(all_subcategories)
            parent_name = getattr(cat, 'parent_name_ref', 'Anéis') # Default fallback
            
            material = random.choice(vals_material)
            stone = random.choice(vals_stone)
            collection = random.choice(collections)
            
            # --- Gerador de Nome Profissional ---
            # Ex: "Anel Solitário Coleção Aurora em Ouro Branco com Diamante"
            if stone.value == "Sem Pedra":
                name = f"{cat.name} {random.choice(adjectives)} {collection} em {material.value}"
            else:
                name = f"{cat.name} {collection} em {material.value} com {stone.value}"
            
            # Garante unicidade do nome caso o random repita
            name = f"{name} #{random.randint(100, 9999)}"

            # Preço psicológico (ex: 299.90)
            base_price = float(random.randint(150, 8000)) + 0.90
            is_promo = random.random() > 0.8 # 20% de chance de promoção
            promo_price = base_price * 0.85 if is_promo else None

            # Descrição Rica
            description = (
                f"Descubra a elegância do {name}. Uma peça exclusiva da nossa {collection}, "
                f"forjada em {material.value} de alta pureza. "
                f"{'Detalhado com ' + stone.value + ' autêntica.' if stone.value != 'Sem Pedra' else 'Acabamento polido de alto brilho.'} "
                "Perfeito para eternizar momentos especiais. Garantia vitalícia e certificado de autenticidade incluso."
            )

            product = Product.objects.create(
                name=name,
                slug=slugify(name),
                category=cat,
                description=description,
                base_price=base_price,
                promotional_price=promo_price,
                is_featured=random.choice([True, False, False]), # Menos chance de ser destaque
                is_active=True
            )

            # Adiciona Atributos
            product.attributes.add(material)
            product.attributes.add(stone)
            
            # Se for anel, adiciona tamanhos
            if parent_name == "Anéis":
                # Adiciona 4 ou 5 tamanhos aleatórios disponíveis
                for tamanho in random.sample(vals_aro, k=random.randint(3, 6)):
                    product.attributes.add(tamanho)

            # --- IMAGEM INTELIGENTE ---
            # Escolhe uma URL baseada na categoria pai (Anéis pegam fotos de Anéis)
            possible_images = CATEGORY_IMAGES.get(parent_name, CATEGORY_IMAGES['Anéis'])
            image_url = random.choice(possible_images)
            
            img_content = get_image_content(image_url)
            
            if img_content:
                img_name = f"product_{product.id}_{random.randint(1,1000)}.jpg"
                prod_img = ProductImage(product=product, is_cover=True)
                # Salva usando o conteúdo da memória
                prod_img.image.save(img_name, File(BytesIO(img_content)), save=True)
            
            if (i + 1) % 10 == 0:
                self.stdout.write(f"   ... {i + 1} jóias criadas")

        self.stdout.write(self.style.SUCCESS(f'✨ Sucesso! {TOTAL_PRODUCTS} produtos profissionais criados.'))