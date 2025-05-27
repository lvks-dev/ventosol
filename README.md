# VentoSol

## Descrição

O **VentoSol** é uma ferramenta online desenvolvida para comparar a viabilidade da energia solar e eólica, ajudando consumidores a escolherem a melhor fonte de energia renovável com base em suas localizações e objetivos. O projeto foi desenvolvido como um MVP para a faculdade, seguindo os parâmetros do **ODS 7** - Energia Limpa e Acessível, visando fornecer uma alternativa inteligente e personalizada para o planejamento energético sustentável.

## Objetivos

- Comparar as duas principais fontes de energia renovável: solar e eólica.
- Oferecer uma análise comparativa baseada em dados climáticos locais (vento e sol).
- Ajudar o usuário a tomar decisões mais informadas sobre qual matriz energética utilizar para o seu objetivo específico.

## Tecnologias Utilizadas

- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: (não utilizado neste MVP)
- **Deploy**: Vercel, GitHub
- **Gráficos**: Recharts (opcional, para exibição de dados interativos)
- **APIs**: OpenWeatherMap (para dados climáticos)

## Funcionalidades

1. **Tela Principal**: Apresenta informações gerais sobre o VentoSol.
2. **Comparação de Energias**: A plataforma permite comparar a energia solar e eólica com base na localização do usuário.
3. **Painel Interativo**: Mostra como diferentes condições climáticas impactam a geração de energia renovável.
4. **Mapa de Localização**: Permite ao usuário selecionar um ponto no mapa para análise específica de qual fonte de energia seria mais vantajosa para aquele local.

## Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/lvks-dev/ventosol.git
   ```
2. Navegue até a pasta do projeto:
   ```bash
   cd ventosol
   ```
3. Instale as dependências:
   ```bash
   pnpm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```
