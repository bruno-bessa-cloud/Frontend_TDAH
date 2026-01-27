import { useState, useMemo, useCallback } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
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
  Download,
  RefreshCw,
  Filter,
  ChevronRight,
  Award,
  CheckCircle2,
  Timer,
  Brain,
  Sparkles,
} from 'lucide-react';
import { TaskStatus, TaskCategory, TaskPriority } from '@/types';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Tipos
type PeriodFilter = 'week' | 'month' | 'year';

interface DailyData {
  day: string;
  date: string;
  tasks: number;
  minutes: number;
  completed: number;
}

// Carregar tarefas do localStorage
const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem('tasks');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
};

// Carregar estatísticas do usuário do localStorage
const loadUserStats = () => {
  try {
    const saved = localStorage.getItem('userStats');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    currentStreak: 12,
    longestStreak: 21,
    totalMinutesFocused: 4320,
    totalXP: 2450,
  };
};

// Cores por categoria
const CATEGORY_COLORS: Record<number, string> = {
  [TaskCategory.STUDY]: '#8b5cf6',
  [TaskCategory.WORK]: '#3b82f6',
  [TaskCategory.HOME]: '#10b981',
  [TaskCategory.HEALTH]: '#f43f5e',
  [TaskCategory.LEISURE]: '#f59e0b',
  [TaskCategory.OTHER]: '#6b7280',
};

const CATEGORY_NAMES: Record<number, string> = {
  [TaskCategory.STUDY]: 'Estudos',
  [TaskCategory.WORK]: 'Trabalho',
  [TaskCategory.HOME]: 'Casa',
  [TaskCategory.HEALTH]: 'Saúde',
  [TaskCategory.LEISURE]: 'Lazer',
  [TaskCategory.OTHER]: 'Outros',
};

// Gerar dados dos últimos N dias
const generateDailyData = (tasks: Task[], days: number): DailyData[] => {
  const data: DailyData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTasks = tasks.filter((t) => {
      const taskDate = new Date(t.updatedAt || t.createdAt).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    const completedTasks = dayTasks.filter((t) => t.status === TaskStatus.COMPLETED);

    data.push({
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      tasks: dayTasks.length,
      minutes: completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0),
      completed: completedTasks.length,
    });
  }

  return data;
};

// Gerar dados por categoria
const generateCategoryData = (tasks: Task[]) => {
  const categoryCount: Record<number, number> = {};

  tasks.forEach((task) => {
    if (task.status === TaskStatus.COMPLETED) {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    }
  });

  return Object.entries(categoryCount).map(([cat, count]) => ({
    name: CATEGORY_NAMES[Number(cat)] || 'Outros',
    value: count,
    color: CATEGORY_COLORS[Number(cat)] || '#6b7280',
  }));
};

// Gerar dados por prioridade
const generatePriorityData = (tasks: Task[]) => {
  const priorityCount = {
    high: tasks.filter((t) => t.priority === TaskPriority.HIGH && t.status === TaskStatus.COMPLETED).length,
    medium: tasks.filter((t) => t.priority === TaskPriority.MEDIUM && t.status === TaskStatus.COMPLETED).length,
    low: tasks.filter((t) => t.priority === TaskPriority.LOW && t.status === TaskStatus.COMPLETED).length,
  };

  return [
    { name: 'Alta', value: priorityCount.high, color: '#ef4444', fill: '#ef4444' },
    { name: 'Média', value: priorityCount.medium, color: '#f59e0b', fill: '#f59e0b' },
    { name: 'Baixa', value: priorityCount.low, color: '#22c55e', fill: '#22c55e' },
  ];
};

// Gerar dados de comparação (semana atual vs anterior)
const generateComparisonData = (tasks: Task[]) => {
  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

  const thisWeekTasks = tasks.filter((t) => {
    const taskDate = new Date(t.updatedAt || t.createdAt);
    return taskDate >= thisWeekStart && t.status === TaskStatus.COMPLETED;
  });

  const lastWeekTasks = tasks.filter((t) => {
    const taskDate = new Date(t.updatedAt || t.createdAt);
    return taskDate >= lastWeekStart && taskDate <= lastWeekEnd && t.status === TaskStatus.COMPLETED;
  });

  return {
    thisWeek: thisWeekTasks.length,
    lastWeek: lastWeekTasks.length,
    difference: thisWeekTasks.length - lastWeekTasks.length,
    percentChange: lastWeekTasks.length > 0
      ? Math.round(((thisWeekTasks.length - lastWeekTasks.length) / lastWeekTasks.length) * 100)
      : 100,
  };
};

// Gerar dados para gráfico de hora do dia
const generateHourlyData = (tasks: Task[]) => {
  const hourlyCount: Record<number, number> = {};

  for (let i = 0; i < 24; i++) {
    hourlyCount[i] = 0;
  }

  tasks.forEach((task) => {
    if (task.status === TaskStatus.COMPLETED) {
      const hour = new Date(task.updatedAt || task.createdAt).getHours();
      hourlyCount[hour]++;
    }
  });

  return Object.entries(hourlyCount).map(([hour, count]) => ({
    hour: `${hour}h`,
    tasks: count,
  }));
};

// Componente WeeklyProgressChart (extraído do Dashboard)
function WeeklyProgressChart({ data }: { data: DailyData[] }) {
  const maxCompleted = Math.max(...data.map((d) => d.completed), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, index) => {
        const height = (item.completed / maxCompleted) * 100;
        const isToday = index === data.length - 1;

        return (
          <div key={item.date} className="flex flex-col items-center gap-2 flex-1">
            <div className="relative w-full flex justify-center">
              <div
                className={cn(
                  'w-8 rounded-t-lg transition-all duration-500',
                  isToday
                    ? 'bg-gradient-to-t from-violet-500 to-purple-400'
                    : 'bg-gradient-to-t from-emerald-400 to-teal-300'
                )}
                style={{ height: `${Math.max(height, 8)}px` }}
              />
              {item.completed > 0 && (
                <span className="absolute -top-6 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {item.completed}
                </span>
              )}
            </div>
            <span className={cn(
              'text-xs font-medium',
              isToday ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500'
            )}>
              {item.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Componente de stat card
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  gradient,
  comparison,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient: string;
  comparison?: string;
}) {
  return (
    <Card className={cn('relative overflow-hidden border-0', gradient)}>
      <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-white/10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 -ml-4 -mb-4 rounded-full bg-white/5" />
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-300" />
                ) : trend === 'down' ? (
                  <ArrowDown className="h-3 w-3 text-red-300" />
                ) : null}
                <span className={cn(
                  'text-xs',
                  trend === 'up' ? 'text-green-300' : trend === 'down' ? 'text-red-300' : 'text-white/70'
                )}>
                  {trendValue}
                </span>
              </div>
            )}
            {comparison && (
              <p className="text-[10px] text-white/60 mt-1">{comparison}</p>
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

// Componente de meta radial
function GoalRadialChart({
  current,
  goal,
  label
}: {
  current: number;
  goal: number;
  label: string;
}) {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  const data = [{ name: label, value: percentage, fill: percentage >= 100 ? '#22c55e' : '#8b5cf6' }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          barSize={12}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
        <span className="text-xs text-gray-500">{current}/{goal}</span>
      </div>
    </div>
  );
}

export default function Statistics() {
  const [period, setPeriod] = useState<PeriodFilter>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar dados
  const tasks = useMemo(() => loadTasks(), []);
  const userStats = useMemo(() => loadUserStats(), []);

  // Calcular dias baseado no período
  const days = useMemo(() => {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
      default: return 7;
    }
  }, [period]);

  // Gerar dados
  const dailyData = useMemo(() => generateDailyData(tasks, days), [tasks, days]);
  const categoryData = useMemo(() => generateCategoryData(tasks), [tasks]);
  const priorityData = useMemo(() => generatePriorityData(tasks), [tasks]);
  const comparison = useMemo(() => generateComparisonData(tasks), [tasks]);
  const hourlyData = useMemo(() => generateHourlyData(tasks), [tasks]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING);
    const totalMinutes = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0);
    const averageDaily = days > 0 ? (completedTasks.length / days).toFixed(1) : '0';

    return {
      total: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      totalMinutes,
      averageDaily,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    };
  }, [tasks, days]);

  // Melhor hora para produtividade
  const bestHour = useMemo(() => {
    const maxTasks = Math.max(...hourlyData.map((h) => h.tasks));
    const bestHourData = hourlyData.find((h) => h.tasks === maxTasks);
    return bestHourData?.hour || 'N/A';
  }, [hourlyData]);

  // Refresh dados
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Estatísticas atualizadas!');
    }, 1000);
  }, []);

  // Exportar dados
  const handleExport = useCallback(() => {
    const exportData = {
      period,
      generatedAt: new Date().toISOString(),
      summary: stats,
      dailyData,
      categoryData,
      comparison,
      userStats,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estatisticas-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Estatísticas exportadas!');
  }, [period, stats, dailyData, categoryData, comparison, userStats]);

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
            {/* Header com filtros */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

              <div className="flex items-center gap-2">
                {/* Filtro de período */}
                <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="hidden sm:flex"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Cards de estatísticas principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Tarefas Concluídas"
                value={stats.completed}
                subtitle={`de ${stats.total} total`}
                icon={CheckCircle2}
                trend={comparison.difference >= 0 ? 'up' : 'down'}
                trendValue={`${comparison.difference >= 0 ? '+' : ''}${comparison.difference} vs semana anterior`}
                gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
              />
              <StatCard
                title="Tempo Focado"
                value={`${Math.floor(stats.totalMinutes / 60)}h`}
                subtitle={`${stats.totalMinutes % 60} min total`}
                icon={Timer}
                gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
              />
              <StatCard
                title="Média Diária"
                value={stats.averageDaily}
                subtitle="tarefas/dia"
                icon={TrendingUp}
                trend={Number(stats.averageDaily) >= 5 ? 'up' : 'neutral'}
                trendValue={Number(stats.averageDaily) >= 5 ? 'Ótimo!' : 'Continue!'}
                gradient="bg-gradient-to-br from-violet-400 to-purple-500"
              />
              <StatCard
                title="Taxa de Conclusão"
                value={`${stats.completionRate}%`}
                subtitle={`${stats.pending} pendentes`}
                icon={Target}
                trend={stats.completionRate >= 70 ? 'up' : stats.completionRate >= 50 ? 'neutral' : 'down'}
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              />
            </div>

            {/* Comparação semanal */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {comparison.difference >= 0 ? (
                      <TrendingUp className="h-8 w-8" />
                    ) : (
                      <TrendingDown className="h-8 w-8" />
                    )}
                    <div>
                      <h3 className="font-semibold">Comparação Semanal</h3>
                      <p className="text-white/80 text-sm">Semana atual vs anterior</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{comparison.thisWeek}</p>
                      <p className="text-xs text-white/70">Esta semana</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/50" />
                    <div className="text-center">
                      <p className="text-2xl font-bold">{comparison.lastWeek}</p>
                      <p className="text-xs text-white/70">Semana anterior</p>
                    </div>
                    <div className="h-10 w-px bg-white/30" />
                    <div className="text-center">
                      <p className={cn(
                        'text-2xl font-bold',
                        comparison.percentChange >= 0 ? 'text-green-300' : 'text-red-300'
                      )}>
                        {comparison.percentChange >= 0 ? '+' : ''}{comparison.percentChange}%
                      </p>
                      <p className="text-xs text-white/70">Variação</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtividade ao longo do tempo - AreaChart */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Produtividade - {period === 'week' ? 'Última Semana' : period === 'month' ? 'Último Mês' : 'Último Ano'}
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {dailyData.length} dias
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey={period === 'week' ? 'day' : 'date'}
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
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Concluídas"
                        stroke="#8b5cf6"
                        fill="url(#colorCompleted)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        name="Total"
                        stroke="#10b981"
                        fill="url(#colorTasks)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Categorias - PieChart */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <PieChartIcon className="h-5 w-5 text-violet-500" />
                    Tarefas por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
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
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {categoryData.map((cat) => (
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
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                      <PieChartIcon className="h-12 w-12 mb-2 opacity-50" />
                      <p>Sem dados suficientes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prioridades - BarChart horizontal */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <Target className="h-5 w-5 text-red-500" />
                    Tarefas por Prioridade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={priorityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9ca3af"
                        fontSize={12}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-around mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {priorityData.map((p) => (
                      <div key={p.name} className="text-center">
                        <p className="text-xl font-bold" style={{ color: p.color }}>{p.value}</p>
                        <p className="text-xs text-gray-500">{p.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progresso Semanal */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      Progresso Semanal
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Últimos 7 dias
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <WeeklyProgressChart data={dailyData.slice(-7)} />
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Total da semana
                    </span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {dailyData.slice(-7).reduce((sum, d) => sum + d.completed, 0)} tarefas
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Horário mais produtivo */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Produtividade por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={hourlyData.filter((_, i) => i >= 6 && i <= 23)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="tasks" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Seu horário mais produtivo: <strong>{bestHour}</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Recorde */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/20 rounded-2xl">
                        <Flame className="h-10 w-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Streak Recorde</h3>
                        <p className="text-white/80">Sua maior sequência de dias consecutivos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-6xl font-bold">{userStats.longestStreak}</p>
                        <p className="text-white/70">dias recorde</p>
                      </div>

                      <div className="h-16 w-px bg-white/30" />

                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Flame className="h-6 w-6 text-yellow-300" />
                          <p className="text-4xl font-bold">{userStats.currentStreak}</p>
                        </div>
                        <p className="text-white/70">sequência atual</p>
                      </div>

                      <div className="h-16 w-px bg-white/30" />

                      <div className="text-center">
                        <p className="text-4xl font-bold">
                          {Math.max(0, userStats.longestStreak - userStats.currentStreak)}
                        </p>
                        <p className="text-white/70">para o recorde</p>
                      </div>
                    </div>
                  </div>

                  {userStats.currentStreak >= userStats.longestStreak ? (
                    <div className="mt-4 p-3 bg-yellow-400/20 rounded-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-300" />
                      <span className="font-medium">Parabéns! Você está no seu melhor momento!</span>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/80">Progresso para o recorde</span>
                        <span className="text-sm font-medium">
                          {Math.round((userStats.currentStreak / userStats.longestStreak) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${(userStats.currentStreak / userStats.longestStreak) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Metas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Meta Diária
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GoalRadialChart current={stats.completed} goal={Math.max(stats.total, 5)} label="Tarefas" />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {stats.completed} de {Math.max(stats.total, 5)} tarefas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Meta de Foco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GoalRadialChart current={stats.totalMinutes} goal={120} label="Minutos" />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {stats.totalMinutes} de 120 minutos
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Meta de XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GoalRadialChart current={userStats.totalXP} goal={3000} label="XP" />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {userStats.totalXP} de 3000 XP
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dica personalizada */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Insight Personalizado
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {bestHour !== 'N/A'
                        ? `Você é mais produtivo às ${bestHour}! Tente agendar suas tarefas mais importantes nesse horário.`
                        : 'Continue completando tarefas para descobrir seu horário mais produtivo!'
                      }
                      {comparison.percentChange > 0 && ` Esta semana você está ${comparison.percentChange}% mais produtivo que a anterior. Continue assim!`}
                      {comparison.percentChange < 0 && ` Que tal focar um pouco mais esta semana? Você consegue!`}
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
