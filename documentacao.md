## Documentação de Requisitos: Sistema de Gestão Acadêmica SMSA/PBH

### 1. Escopo e Objetivos
O sistema visa centralizar a administração dos Programas de Residência da SMSA/PBH, automatizando o ciclo de vida do residente. A aplicação é regida por normas rigorosas de identidade visual, segurança de dados e conformidade administrativa.

### 2. Pilares de Segurança e Acesso
#### 2.1 Autenticação Robusta
- **Protocolo:** Integração nativa com Internet Identity para garantir autenticação descentralizada e segura.
- **Gestão de Sessão:** Renovação automática e transparente de delegações para prevenir falhas em operações críticas (CRUDs e exportações).
- **Perfis de Utilização:**

  * **Administrador:** Gestão total de módulos, usuários (limite de 20) e relatórios.
  * **Aluno:** Acesso exclusivo ao Dashboard do Estudante e Registro de Ponto (limite de 1.000).

#### 2.2 Fluxo de Onboarding
- **Autenticação Prévia:** O acesso ao formulário de cadastro exige autenticação via Internet Identity.
- **Identidade Acadêmica:** Geração automática de número de registro único no formato REG-YYYY-XXXX.

### 3. Ecossistema de Avaliação (Módulo de Provas)
#### 3.1 Gestão de Conteúdo
- **Banco de Questões:** Importação inteligente via arquivos TXT, processando enunciados e alternativas (A a D) com armazenamento persistente.
- **Estrutura de Exame:** Montagem de provas através da seleção dinâmica de questões do banco de dados.

#### 3.2 Engenharia de Documentos (Layout A4)
- Geração de arquivos PDF baseada em templates oficiais, com remoção obrigatória de rodapés institucionais:
- **Capa e Corpo:** Respeito absoluto a margens (2,5cm superior/inferior), tipografia Times New Roman e algoritmos de quebras de página inteligentes.
- **Gabarito Adaptativo:** Algoritmo de compactação que ajusta escala e densidade (fontes e bolhas) para garantir que exames de 20 a 100+ questões caibam em uma única folha A4.

### 4. Módulos Administrativos e Relatórios
#### 4.1 Estrutura Organizacional
Gerenciamento completo de:

- **Programas de Residência:** Especializações, áreas e durações.
- **Ciclos Acadêmicos:** Anos letivos e turmas vinculadas.
- **Usuários:** Controle de status, aprovação de acesso e permissões de perfil.

#### 4.2 Inteligência de Dados
Motor de relatórios com filtros avançados e exportação multi-formato (PDF, CSV, XLSX):

- Relatórios Acadêmicos: Desempenho em provas, listagens de turmas e estatísticas de participação.

