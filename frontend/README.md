# 🌿 EcoGest Frontend — Portal do Utilizador

Este diretório contém a aplicação client-side do **EcoGest**, desenvolvida em **React** (v19) compilada com o **Vite**, estilizada com **TailwindCSS** e ícones **Lucide React**.

---

## 🛠️ Tecnologias e Dependências Principais

*   **Core**: React 19 + Vite 8
*   **Routing**: React Router Dom v7
*   **Design & UI**: TailwindCSS v3 (design responsivo, moderno e limpo)
*   **Ícones**: Lucide React
*   **Geração de Relatórios**: jsPDF (geração física de relatórios PDF diretamente no navegador)

---

## 🖥️ Módulos e Páginas do Portal

A aplicação está estruturada de forma modular em `src/pages`:

1.  **Página Inicial (`Home.jsx`)**: Landing page informativa pública com estatísticas de impacto ecológico e visão geral do programa Eco-Escolas.
2.  **Autenticação (`Login.jsx`, `Register.jsx`)**: Interfaces para registo e início de sessão seguros, com armazenamento local dos tokens JWT (Access & Refresh tokens).
3.  **Painel de Controlo / Dashboard (`dashboard/`):**
    *   **Overview (`Overview.jsx`)**: Mostrador analítico de estatísticas gerais e gráficos comparativos de atividade mensal dos últimos 6 meses.
    *   **Projetos (`Projects.jsx`)**: Gestão de anos letivos das Eco-Escolas, atribuição de coordenadores e cálculo automático do nível de medalha do projeto (Bronze, Prata, Ouro) com base nas atividades desenvolvidas.
    *   **Atividades (`Activities.jsx`)**: Calendário de iniciativas ecológicas, inscrição de participantes (com suporte para visitantes externos) e upload de fotos de evidência.
    *   **Propostas (`Proposals.jsx`)**: Submissão de propostas ambientais por membros do conselho para avaliação de coordenadores.
    *   **Reuniões (`Meetings.jsx`)**: Agendamento de reuniões de conselho, gestão de convocatórias e upload de atas oficiais em PDF.
    *   **Auditorias (`Audits.jsx`)**: Questionários interativos com pontuação dinâmica (0, 50, 100 pontos) divididos por áreas críticas (Água, Resíduos, Energia).
    *   **Relatórios (`Reports.jsx`)**: Central de emissão de relatórios ambientais agregados com exportação direta para PDF usando `jsPDF`.
    *   **Utilizadores (`UsersPage.jsx`)**: Interface administrativa para controlo de acesso baseado em funções (RBAC) e estado das contas.
    *   **Backups (`Backups.jsx`)**: Gestão de cópias de segurança do sistema para administradores.

---

## ⚙️ Execução Local

### **Requisitos**
*   Node.js (v20+ recomendado)
*   Servidor Backend do EcoGest a correr na porta `3000`.

### **Passos**
1. **Instalar Dependências:**
   ```bash
   npm install
   ```
2. **Executar em Desenvolvimento:**
   ```bash
   npm run dev
   ```
   *Aceda a **[http://localhost:5173](http://localhost:5173)** no seu browser.*

3. **Compilar para Produção (Build):**
   ```bash
   npm run build
   ```
   *Os ficheiros otimizados de produção serão gerados na pasta `/dist`.*

---

## 🐳 Execução com Docker (Standalone)

Pode construir e executar o frontend autonomamente dentro de um container Docker:

1. **Construir a Imagem:**
   ```bash
   docker build -t ecogest-frontend .
   ```
2. **Iniciar o Container:**
   ```bash
   docker run -d --name ecogest-frontend -p 5173:5173 ecogest-frontend
   ```
