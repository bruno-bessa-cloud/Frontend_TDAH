import { useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Flame,
  Target,
  Clock,
  BarChart3,
  PieChartIcon,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Mock de dados para produtividade mensal
const MONTHLY_PRODUCTIVITY = [
  { day: '1', tasks: 4 },
  { day: '2', tasks: 6 },
  { day: '3', tasks: 3 },
  { day: '4', tasks: 8 },
  { day: '5', tasks: 5 },
  { day: '6', tasks: 2 },
  { day: '7', tasks: 7 },
  { day: '8', tasks: 9 },
  { day: '9', tasks: 4 },
  { day: '10', tasks: 6 },
  { day: '11', tasks: 8 },
  { day: '12', tasks: 5 },
  { day: '13', tasks: 3 },
  { day: '14', tasks: 7 },
  { day: '15', tasks: 10 },
  { day: '16', tasks: 6 },
  { day: '17', tasks: 4 },
  { day: '18', tasks: 8 },
  { day: '19', tasks: 9 },
  { day: '20', tasks: 5 },
  { day: '21', tasks: 7 },
  { day: '22', tasks: 11 },
  { day: '23', tasks: 6 },
  { day: '24', tasks: 8 },
  { day: '25', tasks: 4 },
  { day: '26', tasks: 9 },
  { day: '27', tasks: 7 },
  { day: '28', tasks: 5 },
  { day: '29', tasks: 10 },
  { day: '30', tasks: 8 },
];

// Mock de dados para categorias
const CATEGORY_DATA = [
  { name: 'Estudos', value: 35, color: '#8b5cf6' },
  { name: 'Trabalho', value: 28, color: '#3b82f6' },
  { name: 'Casa', value: 15, color: '#10b981' },
  { name: 'Saúde', value: 12, color: '#f43f5e' },
  { name: 'Lazer', value: 7, color: '#f59e0b' },
  { name: 'Outros', value: 3, color: '#6b7280' },
];

// Mock de dados para foco diário
const DAILY_FOCUS = [
  { day: 'Seg', minutes: 120, goal: 90 },
  { day: 'Ter', minutes: 95, goal: 90 },
  { day: 'Qua', minutes: 150, goal: 90 },
  { day: 'Qui', minutes: 80, goal: 90 },
  { day: 'Sex', minutes: 110, goal: 90 },
  { day: 'Sáb', minutes: 45, goal: 90 },
  { day: 'Dom', minutes: 60, goal: 90 },
];

// Mock de dados para progresso semanal (extraído do Dashboard)
const WEEKLY_PROGRESS = [
  { day: 'Seg', completed: 4 },
  { day: 'Ter', completed: 6 },
  { day: 'Qua', completed: 3 },
  { day: 'Qui', completed: 5 },
  { day: 'Sex', completed: 7 },
  { day: 'Sáb', completed: 2 },
  { day: 'Dom', completed: 5 },
];

// Mock de estatísticas gerais
const STATS = {
  currentStreak: 12,
  longestStreak: 21,
  totalTasks: 127,
  totalMinutes: 4320,
  averageDaily: 6.2,
  weeklyGrowth: 15,
};

// Componente WeeklyProgressChart (extraído do Dashboard)
function WeeklyProgressChart({ data }: { data: { day: string; completed: number }[] }) {
  const maxCompleted = Math.max(...data.map((d) => d.completed), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, index) => {
        const height = (item.completed / maxCompleted) * 100;
        const isToday = index === data.length - 1;

        return (
          <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-full flex justify-center">
              <div
                className={`w-8 rounded-t-lg transition-all duration-500 ${
                  isToday
                    ? 'bg-gradient-to-t from-violet-500 to-purple-400'
                    : 'bg-gradient-to-t from-emerald-400 to-teal-300'
                }`}
                style={{ height: `${Math.max(height, 8)}px` }}
              />
              {item.completed > 0 && (
                <span className="absolute -top-6 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {item.completed}
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${isToday ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500'}`}>
              {item.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Componente de stat card pequeno
function MiniStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  gradient,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  gradient: string;
}) {
  return (
    <Card className={`relative overflow-hidden border-0 ${gradient}`}>
      <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-white/10" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-300" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-300" />
                )}
                <span className={`text-xs ${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="p-2 bg-white/20 rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Statistics() {
  // Calcular totais
  const totalCategoryValue = useMemo(
    () => CATEGORY_DATA.reduce((sum, cat) => sum + cat.value, 0),
    []
  );

  const averageFocus = useMemo(() => {
    const total = DAILY_FOCUS.reduce((sum, d) => sum + d.minutes, 0);
    return Math.round(total / DAILY_FOCUS.length);
  }, []);

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
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-focus-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Estatísticas
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Acompanhe seu progresso e desempenho
                </p>
              </div>
            </div>

            {/* Mini Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStatCard
                title="Tarefas Totais"
                value={STATS.totalTasks}
                trend="up"
                trendValue="+12 esta semana"
                icon={Target}
                gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
              />
              <MiniStatCard
                title="Tempo Focado"
                value={`${Math.floor(STATS.totalMinutes / 60)}h`}
                subtitle={`${STATS.totalMinutes % 60} min total`}
                icon={Clock}
                gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
              />
              <MiniStatCard
                title="Média Diária"
                value={`${STATS.averageDaily}`}
                subtitle="tarefas/dia"
                trend="up"
                trendValue="+15%"
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-violet-400 to-purple-500"
              />
              <MiniStatCard
                title="XP Total"
                value="2,450"
                subtitle="Nível 8"
                icon={Zap}
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              />
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtividade Mensal - LineChart */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Produtividade Mensal
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      Janeiro 2026
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={MONTHLY_PRODUCTIVITY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="day"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value: number) => [`${value} tarefas`, 'Concluídas']}
                        labelFormatter={(label) => `Dia ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#059669' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Categorias Mais Trabalhadas - PieChart */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <PieChartIcon className="h-5 w-5 text-violet-500" />
                    Categorias Mais Trabalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={CATEGORY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value: number) => [
                          `${value} tarefas (${Math.round((value / totalCategoryValue) * 100)}%)`,
                          '',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legenda customizada */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {CATEGORY_DATA.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {cat.name} ({cat.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Média de Foco Diário - BarChart */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                      <Target className="h-5 w-5 text-blue-500" />
                      Média de Foco Diário
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Média: {averageFocus} min
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={DAILY_FOCUS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}m`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value: number, name: string) => [
                          `${value} min`,
                          name === 'minutes' ? 'Foco' : 'Meta',
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="minutes"
                        name="Minutos focados"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="goal"
                        name="Meta diária"
                        fill="#e5e7eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Progresso Semanal (extraído do Dashboard) */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      Progresso Semanal
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Esta semana
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <WeeklyProgressChart data={WEEKLY_PROGRESS} />
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total da semana
                    </span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {WEEKLY_PROGRESS.reduce((sum, d) => sum + d.completed, 0)} tarefas
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Recorde */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Flame className="h-6 w-6" />
                      <h3 className="text-lg font-semibold">Streak Recorde</h3>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-300" />
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-7xl font-bold mb-2">{STATS.longestStreak}</p>
                    <p className="text-white/80 text-lg">dias consecutivos</p>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white/70 text-sm">Sequência Atual</p>
                        <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-yellow-300" />
                          <span className="text-2xl font-bold">{STATS.currentStreak} dias</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-sm">Para bater o recorde</p>
                        <span className="text-2xl font-bold">
                          {STATS.longestStreak - STATS.currentStreak} dias
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-white/70 text-sm mt-4">
                    Continue assim! Você está a {STATS.longestStreak - STATS.currentStreak} dias de quebrar seu recorde!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dica */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Dica de Produtividade
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Seus melhores dias são no meio da semana! Tente agendar tarefas importantes
                      para quarta e quinta-feira, quando sua produtividade está no pico.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
