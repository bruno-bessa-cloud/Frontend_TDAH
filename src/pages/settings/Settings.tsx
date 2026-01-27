import { Outlet, NavLink } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Menu de navegação das configurações
const SETTINGS_NAV = [
  {
    to: '/configuracoes/perfil',
    label: 'Perfil',
    icon: User,
    description: 'Dados pessoais e conta',
  },
  {
    to: '/configuracoes/notificacoes',
    label: 'Notificações',
    icon: Bell,
    description: 'Alertas e lembretes',
  },
  {
    to: '/configuracoes/aparencia',
    label: 'Aparência',
    icon: Palette,
    description: 'Tema e personalização',
  },
  {
    to: '/configuracoes/tdah',
    label: 'Preferências TDAH',
    icon: Brain,
    description: 'Ajustes de acessibilidade',
  },
];

export default function Settings() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 gap-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 min-h-screen">
            {/* Header */}
            <div className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="h-7 w-7 text-focus-blue-500" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Configurações
                </h1>
              </div>

              {/* Menu de navegação */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {SETTINGS_NAV.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                              isActive
                                ? 'bg-focus-blue-100 dark:bg-focus-blue-900/30 text-focus-blue-700 dark:text-focus-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )
                          }
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                              {item.description}
                            </p>
                          </div>
                        </NavLink>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Mobile: Menu horizontal */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
              <nav className="flex justify-around py-2">
                {SETTINGS_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                          isActive
                            ? 'text-focus-blue-600 dark:text-focus-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        )
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 pb-20 md:pb-0">
              {/* Mobile header */}
              <div className="md:hidden flex items-center gap-3 mb-4">
                <SettingsIcon className="h-6 w-6 text-focus-blue-500" />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  Configurações
                </h1>
              </div>

              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Componentes das sub-páginas
export function SettingsPerfil() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-focus-blue-500" />
          Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <User className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Em construção</p>
          <p className="text-sm">Esta seção será implementada em breve</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsNotificacoes() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-focus-blue-500" />
          Notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Bell className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Em construção</p>
          <p className="text-sm">Esta seção será implementada em breve</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsAparencia() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-focus-blue-500" />
          Aparência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Palette className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Em construção</p>
          <p className="text-sm">Esta seção será implementada em breve</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsTDAH() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-focus-blue-500" />
          Preferências TDAH
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Brain className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Em construção</p>
          <p className="text-sm">Esta seção será implementada em breve</p>
        </div>
      </CardContent>
    </Card>
  );
}
