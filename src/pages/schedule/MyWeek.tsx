import { useState, useMemo, useCallback } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import PomodoroTimer from '@/components/timer/PomodoroTimer';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  GraduationCap,
  CalendarClock,
  Clock,
  CalendarRange,
  RefreshCw,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { TimeBlockType, TaskStatus, TaskPriority, TaskCategory } from '@/types';
import type { TimeBlock, Task, ScheduledTask } from '@/types';
import { cn } from '@/lib/utils';
import { scheduleTasksInWeek, getWeekStartDate } from '@/lib/scheduler';
import toast from 'react-hot-toast';

// Mapeamento de prioridades para labels
const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  [TaskPriority.HIGH]: { label: 'Alta', color: 'text-red-600 bg-red-100' },
  [TaskPriority.MEDIUM]: { label: 'Média', color: 'text-yellow-600 bg-yellow-100' },
  [TaskPriority.LOW]: { label: 'Baixa', color: 'text-green-600 bg-green-100' },
};

// Mapeamento de categorias para labels
const CATEGORY_LABELS: Record<number, string> = {
  [TaskCategory.STUDY]: 'Estudos',
  [TaskCategory.WORK]: 'Trabalho',
  [TaskCategory.HOME]: 'Casa',
  [TaskCategory.HEALTH]: 'Saúde',
  [TaskCategory.LEISURE]: 'Lazer',
  [TaskCategory.OTHER]: 'Outros',
};

// Configuração de cores por tipo de bloco
const BLOCK_TYPE_CONFIG = {
  [TimeBlockType.WORK]: {
    label: 'Trabalho',
    icon: Briefcase,
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-100 dark:bg-blue-900/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-400',
  },
  [TimeBlockType.CLASS]: {
    label: 'Aula',
    icon: GraduationCap,
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-100 dark:bg-purple-900/40',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-400',
  },
  [TimeBlockType.FIXED]: {
    label: 'Compromisso',
    icon: CalendarClock,
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-100 dark:bg-orange-900/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-400',
  },
  [TimeBlockType.TASK]: {
    label: 'Tarefa',
    icon: Clock,
    bgColor: 'bg-green-500',
    lightBg: 'bg-green-100 dark:bg-green-900/40',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-400',
  },
};

// Dias da semana (Segunda a Domingo para exibição)
const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
];

// Gerar horários de 6h às 23h com steps de 30min
const TIME_SLOTS: string[] = [];
for (let hour = 6; hour <= 23; hour++) {
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
  if (hour < 23) {
    TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
  }
}

// Meses em português
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Carregar blocos do localStorage
const loadBlocks = (): TimeBlock[] => {
  try {
    const saved = localStorage.getItem('weeklyRoutine');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return [];
};

// Carregar tarefas do localStorage
const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return [];
};

// Função para obter a segunda-feira da semana de uma data
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Função para formatar intervalo de datas
const formatWeekRange = (monday: Date): string => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const startMonth = MONTHS_PT[monday.getMonth()];
  const endMonth = MONTHS_PT[sunday.getMonth()];
  const year = monday.getFullYear();

  if (monday.getMonth() === sunday.getMonth()) {
    return `${startDay}-${endDay} ${startMonth} ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
};

// Converter tempo (HH:mm) para minutos desde meia-noite
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Calcular posição e altura do bloco
const getBlockStyle = (block: TimeBlock): { top: string; height: string } => {
  const startMinutes = timeToMinutes(block.startTime);
  const endMinutes = timeToMinutes(block.endTime);
  const dayStartMinutes = 6 * 60; // 6:00

  const topOffset = ((startMinutes - dayStartMinutes) / 30) * 40; // 40px por slot de 30min
  const height = ((endMinutes - startMinutes) / 30) * 40;

  return {
    top: `${Math.max(0, topOffset)}px`,
    height: `${Math.max(40, height)}px`,
  };
};

// Verificar se um bloco é válido para uma data específica
const isBlockValidForDate = (block: TimeBlock, date: Date): boolean => {
  // Se não é recorrente ou não tem datas de validade, sempre é válido
  if (!block.isRecurring) return true;
  if (!block.validFrom && !block.validUntil) return true;

  // Normalizar a data para comparação (apenas ano/mês/dia)
  const dateStr = date.toISOString().split('T')[0];

  // Verificar validFrom
  if (block.validFrom) {
    const validFromStr = block.validFrom.split('T')[0];
    if (dateStr < validFromStr) return false;
  }

  // Verificar validUntil
  if (block.validUntil) {
    const validUntilStr = block.validUntil.split('T')[0];
    if (dateStr > validUntilStr) return false;
  }

  return true;
};

// Formatar data curta
const formatShortDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export default function MyWeek() {
  const [blocks] = useState<TimeBlock[]>(loadBlocks);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0); // Para mobile
  const [selectedScheduledTask, setSelectedScheduledTask] = useState<ScheduledTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  // Função para reagendar tarefas na semana
  const handleReschedule = useCallback(() => {
    setIsScheduling(true);

    try {
      // Obtém o domingo da semana (início da semana para o scheduler)
      const weekStart = getWeekStartDate(currentMonday);

      // Executa o algoritmo de agendamento
      const scheduled = scheduleTasksInWeek(blocks, tasks, weekStart);

      setScheduledTasks(scheduled);

      if (scheduled.length > 0) {
        toast.success(`${scheduled.length} tarefa${scheduled.length > 1 ? 's' : ''} agendada${scheduled.length > 1 ? 's' : ''} com sucesso!`);
      } else {
        toast('Nenhuma tarefa pendente para agendar', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('[MyWeek] Erro ao agendar tarefas:', error);
      toast.error('Erro ao agendar tarefas');
    } finally {
      setIsScheduling(false);
    }
  }, [blocks, tasks, currentMonday]);

  // Abrir dialog com detalhes da tarefa agendada
  const handleScheduledTaskClick = useCallback((scheduled: ScheduledTask) => {
    setSelectedScheduledTask(scheduled);
    setIsDialogOpen(true);
  }, []);

  // Marcar tarefa como concluída
  const handleMarkTaskCompleted = useCallback(() => {
    if (!selectedScheduledTask) return;

    // Atualiza a tarefa no array de tasks
    const updatedTasks = tasks.map((task) => {
      if (task.id === selectedScheduledTask.taskId) {
        return { ...task, status: TaskStatus.COMPLETED };
      }
      return task;
    });

    // Salva no localStorage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);

    // Remove a tarefa agendada do array (já foi concluída)
    const updatedScheduled = scheduledTasks.filter(
      (st) => st.taskId !== selectedScheduledTask.taskId
    );
    setScheduledTasks(updatedScheduled);

    // Fecha o dialog e mostra toast
    setIsDialogOpen(false);
    setSelectedScheduledTask(null);
    toast.success('Tarefa marcada como concluída!');
  }, [selectedScheduledTask, tasks, scheduledTasks]);

  // Navegar semanas
  const goToPreviousWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(newMonday);
  };

  const goToNextWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(newMonday);
  };

  const goToToday = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  // Calcular datas da semana atual
  const weekDates = useMemo(() => {
    return DAYS_OF_WEEK.map((day, index) => {
      const date = new Date(currentMonday);
      date.setDate(currentMonday.getDate() + index);
      return {
        ...day,
        date,
        dayNumber: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
      };
    });
  }, [currentMonday]);

  // Agrupar blocos por dia, filtrando por validade
  const blocksByDay = useMemo(() => {
    const grouped: Record<number, TimeBlock[]> = {};

    weekDates.forEach((dayInfo) => {
      grouped[dayInfo.value] = blocks
        // Filtrar pelo dia da semana
        .filter((b) => b.dayOfWeek === dayInfo.value)
        // Filtrar pelo horário válido (6h-24h)
        .filter((b) => {
          const startMinutes = timeToMinutes(b.startTime);
          return startMinutes >= 6 * 60 && startMinutes < 24 * 60;
        })
        // Filtrar pela validade da data
        .filter((b) => isBlockValidForDate(b, dayInfo.date))
        // Ordenar por horário
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return grouped;
  }, [blocks, weekDates]);

  // Contar total de blocos na semana
  const totalBlocksThisWeek = useMemo(() => {
    return Object.values(blocksByDay).reduce((sum, dayBlocks) => sum + dayBlocks.length, 0);
  }, [blocksByDay]);

  // Agrupar tarefas agendadas por dia
  const scheduledByDay = useMemo(() => {
    const grouped: Record<number, ScheduledTask[]> = {};

    // Inicializar todos os dias
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day.value] = [];
    });

    // Agrupar tarefas agendadas
    scheduledTasks.forEach((scheduled) => {
      if (grouped[scheduled.dayOfWeek]) {
        grouped[scheduled.dayOfWeek].push(scheduled);
      }
    });

    // Ordenar por horário de início
    Object.keys(grouped).forEach((day) => {
      grouped[Number(day)].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return grouped;
  }, [scheduledTasks]);

  // Calcular estilo para tarefas agendadas (mesmo que blocos fixos)
  const getScheduledTaskStyle = (scheduled: ScheduledTask): { top: string; height: string } => {
    const startMinutes = timeToMinutes(scheduled.startTime);
    const endMinutes = timeToMinutes(scheduled.endTime);
    const dayStartMinutes = 6 * 60; // 6:00

    const topOffset = ((startMinutes - dayStartMinutes) / 30) * 40; // 40px por slot
    const height = ((endMinutes - startMinutes) / 30) * 40;

    return {
      top: `${Math.max(0, topOffset)}px`,
      height: `${Math.max(40, height)}px`,
    };
  };

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-7 w-7 text-focus-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    Minha Semana
                    <Badge variant="secondary" className="text-xs">
                      {totalBlocksThisWeek} compromisso{totalBlocksThisWeek !== 1 ? 's' : ''}
                    </Badge>
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatWeekRange(currentMonday)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReschedule}
                  disabled={isScheduling}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RefreshCw className={cn('h-4 w-4 mr-2', isScheduling && 'animate-spin')} />
                  {isScheduling ? 'Agendando...' : 'Reagendar Semana'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="text-focus-blue-600 border-focus-blue-300 hover:bg-focus-blue-50"
                >
                  Hoje
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousWeek}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextWeek}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile: Seletor de dia */}
            <div className="flex md:hidden gap-1 overflow-x-auto pb-2">
              {weekDates.map((day, index) => {
                const dayBlockCount = blocksByDay[day.value]?.length || 0;
                return (
                  <Button
                    key={day.value}
                    variant={selectedDayIndex === index ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDayIndex(index)}
                    className={cn(
                      'flex-shrink-0 flex-col h-auto py-2 px-3 relative',
                      selectedDayIndex === index &&
                        'bg-focus-blue-500 hover:bg-focus-blue-600',
                      day.isToday && selectedDayIndex !== index &&
                        'border-focus-blue-500 text-focus-blue-600'
                    )}
                  >
                    <span className="text-xs">{day.short}</span>
                    <span className="text-lg font-bold">{day.dayNumber}</span>
                    {dayBlockCount > 0 && (
                      <span className={cn(
                        'absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center',
                        selectedDayIndex === index
                          ? 'bg-white text-focus-blue-600'
                          : 'bg-focus-blue-500 text-white'
                      )}>
                        {dayBlockCount}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(BLOCK_TYPE_CONFIG).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={cn('w-3 h-3 rounded', config.bgColor)} />
                    <Icon className={cn('h-4 w-4', config.textColor)} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {config.label}
                    </span>
                  </div>
                );
              })}
              {/* Legenda para tarefas agendadas */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500" />
                <CheckSquare className="h-4 w-4 text-green-700 dark:text-green-300" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Tarefa Agendada
                </span>
                {scheduledTasks.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                    {scheduledTasks.length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Grid Desktop: 7 colunas */}
            <div className="hidden md:grid md:grid-cols-7 gap-2">
              {weekDates.map((day) => {
                const dayBlocks = blocksByDay[day.value] || [];

                return (
                  <Card
                    key={day.value}
                    className={cn(
                      'border-0 shadow-md overflow-hidden',
                      day.isToday && 'ring-2 ring-focus-blue-500'
                    )}
                  >
                    <CardHeader className="py-2 px-3 bg-gray-50 dark:bg-gray-800">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className={cn(day.isToday && 'text-focus-blue-600 dark:text-focus-blue-400')}>
                          {day.short}
                        </span>
                        <Badge
                          variant={day.isToday ? 'default' : 'outline'}
                          className={cn(
                            'text-xs h-6 w-6 p-0 flex items-center justify-center rounded-full',
                            day.isToday && 'bg-focus-blue-500'
                          )}
                        >
                          {day.dayNumber}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Container com altura fixa e scroll */}
                      <div
                        className="relative overflow-y-auto"
                        style={{ height: '500px' }}
                      >
                        {/* Linhas de horário */}
                        <div className="absolute inset-0">
                          {TIME_SLOTS.map((slot, idx) => (
                            <div
                              key={slot}
                              className="h-10 border-b border-gray-100 dark:border-gray-700 flex items-start"
                            >
                              {idx % 2 === 0 && (
                                <span className="text-[10px] text-gray-400 pl-1 -mt-1">
                                  {slot}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Blocos fixos */}
                        <div className="absolute inset-0 left-7">
                          {dayBlocks.map((block) => {
                            const config = BLOCK_TYPE_CONFIG[block.type];
                            const style = getBlockStyle(block);
                            const hasDateRange = block.validFrom || block.validUntil;

                            return (
                              <div
                                key={block.id}
                                className={cn(
                                  'absolute left-0 right-1 rounded-md px-1.5 py-1 overflow-hidden border-l-4',
                                  config.lightBg,
                                  config.borderColor
                                )}
                                style={style}
                                title={hasDateRange ? `Válido: ${formatShortDate(block.validFrom)} - ${formatShortDate(block.validUntil) || '∞'}` : undefined}
                              >
                                <p
                                  className={cn(
                                    'text-xs font-medium truncate',
                                    config.textColor
                                  )}
                                >
                                  {block.title}
                                </p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {block.startTime} - {block.endTime}
                                </p>
                                {hasDateRange && (
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    <CalendarRange className="h-2.5 w-2.5 text-gray-400" />
                                    <span className="text-[9px] text-gray-400">
                                      {formatShortDate(block.validFrom)}{block.validUntil ? ` - ${formatShortDate(block.validUntil)}` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Tarefas agendadas */}
                          {(scheduledByDay[day.value] || []).map((scheduled) => {
                            const style = getScheduledTaskStyle(scheduled);

                            return (
                              <div
                                key={scheduled.id}
                                className="absolute left-0 right-1 rounded-md px-1.5 py-1 overflow-hidden border-l-4 bg-green-100 dark:bg-green-900/30 border-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                style={style}
                                title={`Tarefa: ${scheduled.task.title}`}
                                onClick={() => handleScheduledTaskClick(scheduled)}
                              >
                                <div className="flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3 flex-shrink-0 text-green-700 dark:text-green-300" />
                                  <p className="text-xs font-medium truncate text-green-700 dark:text-green-300">
                                    {scheduled.task.title}
                                  </p>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {scheduled.startTime} - {scheduled.endTime}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mensagem se não houver blocos nem tarefas agendadas */}
                        {dayBlocks.length === 0 && (scheduledByDay[day.value] || []).length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-xs text-gray-400">Livre</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Mobile: 1 dia por vez */}
            <div className="md:hidden">
              {weekDates
                .filter((_, index) => index === selectedDayIndex)
                .map((day) => {
                  const dayBlocks = blocksByDay[day.value] || [];

                  return (
                    <Card
                      key={day.value}
                      className={cn(
                        'border-0 shadow-lg overflow-hidden',
                        day.isToday && 'ring-2 ring-focus-blue-500'
                      )}
                    >
                      <CardHeader className="py-3 px-4 bg-gray-50 dark:bg-gray-800">
                        <CardTitle className="text-base font-semibold flex items-center justify-between">
                          <span className={cn(day.isToday && 'text-focus-blue-600 dark:text-focus-blue-400')}>
                            {day.label}, {day.dayNumber}
                          </span>
                          {day.isToday && (
                            <Badge className="bg-focus-blue-500">Hoje</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div
                          className="relative overflow-y-auto"
                          style={{ height: '60vh' }}
                        >
                          {/* Linhas de horário */}
                          <div className="absolute inset-0">
                            {TIME_SLOTS.map((slot, idx) => (
                              <div
                                key={slot}
                                className="h-10 border-b border-gray-100 dark:border-gray-700 flex items-start"
                              >
                                {idx % 2 === 0 && (
                                  <span className="text-xs text-gray-400 pl-2 -mt-1 w-12">
                                    {slot}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Blocos fixos */}
                          <div className="absolute inset-0 left-14">
                            {dayBlocks.map((block) => {
                              const config = BLOCK_TYPE_CONFIG[block.type];
                              const Icon = config.icon;
                              const style = getBlockStyle(block);
                              const hasDateRange = block.validFrom || block.validUntil;

                              return (
                                <div
                                  key={block.id}
                                  className={cn(
                                    'absolute left-0 right-2 rounded-lg px-3 py-2 overflow-hidden border-l-4 shadow-sm',
                                    config.lightBg,
                                    config.borderColor
                                  )}
                                  style={style}
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className={cn('h-4 w-4 flex-shrink-0', config.textColor)} />
                                    <p
                                      className={cn(
                                        'text-sm font-medium truncate',
                                        config.textColor
                                      )}
                                    >
                                      {block.title}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {block.startTime} - {block.endTime}
                                  </p>
                                  {hasDateRange && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <CalendarRange className="h-3 w-3 text-gray-400" />
                                      <span className="text-[10px] text-gray-400">
                                        {formatShortDate(block.validFrom)}{block.validUntil ? ` - ${formatShortDate(block.validUntil)}` : ' em diante'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Tarefas agendadas (mobile) */}
                            {(scheduledByDay[day.value] || []).map((scheduled) => {
                              const style = getScheduledTaskStyle(scheduled);

                              return (
                                <div
                                  key={scheduled.id}
                                  className="absolute left-0 right-2 rounded-lg px-3 py-2 overflow-hidden border-l-4 shadow-sm bg-green-100 dark:bg-green-900/30 border-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                  style={style}
                                  onClick={() => handleScheduledTaskClick(scheduled)}
                                >
                                  <div className="flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 flex-shrink-0 text-green-700 dark:text-green-300" />
                                    <p className="text-sm font-medium truncate text-green-700 dark:text-green-300">
                                      {scheduled.task.title}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {scheduled.startTime} - {scheduled.endTime}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Mensagem se não houver blocos nem tarefas agendadas */}
                          {dayBlocks.length === 0 && (scheduledByDay[day.value] || []).length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Nenhum compromisso</p>
                                <p className="text-xs">Dia livre!</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Resumo do dia (mobile) */}
            <div className="md:hidden">
              {(() => {
                const day = weekDates[selectedDayIndex];
                const dayBlocks = blocksByDay[day.value] || [];
                if (dayBlocks.length === 0) return null;

                // Calcular tempo total
                const totalMinutes = dayBlocks.reduce((sum, block) => {
                  const start = timeToMinutes(block.startTime);
                  const end = timeToMinutes(block.endTime);
                  return sum + (end - start);
                }, 0);
                const hours = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;

                return (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {dayBlocks.length} compromisso{dayBlocks.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-medium text-focus-blue-600 dark:text-focus-blue-400">
                          {hours}h{mins > 0 ? ` ${mins}min` : ''} ocupado{hours !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Dialog de detalhes da tarefa agendada */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              Tarefa Agendada
            </DialogTitle>
            <DialogDescription>
              Detalhes da tarefa e opções de gerenciamento
            </DialogDescription>
          </DialogHeader>

          {selectedScheduledTask && (
            <div className="space-y-4">
              {/* Título da tarefa */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedScheduledTask.task.title}
                </h3>
                {selectedScheduledTask.task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedScheduledTask.task.description}
                  </p>
                )}
              </div>

              {/* Informações do agendamento */}
              <div className="grid grid-cols-2 gap-3">
                {/* Horário */}
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Timer className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Horário</p>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      {selectedScheduledTask.startTime} - {selectedScheduledTask.endTime}
                    </p>
                  </div>
                </div>

                {/* Data */}
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Data</p>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {new Date(selectedScheduledTask.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {/* Prioridade */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prioridade</p>
                    <Badge className={cn('text-xs', PRIORITY_LABELS[selectedScheduledTask.task.priority]?.color)}>
                      {PRIORITY_LABELS[selectedScheduledTask.task.priority]?.label || 'Normal'}
                    </Badge>
                  </div>
                </div>

                {/* Categoria */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Categoria</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {CATEGORY_LABELS[selectedScheduledTask.task.category] || 'Outros'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duração estimada */}
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="text-sm text-amber-700 dark:text-amber-300">Duração estimada</span>
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {selectedScheduledTask.task.estimatedMinutes} minutos
                </span>
              </div>

              {/* Deadline */}
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm text-red-700 dark:text-red-300">Prazo final</span>
                <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {new Date(selectedScheduledTask.task.deadline).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Fechar
            </Button>
            {selectedScheduledTask?.task.category === TaskCategory.STUDY && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setTimerOpen(true);
                }}
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                <Timer className="h-4 w-4 mr-2" />
                Iniciar Pomodoro
              </Button>
            )}
            <Button
              onClick={handleMarkTaskCompleted}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar Concluída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {timerOpen && (
        <PomodoroTimer
          open={timerOpen}
          onClose={() => setTimerOpen(false)}
          taskTitle={selectedScheduledTask?.task.title || ''}
          taskId={selectedScheduledTask?.taskId || ''}
        />
      )}
    </SidebarProvider>
  );
}
