# Frontend TDAH - Documentação Completa

## Visão Geral do Projeto

Frontend TDAH é uma aplicação React + TypeScript voltada para gerenciamento de tarefas, especialmente projetada para pessoas com TDAH (Transtorno de Déficit de Atenção e Hiperatividade). O sistema oferece uma interface intuitiva para criação, organização e acompanhamento de tarefas com diferentes categorias, prioridades e prazos.

## Stack Tecnológico

### Core

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Superset tipado do JavaScript
- **Vite 7.2.4** - Build tool e dev server

### Roteamento

- **React Router DOM 7.12.0** - Roteamento do lado do cliente

### Gerenciamento de Estado

- **Zustand 5.0.9** - Gerenciamento de estado leve
- **React Context API** - Contexto de autenticação

### Requisições HTTP

- **Axios 1.13.2** - Cliente HTTP
- **TanStack Query 5.90.16** - Gerenciamento de estado do servidor e cache

### Formulários

- **React Hook Form 7.70.0** - Gerenciamento de formulários com validação

### UI/UX

- **Tailwind CSS 4.1.18** - Framework CSS utility-first
- **Lucide React 0.562.0** - Biblioteca de ícones
- **React Hot Toast 2.6.0** - Notificações toast

### Utilidades

- **Day.js 1.11.19** - Manipulação de datas

### Testes

- **Vitest 4.0.16** - Framework de testes
- **Testing Library (React)** - Utilitários para testes de componentes
- **jsdom** - Implementação DOM para testes

## Estrutura de Diretórios

```
Frontend_TDAH/
├── src/
│   ├── __tests__/              # Testes unitários e de integração
│   │   └── AuthContext.test.tsx
│   ├── components/             # Componentes reutilizáveis
│   │   ├── layout/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── tasks/              # Componentes de tarefas
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskFilters.tsx
│   │   └── ui/                 # Primitivas UI reutilizáveis (Radix UI)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── card.tsx
│   │       ├── textarea.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── checkbox.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── switch.tsx
│   │       └── tabs.tsx
│   ├── context/                # Contextos React
│   │   └── AuthContext.tsx
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuthActions.ts
│   │   └── useTasks.ts
│   ├── lib/                    # Bibliotecas e configurações
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/                  # Páginas da aplicação
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   └── tasks/
│   │       └── TasksList.tsx
│   ├── routes/                 # Configuração de rotas
│   │   └── AppRoutes.tsx
│   ├── services/               # Serviços de API
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── types/                  # Definições de tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx                 # Componente raiz
│   ├── App.css                 # Estilos globais
│   ├── index.css               # Estilos de reset
│   ├── main.tsx                # Ponto de entrada
│   └── setupTests.ts           # Configuração de testes
├── postcss.config.cjs          # Configuração PostCSS
├── tailwind.config.cjs         # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
├── tsconfig.app.json           # Configuração TypeScript para App
├── tsconfig.node.json          # Configuração TypeScript para Node
├── vite.config.ts              # Configuração Vite
├── vitest.config.ts            # Configuração Vitest
├── eslint.config.js            # Configuração ESLint
├── components.json             # Configuração Shadcn/ui (se aplicável)
├── claude.md                   # Esta documentação
└── package.json                # Dependências e scripts
```

## Arquitetura do Sistema

### Autenticação

O sistema utiliza autenticação baseada em JWT (JSON Web Token):

1. **AuthContext** ([src/context/AuthContext.tsx](src/context/AuthContext.tsx))
   - Gerencia o estado global de autenticação
   - Armazena token e informações do usuário no localStorage
   - Fornece métodos: `login`, `register`, `logout`

2. **Serviço de Auth** ([src/services/auth.ts](src/services/auth.ts))
   - Comunicação com API de autenticação
   - Endpoints de login e registro

3. **Interceptor Axios** ([src/services/api.ts](src/services/api.ts))
   - Adiciona token automaticamente em todas as requisições
   - Redireciona para login em caso de 401 (não autorizado)

### Rotas

O sistema possui três tipos de rotas ([src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx)):

#### Rotas Públicas

- `/login` - Página de login
- `/register` - Página de registro

#### Rotas Protegidas

- `/dashboard` - Painel principal (requer autenticação)
- Outras rotas protegidas podem ser adicionadas dentro do `<ProtectedRoute>`

#### Redirecionamentos

- `/` → `/dashboard` (redirect automático)
- `*` → Página Not Found

### Gerenciamento de Tarefas

#### Tipos de Dados ([src/types/index.ts](src/types/index.ts))

**TaskCategory** (Categorias)

```typescript
- STUDY: 0      // Estudos
- WORK: 1       // Trabalho
- HOME: 2       // Casa
- HEALTH: 3     // Saúde
- LEISURE: 4    // Lazer
- OTHER: 5      // Outros
```

**TaskPriority** (Prioridades)

```typescript
- LOW: 0        // Baixa
- MEDIUM: 1     // Média
- HIGH: 2       // Alta
```

**TaskStatus** (Status)

```typescript
- PENDING: 0       // Pendente
- IN_PROGRESS: 1   // Em progresso
- COMPLETED: 2     // Concluída
- CANCELLED: 3     // Cancelada
```

**Task Interface**

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes?: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}
```

### Componentes Principais

#### 1. Register ([src/pages/auth/Register.tsx](src/pages/auth/Register.tsx))

- Formulário de registro com validação
- Campos: nome, email, senha, confirmação de senha
- Validações:
  - Nome obrigatório
  - Email válido e obrigatório
  - Senha mínima de 6 caracteres
  - Confirmação de senha deve coincidir
- Após registro bem-sucedido, redireciona para `/login`

#### 2. Login ([src/pages/auth/Login.tsx](src/pages/auth/Login.tsx))

- Formulário de login
- Armazena token e dados do usuário
- Redireciona para dashboard após login

#### 3. Dashboard ([src/pages/dashboard/Dashboard.tsx](src/pages/dashboard/Dashboard.tsx))

- Página principal da aplicação
- Exibe informações do usuário
- Acesso a funcionalidades principais

#### 4. ProtectedRoute ([src/components/layout/ProtectedRoute.tsx](src/components/layout/ProtectedRoute.tsx))

- HOC (Higher Order Component) para proteção de rotas
- Verifica se usuário está autenticado
- Redireciona para login se não autenticado

## Configuração da API

### Base URL

A aplicação se conecta à API através da configuração em [src/services/api.ts](src/services/api.ts):

```typescript
baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5033';
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:5033
```

### Interceptors

**Request Interceptor**

- Adiciona automaticamente o header `Authorization: Bearer {token}` em todas as requisições

**Response Interceptor**

- Detecta erros 401 (não autorizado)
- Remove token do localStorage
- Redireciona para `/login`

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (Vite)

# Testes
npm run test         # Executa testes com Vitest

# Build
npm run build        # Compila TypeScript e gera build de produção

# Lint
npm run lint         # Executa ESLint para análise de código

# Preview
npm run preview      # Visualiza build de produção localmente
```

## Guia de Desenvolvimento

### Instalação

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]

# Entre na pasta do projeto
cd Frontend_TDAH

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor de desenvolvimento
npm run dev
```

### Criando Novos Componentes

#### Componente de Página

```typescript
// src/pages/exemplo/MinhaPage.tsx
import { useState } from 'react'

export default function MinhaPage() {
  const [state, setState] = useState()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Minha Página</h1>
      {/* Conteúdo */}
    </div>
  )
}
```

#### Componente Reutilizável

```typescript
// src/components/comum/MeuComponente.tsx
interface MeuComponenteProps {
  titulo: string
  onClick?: () => void
}

export default function MeuComponente({ titulo, onClick }: MeuComponenteProps) {
  return (
    <button onClick={onClick} className="btn">
      {titulo}
    </button>
  )
}
```

### Criando Custom Hooks

```typescript
// src/hooks/useMeuHook.ts
import { useState, useEffect } from 'react';

export function useMeuHook() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Lógica do hook
  }, []);

  return { data };
}
```

### Adicionando Novas Rotas

1. Crie o componente da página em `src/pages/`
2. Adicione a rota em [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx):

```typescript
// Para rota pública
<Route path="/nova-rota" element={<NovaPage />} />

// Para rota protegida
<Route element={<ProtectedRoute />}>
  <Route path="/rota-protegida" element={<RotaProtegida />} />
</Route>
```

### Trabalhando com Formulários

Usando React Hook Form:

```typescript
import { useForm } from 'react-hook-form'

type FormData = {
  campo: string
}

export default function MeuForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('campo', {
          required: 'Campo obrigatório',
          minLength: { value: 3, message: 'Mínimo 3 caracteres' }
        })}
      />
      {errors.campo && <span>{errors.campo.message}</span>}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

### Fazendo Requisições à API

```typescript
import api from '../services/api';

// GET
const response = await api.get('/endpoint');

// POST
const response = await api.post('/endpoint', { data });

// PUT
const response = await api.put('/endpoint/:id', { data });

// DELETE
const response = await api.delete('/endpoint/:id');
```

### Usando TanStack Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query (GET)
const { data, isLoading, error } = useQuery({
  queryKey: ['tasks'],
  queryFn: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
});

// Mutation (POST/PUT/DELETE)
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: async (newTask) => {
    return api.post('/tasks', newTask);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

### Notificações Toast

```typescript
import toast from 'react-hot-toast'

// Sucesso
toast.success('Operação realizada com sucesso!')

// Erro
toast.error('Ocorreu um erro!')

// Loading
const toastId = toast.loading('Processando...')
toast.success('Concluído!', { id: toastId })

// Custom
toast.custom((t) => (
  <div className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}>
    Custom Toast
  </div>
))
```

## Padrões de Código

### Nomenclatura

- **Componentes**: PascalCase - `MeuComponente.tsx`
- **Hooks**: camelCase com prefixo `use` - `useMeuHook.ts`
- **Utilitários**: camelCase - `minhaFuncao.ts`
- **Tipos/Interfaces**: PascalCase - `MeuTipo`
- **Constantes**: UPPER_SNAKE_CASE - `API_URL`

### Estrutura de Componentes

```typescript
// 1. Imports
import { useState } from 'react'
import type { MeuTipo } from '../types'

// 2. Types/Interfaces
interface Props {
  titulo: string
}

// 3. Componente
export default function MeuComponente({ titulo }: Props) {
  // 3.1 Hooks
  const [state, setState] = useState()

  // 3.2 Funções
  const handleClick = () => {
    // lógica
  }

  // 3.3 Effects
  useEffect(() => {
    // efeito
  }, [])

  // 3.4 Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Tailwind CSS

Classes seguem a ordem:

1. Layout (display, position)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography
5. Visual (background, border)
6. Effects (shadow, opacity)

```typescript
<div className="flex items-center justify-center p-4 w-full h-screen bg-gray-100 rounded-lg shadow-md">
  {/* Conteúdo */}
</div>
```

## Testes

### Estrutura de Teste

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MeuComponente from './MeuComponente'

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente titulo="Teste" />)
    expect(screen.getByText('Teste')).toBeInTheDocument()
  })

  it('deve chamar onClick quando clicado', async () => {
    const handleClick = vi.fn()
    render(<MeuComponente onClick={handleClick} />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Rodando Testes

```bash
# Rodar todos os testes
npm run test

# Modo watch
npm run test -- --watch

# Com coverage
npm run test -- --coverage

# Teste específico
npm run test -- AuthContext
```

## Boas Práticas

### 1. Segurança

- Nunca commite tokens ou senhas
- Use variáveis de ambiente para dados sensíveis
- Sempre valide inputs do usuário
- Sanitize dados antes de exibir

### 2. Performance

- Use `React.memo` para componentes pesados
- Lazy loading de rotas: `React.lazy(() => import('./Page'))`
- Debounce em inputs de busca
- Pagine listas grandes

### 3. Acessibilidade

- Use tags semânticas (`<button>`, `<nav>`, `<main>`)
- Adicione `aria-label` quando necessário
- Garanta contraste adequado de cores
- Suporte navegação por teclado

### 4. TypeScript

- Sempre defina tipos para props
- Evite `any`, use `unknown` quando necessário
- Use `interface` para objetos, `type` para unions
- Aproveite inferência de tipos

### 5. Git

- Commits pequenos e descritivos
- Use conventional commits:
  - `feat:` nova funcionalidade
  - `fix:` correção de bug
  - `docs:` documentação
  - `refactor:` refatoração
  - `test:` testes
  - `chore:` manutenção

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"

```bash
# Vite usa porta 5173 por padrão
# Altere em vite.config.ts ou mate o processo:
lsof -ti:5173 | xargs kill -9
```

### Erro: "TypeScript errors"

```bash
# Limpe cache do TypeScript
rm -rf node_modules/.vite
npm run build
```

### API não conecta

1. Verifique se a API está rodando
2. Confirme a URL em `.env`
3. Verifique CORS na API
4. Inspecione Network tab no DevTools

## Roadmap / Próximas Features

### Em Desenvolvimento

- [ ] Sistema completo de CRUD de tarefas
- [ ] Filtros avançados (categoria, prioridade, status)
- [ ] Visualização de calendário
- [ ] Timer Pomodoro integrado

### Planejado

- [ ] Notificações push
- [ ] Modo offline (PWA)
- [ ] Sincronização multi-dispositivo
- [ ] Relatórios e estatísticas
- [ ] Gamificação (pontos, conquistas)
- [ ] Temas customizáveis
- [ ] Integração com Google Calendar
- [ ] Modo escuro

### Backlog

- [ ] App mobile (React Native)
- [ ] Compartilhamento de tarefas
- [ ] Comentários em tarefas
- [ ] Anexos de arquivos
- [ ] Lembretes por email/SMS

## Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feat/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feat/minha-feature`)
5. Abra um Pull Request

### Checklist do PR

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Build passa sem erros
- [ ] Lint passa sem warnings
- [ ] Não há console.logs esquecidos

## Recursos Úteis

### Documentação Oficial

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)
- [Tailwind CSS](https://tailwindcss.com)

### Ferramentas

- [VS Code](https://code.visualstudio.com) - Editor recomendado
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools) - Extensão Chrome
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/react/devtools) - Debug de queries

### Extensões VS Code Recomendadas

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Rename Tag
- Auto Close Tag
- Path Intellisense

## Contato e Suporte

Para dúvidas, sugestões ou reportar bugs:

- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

## Melhorias Implementadas (12 Janeiro 2026)

### 1. Reorganização de Componentes UI

**Antes:**

- Primitivas UI estavam localizadas em `@/components/ui` (diretório raiz).
- Alias múltiplos e complexos no `tsconfig.json` e `vite.config.ts`.

**Depois:**

- Primitivas UI movidas para `src/components/ui` (sob a mesma estrutura de imports).
- Alias unificado: `@/*` → `./src/*` em ambos `tsconfig.app.json` e `vite.config.ts`.
- **Benefícies:** Estrutura mais clara, imports consistentes, menos complexidade de alias.

### 2. Componentização de Tarefas

**Criados/Consolidados:**

- `src/components/tasks/TaskCard.tsx` - Renderização individual de tarefa com status, prioridade, categoria, prazos.
- `src/components/tasks/TaskForm.tsx` - Formulário de criação/edição de tarefas com validação.
- `src/components/tasks/TaskFilters.tsx` - Componente de filtros (busca, categoria, prioridade, status).

**Removidos:**

- Versões antigas com sufixo `-FINAL` foram eliminadas.

### 3. Typings Reforçados

**Mutations em `src/pages/dashboard/Dashboard.tsx`:**

Antes:

```typescript
const createTask = useMutation<any, Error, any>({...})
const updateTask = useMutation<any, Error, { id: string; data: any }>({...})
const deleteTask = useMutation<any, Error, string>({...})
```

Depois:

```typescript
type NewTaskPayload = CreateTaskDto & { status?: TaskStatus }
type UpdateTaskVariables = { id: string; data: Partial<CreateTaskDto & { status?: TaskStatus }> }

const createTask = useMutation<Task, Error, NewTaskPayload>({...})
const updateTask = useMutation<Task, Error, UpdateTaskVariables>({...})
const deleteTask = useMutation<void, Error, string>({...})
```

**Benefício:** Type-safety completa em mutations, prevenção de erros em tempo de desenvolvimento.

### 4. Primitivas UI Consolidadas

Todos os componentes UI estão agora centralizados em `src/components/ui/`:

- `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`
- `card.tsx`, `textarea.tsx`, `badge.tsx`
- `dialog.tsx`, `checkbox.tsx`, `dropdown-menu.tsx`, `switch.tsx`, `tabs.tsx`

Baseados em Radix UI com Tailwind CSS para estilização.

### 5. Callbacks e Handlers Tipados

Callbacks em componentes de formulário agora possuem tipos explícitos:

- `onChange={(e: React.ChangeEvent<HTMLInputElement>) => ...}`
- `onValueChange={(value: string) => ...}`

Isso eliminou erros TS7006 (implicit any) em modo strict.

### Estado Atual da Build

✅ **TypeScript Build:** Sem erros
✅ **Vite Build:** Sucesso (`dist/` gerado)
✅ **Dev Server:** Funcional em http://localhost:5174/ (port 5173 estava ocupado)
⚠️ **Node.js:** Versão 20.17.0 (recomendado ≥ 20.19 ou 22.x)

---

## Sprint Atual: Agendamento Automático (21 Janeiro 2026)

### Branch Ativa
```
feature/us-agendamento-automatico-scheduler
```

### User Story
**US - Gerenciamento de Compromissos Fixos / Agendamento Automático**

Implementar sistema de agendamento automático que distribui tarefas pendentes nos horários livres da semana, respeitando compromissos fixos.

---

### ✅ Concluído

#### 1. Interface ScheduledTask (`src/types/index.ts`)
```typescript
export interface ScheduledTask {
  id: string;              // ID único do agendamento
  taskId: string;          // ID da tarefa original
  task: Task;              // Referência completa à tarefa
  dayOfWeek: 0|1|2|3|4|5|6;
  startTime: string;       // "HH:mm"
  endTime: string;         // "HH:mm"
  date: string;            // "YYYY-MM-DD"
}
```

#### 2. Algoritmo de Agendamento (`src/lib/scheduler.ts`)

**Função Principal:**
- `scheduleTasksInWeek(fixedBlocks, tasks, weekStartDate): ScheduledTask[]`

**Funções Auxiliares:**
| Função | Descrição |
|--------|-----------|
| `createWeekSlots()` | Cria `string[][]` com 7 dias × 34 slots (6h-23h) |
| `getOccupiedSlots(start, end)` | Retorna array de slots ocupados por um bloco |
| `findConsecutiveSlots(slots, n)` | Busca N slots consecutivos livres |
| `calculateEndTime(start, min)` | Calcula horário de término |
| `getDateForDay(date, day)` | Retorna data YYYY-MM-DD para dia da semana |
| `getWeekStartDate(date)` | Retorna domingo da semana |
| `getWeekAvailability(blocks, date)` | Estatísticas de disponibilidade |

**Algoritmo:**
1. Cria grid de slots 30min para 7 dias
2. Remove slots ocupados pelos fixedBlocks
3. Filtra tarefas (status !== COMPLETED)
4. Ordena: prioridade DESC → deadline ASC → duração ASC
5. Aloca cada tarefa no primeiro slot livre consecutivo
6. Retorna `ScheduledTask[]`

#### 3. Integração no MyWeek (`src/pages/schedule/MyWeek.tsx`)

**Funcionalidades implementadas:**
- ✅ Botão "Reagendar Semana" com ícone RefreshCw
- ✅ Carrega tasks do localStorage
- ✅ Executa `scheduleTasksInWeek()` ao clicar
- ✅ Renderiza tarefas agendadas no grid (cor verde)
- ✅ Blocos clicáveis com hover effect
- ✅ Dialog de detalhes ao clicar na tarefa
- ✅ Botão "Marcar Concluída" no dialog
- ✅ Atualiza localStorage ao concluir tarefa
- ✅ Legenda com contador de tarefas agendadas

**Cores das tarefas agendadas:**
```
bg-green-100 dark:bg-green-900/30
text-green-700 dark:text-green-300
border-green-300
```

---

### 📝 Commits Realizados (5)

```
5c202b8 feat: adiciona Dialog de detalhes para tarefas agendadas
3d2fc77 refactor: refatora scheduler com funções auxiliares específicas
9212ba0 feat: integra scheduler na página MyWeek
d03b812 feat: cria algoritmo de agendamento automático de tarefas
86ebd1a feat: adiciona interface ScheduledTask para agendamento automático
```

---

### 🔲 Pendente / A Fazer

#### Melhorias no Scheduler
- [ ] Considerar `validFrom`/`validUntil` dos blocos fixos na remoção de slots
- [ ] Adicionar preferências de horário do usuário (manhã/tarde/noite)
- [ ] Fragmentar tarefas longas em múltiplos blocos
- [ ] Implementar reagendamento automático ao mudar de semana

#### Melhorias na UI
- [ ] Drag & drop para mover tarefas agendadas manualmente
- [ ] Editar tarefa direto do dialog
- [ ] Mostrar tempo total agendado no header
- [ ] Animação ao adicionar/remover tarefa do grid

#### Persistência
- [ ] Salvar `scheduledTasks` no localStorage
- [ ] Recuperar agendamento ao recarregar página
- [ ] Sincronizar com backend (API)

#### Testes
- [ ] Testes unitários para funções do scheduler
- [ ] Testes de integração para MyWeek

---

### 📁 Arquivos Modificados nesta Sprint

```
src/types/index.ts                    # Interface ScheduledTask
src/lib/scheduler.ts                  # Algoritmo completo (novo)
src/pages/schedule/MyWeek.tsx         # Integração UI + Dialog
```

---

### 🚀 Como Testar

1. Acesse `/schedule/week` (Minha Semana)
2. Certifique-se de ter tarefas no localStorage (chave `tasks`)
3. Clique em "Reagendar Semana"
4. Tarefas aparecerão em verde nos slots livres
5. Clique em uma tarefa para ver detalhes
6. Clique "Marcar Concluída" para finalizar

---

### Estado Atual da Build

✅ **TypeScript Build:** Sem erros
✅ **Vite Build:** Sucesso
✅ **Branch:** `feature/us-agendamento-automatico-scheduler` (5 commits ahead of main)

---

**Última atualização:** 2026-01-21
**Versão:** 0.1.0
**Mantido por:** Equipe Frontend TDAH
