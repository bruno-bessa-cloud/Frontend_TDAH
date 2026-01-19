import * as React from 'react';
import { Home, Calendar, ListTodo, Clock, Settings } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { BrandLogo } from '@/components/brand-logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

// Dados do usuário (mock - será substituído por dados reais do AuthContext)
const getUserData = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      return {
        name: user.name || 'Usuário',
        email: user.email || 'usuario@email.com',
        avatar: '',
      };
    } catch {
      return {
        name: 'Usuário',
        email: 'usuario@email.com',
        avatar: '',
      };
    }
  }
  return {
    name: 'Usuário',
    email: 'usuario@email.com',
    avatar: '',
  };
};

// Navegação principal do TDAH Manager
const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    isActive: true,
    items: [
      {
        title: 'Visão Geral',
        url: '/dashboard',
      },
      {
        title: 'Conquistas',
        url: '/dashboard/conquistas',
      },
      {
        title: 'Estatísticas',
        url: '/dashboard/estatisticas',
      },
    ],
  },
  {
    title: 'Minha Semana',
    url: '/schedule/week',
    icon: Calendar,
    items: [
      {
        title: 'Hoje',
        url: '/semana/hoje',
      },
      {
        title: 'Amanhã',
        url: '/semana/amanha',
      },
      {
        title: 'Visão Semanal',
        url: '/schedule/week',
      },
      {
        title: 'Calendário',
        url: '/schedule/week',
      },
    ],
  },
  {
    title: 'Lista de Tarefas',
    url: '/tasks/notion',
    icon: ListTodo,
    items: [
      {
        title: 'Todas as Tarefas',
        url: '/tasks/notion',
      },
      {
        title: 'Nova Tarefa',
        url: '/tasks/notion',
      },
      {
        title: 'Concluídas',
        url: '/tarefas/concluidas',
      },
      {
        title: 'Por Categoria',
        url: '/tarefas/categorias',
      },
    ],
  },
  {
    title: 'Horários Fixos',
    url: '/horarios',
    icon: Clock,
    items: [
      {
        title: 'Minha Rotina',
        url: '/schedule/routine',
      },
      {
        title: 'Novo Horário',
        url: '/horarios/novo',
      },
      {
        title: 'Compromissos',
        url: '/horarios/compromissos',
      },
      {
        title: 'Repetições',
        url: '/horarios/repeticoes',
      },
    ],
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
    items: [
      {
        title: 'Perfil',
        url: '/configuracoes/perfil',
      },
      {
        title: 'Notificações',
        url: '/configuracoes/notificacoes',
      },
      {
        title: 'Aparência',
        url: '/configuracoes/aparencia',
      },
      {
        title: 'Preferências TDAH',
        url: '/configuracoes/tdah',
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState(getUserData());

  React.useEffect(() => {
    // Atualiza os dados do usuário quando o componente monta
    setUserData(getUserData());
  }, []);

  return (
    <Sidebar collapsible="icon" {...props} className="sticky">
      <SidebarHeader>
        <BrandLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
