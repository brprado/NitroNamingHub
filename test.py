import re

def extrair_elementos(texto):
    """
    Extrai todos os elementos entre colchetes de uma string,
    independente do número de caracteres de cada elemento.
    """
    # Encontra todos os elementos entre colchetes usando regex
    elementos = re.findall(r'\[([^\]]*)\]', texto)
    return elementos

def separar_nomenclatura_anuncio(nomenclatura):
    """
    Separa uma nomenclatura de ANÚNCIO no formato padrão em seus componentes.
    a coluna que contem é a coluna ad_id
    Template: [NÚMERO SEQUENCIAL][COPY][REDE][OFERTA][AD][V][H][A.S][EDITOR]
    Retorna um dicionário com os elementos nomeados.
    """
    elementos = extrair_elementos(nomenclatura)
    
    # Verifica se temos o número correto de elementos para anúncios (9)
    if len(elementos) != 9:
        print(f"Aviso: Esperado 9 elementos para anúncio, encontrado {len(elementos)}")
        return None
    
    # Mapeia os elementos para seus nomes
    resultado = {
        'sequencia': elementos[0],
        'copy': elementos[1],
        'rede': elementos[2],
        'oferta': elementos[3],
        'ad': elementos[4],
        'v': elementos[5],
        'h': elementos[6],
        'avatar_tipo': elementos[7],  # A.S ou A.F
        'editor': elementos[8]
    }
    
    return resultado

def separar_nomenclatura_campanha(nomenclatura):
    """
    Separa uma nomenclatura de CAMPANHA no formato padrão em seus componentes.
    A coluna que contem é a coluna campaign_id
    Template: [GESTOR][REDE DE TRÁFEGO][BM][CA][OFERTA][PAÍS][AD][ESTRUTURA][NOME DA CAMPANHA][DATA DO DIA 1 DA CAMPANHA]
    Retorna um dicionário com os elementos nomeados.
    """
    elementos = extrair_elementos(nomenclatura)
    
    # Verifica se temos o número correto de elementos para campanhas (10)
    if len(elementos) != 10:
        print(f"Aviso: Esperado 10 elementos para campanha, encontrado {len(elementos)}")
        return None
    
    # Mapeia os elementos para seus nomes
    resultado = {
        'gestor': elementos[0],
        'rede_trafego': elementos[1],
        'bm': elementos[2],
        'ca': elementos[3],
        'oferta': elementos[4],
        'pais': elementos[5],
        'ad': elementos[6],
        'estrutura': elementos[7],
        'nome_campanha': elementos[8],
        'data_dia_1': elementos[9]
    }
    
    return resultado

# ========================================
# TESTES PARA ANÚNCIOS
# ========================================
print("TEMPLATE DE ANUNCIOS")
template_anuncio = "[NÚMERO SEQUENCIAL][COPY][REDE][OFERTA][AD][V][H][A.S][EDITOR]"
print("Template:", template_anuncio)
print("-" * 80)

# Exemplo original de anúncio
example1 = "[325][AN][FB][BP03][AD11][V1][H01][A02.S][MB]"
print("Exemplo 1 (anúncio):", example1)

resultado1 = separar_nomenclatura_anuncio(example1)
if resultado1:
    for chave, valor in resultado1.items():
        print(f'  {chave.capitalize()}: {valor}')

print("-" * 80)

# Exemplo com elementos de tamanhos diferentes
example2 = "[1000000][MATHEUS][GOOGLE][BLACKFRIDAY2024][ADFACEBOOK99][V123][H999][A999.F][ALEXANDRE]"
print("Exemplo 2 (anúncio - elementos maiores):", example2)

resultado2 = separar_nomenclatura_anuncio(example2)
if resultado2:
    for chave, valor in resultado2.items():
        print(f'  {chave.capitalize()}: {valor}')

print("-" * 80)

# ========================================
# TESTES PARA CAMPANHAS
# ========================================
print("\nTEMPLATE DE CAMPANHAS")
template_campanha = "[GESTOR][REDE DE TRÁFEGO][BM][CA][OFERTA][PAÍS][AD][ESTRUTURA][NOME DA CAMPANHA][DATA DO DIA 1 DA CAMPANHA]"
print("Template:", template_campanha)
print("-" * 80)

# Exemplo de campanha Facebook
campanha1 = "[RL][FB][DIDA][CA01][BP03][US][AD12][111][ASHE01][17/09/2024]"
print("Exemplo 1 (campanha Facebook):", campanha1)

resultado_camp1 = separar_nomenclatura_campanha(campanha1)
if resultado_camp1:
    for chave, valor in resultado_camp1.items():
        print(f'  {chave.capitalize().replace("_", " ")}: {valor}')

print("-" * 80)

# Exemplo de campanha Google
campanha2 = "[ZO][Google][YT][NEXUS][BP03][US][AD12][111][ASHE01][17/09/2024]"
print("Exemplo 2 (campanha Google):", campanha2)

resultado_camp2 = separar_nomenclatura_campanha(campanha2)
if resultado_camp2:
    for chave, valor in resultado_camp2.items():
        print(f'  {chave.capitalize().replace("_", " ")}: {valor}')

print("-" * 80)

# Exemplo de campanha com elementos maiores
campanha3 = "[FERNANDO][FACEBOOK][BUSINESSMANAGER123][CONTAANUNCIO999][BLACKFRIDAYOFFER2024][BRASIL][AD999][1-5-1][CAMPANHADETESTE123][25/12/2024]"
print("Exemplo 3 (campanha - elementos maiores):", campanha3)

resultado_camp3 = separar_nomenclatura_campanha(campanha3)
if resultado_camp3:
    for chave, valor in resultado_camp3.items():
        print(f'  {chave.capitalize().replace("_", " ")}: {valor}')

print("-" * 80)

# ========================================
# FUNÇÃO UNIVERSAL DE TESTE
# ========================================
def testar_nomenclatura_universal(nomenclatura):
    """
    Testa uma nomenclatura e tenta identificar se é de anúncio ou campanha
    baseado no número de elementos.
    """
    print(f"\nTestando: {nomenclatura}")
    elementos = extrair_elementos(nomenclatura)
    print(f"Elementos encontrados: {elementos}")
    print(f"Total de elementos: {len(elementos)}")
    
    if len(elementos) == 9:
        print("Detectado: ANUNCIO (9 elementos)")
        resultado = separar_nomenclatura_anuncio(nomenclatura)
        if resultado:
            print("Separação:")
            for chave, valor in resultado.items():
                print(f"  {chave.capitalize().replace('_', ' ')}: {valor}")
    elif len(elementos) == 10:
        print("Detectado: CAMPANHA (10 elementos)")
        resultado = separar_nomenclatura_campanha(nomenclatura)
        if resultado:
            print("Separação:")
            for chave, valor in resultado.items():
                print(f"  {chave.capitalize().replace('_', ' ')}: {valor}")
    else:
        print(f"Formato nao reconhecido. Esperado 9 (anuncio) ou 10 (campanha) elementos.")
    
    print("-" * 50)

# ========================================
# TESTES ADICIONAIS
# ========================================
print("\n\nTESTES ADICIONAIS")
print("=" * 80)

# Teste anúncio personalizado
separar_nomenclatura_campanha("[LUCAS][INSTAGRAM][BM999][CA999][OFERTA123][CANADA][AD01][1-1-1][TESTECAMPANHA][01/01/2025]")