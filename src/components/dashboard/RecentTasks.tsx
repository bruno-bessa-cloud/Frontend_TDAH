import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Calendar,
  ChevronRight,
  BookOpen,
  Briefcase,
  Home,
  Dumbbell,
  Gamepad2,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  PlayCircle,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

// Dados mockados para demonstração
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar capítulo de React Hooks',
    description: 'Estudar useEffect e useCallback',
    category: TaskCategory.STUDY,
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    estimatedMinutes: 45,
    deadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Responder emails pendentes',
    description: 'Verificar inbox e responder clientes',
    category: TaskCategory.WORK,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    estimatedMinutes: 30,
    deadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Fazer exercícios de alongamento',
    description: '15 minutos de yoga matinal',
    category: TaskCategory.HEALTH,
    priority: TaskPriority.LOW,
    status: TaskStatus.PENDING,
    estimatedMinutes: 15,
    deadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Preparar apresentação do projeto',
    description: 'Slides para reunião de sexta',
    category: TaskCategory.WORK,
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    estimatedMinutes: 60,
    deadline: new Date(Date.now() + 86400000).toISOString(), // Amanhã
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Organizar escritório',
    description: 'Limpar mesa e organizar documentos',
    category: TaskCategory.HOME,
    priority: TaskPriority.LOW,
    status: TaskStatus.PENDING,
    estimatedMinutes: 40,
    deadline: new Date(Date.now() + 86400000).toISOString(), // Amanhã
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Estudar TypeScript avançado',
    description: 'Generics e utility types',
    category: TaskCategory.STUDY,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    estimatedMinutes: 90,
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 dias
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Jogar partida de xadrez online',
    description: 'Relaxar com uma partida rápida',
    category: TaskCategory.LEISURE,
    priority: TaskPriority.LOW,
    status: TaskStatus.PENDING,
    estimatedMinutes: 20,
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 dias
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Função para simular busca de tarefas (será substituída por chamada real à API)
const fetchTasks = async (): Promise<Task[]> => {
  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockTasks;
};

// Helpers para categorias
const getCategoryIcon = (category: TaskCategory) => {
  const icons: Record<TaskCategory, React.ReactNode> = {
    [TaskCategory.STUDY]: <BookOpen className="h-4 w-4" />,
    [TaskCategory.WORK]: <Briefcase className="h-4 w-4" />,
    [TaskCategory.HOME]: <Home className="h-4 w-4" />,
    [TaskCategory.HEALTH]: <Dumbbell className="h-4 w-4" />,
    [TaskCategory.LEISURE]: <Gamepad2 className="h-4 w-4" />,
    [TaskCategory.OTHER]: <MoreHorizontal className="h-4 w-4" />,
  };
  return icons[category];
};

const getCategoryLabel = (category: TaskCategory) => {
  const labels: Record<TaskCategory, string> = {
    [TaskCategory.STUDY]: 'Estudos',
    [TaskCategory.WORK]: 'Trabalho',
    [TaskCategory.HOME]: 'Casa',
    [TaskCategory.HEALTH]: 'Saúde',
    [TaskCategory.LEISURE]: 'Lazer',
    [TaskCategory.OTHER]: 'Outros',
  };
  return labels[category];
};

const getCategoryColor = (category: TaskCategory) => {
  const colors: Record<TaskCategory, string> = {
    [TaskCategory.STUDY]: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    [TaskCategory.WORK]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [TaskCategory.HOME]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    [TaskCategory.HEALTH]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    [TaskCategory.LEISURE]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    [TaskCategory.OTHER]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };
  return colors[category];
};

// Helpers para prioridade
const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [TaskPriority.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[priority];
};

const getPriorityLabel = (priority: TaskPriority) => {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'Baixa',
    [TaskPriority.MEDIUM]: 'Média',
    [TaskPriority.HIGH]: 'Alta',
  };
  return labels[priority];
};

// Helper para status
const getStatusIcon = (status: TaskStatus) => {
  const icons: Record<TaskStatus, React.ReactNode> = {
    [TaskStatus.PENDING]: <Circle className="h-4 w-4 text-gray-400" />,
    [TaskStatus.IN_PROGRESS]: <PlayCircle className="h-4 w-4 text-blue-500" />,
    [TaskStatus.COMPLETED]: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    [TaskStatus.CANCELLED]: <Circle className="h-4 w-4 text-gray-300 line-through" />,
  };
  return icons[status];
};

// Componente TaskCardCompact
interface TaskCardCompactProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
}

function TaskCardCompact({ task, onTaskClick }: TaskCardCompactProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div
      onClick={() => onTaskClick?.(task)}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl border border-transparent',
        'hover:border-gray-200 dark:hover:border-gray-700',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'transition-all duration-200 cursor-pointer'
      )}
    >
      {/* Status Icon */}
      <div className="shrink-0">{getStatusIcon(task.status)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-800 dark:text-white truncate">{task.title}</h4>
          {task.priority === TaskPriority.HIGH && (
            <Badge className={cn('shrink-0 text-xs', getPriorityColor(task.priority))}>
              {getPriorityLabel(task.priority)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {/* Category */}
          <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-md text-xs', getCategoryColor(task.category))}>
            {getCategoryIcon(task.category)}
            {getCategoryLabel(task.category)}
          </span>

          {/* Time estimate */}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(task.estimatedMinutes)}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

// Componente de loading skeleton
function TaskSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// Componente de lista vazia
function EmptyTaskList({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

// Componente principal
export function RecentTasks() {
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  // Filtrar tarefas por período
  const filterTasksByPeriod = (period: 'today' | 'tomorrow' | 'week') => {
    if (!tasks) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 86400000);
    const endOfWeek = new Date(today.getTime() + 7 * 86400000);

    return tasks.filter((task) => {
      const deadline = new Date(task.deadline);
      const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

      switch (period) {
        case 'today':
          return deadlineDate.getTime() === today.getTime();
        case 'tomorrow':
          return deadlineDate.getTime() === tomorrow.getTime();
        case 'week':
          return deadlineDate >= today && deadlineDate <= endOfWeek;
        default:
          return false;
      }
    });
  };

  const todayTasks = filterTasksByPeriod('today');
  const tomorrowTasks = filterTasksByPeriod('tomorrow');
  const weekTasks = filterTasksByPeriod('week');

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    // TODO: Abrir modal de detalhes ou navegar para página da tarefa
  };

  const handleViewAll = () => {
    console.log('View all tasks');
    // TODO: Navegar para página de todas as tarefas
  };

  if (error) {
    return (
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar tarefas. Tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <Calendar className="h-5 w-5 text-focus-blue-500" />
            Suas Tarefas
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleViewAll} className="text-focus-blue-500 hover:text-focus-blue-600">
            Ver todas
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="today" className="text-sm">
              Hoje
              {todayTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-focus-blue-100 text-focus-blue-700 dark:bg-focus-blue-900/30 dark:text-focus-blue-400">
                  {todayTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tomorrow" className="text-sm">
              Amanhã
              {tomorrowTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-energy-orange-100 text-energy-orange-700 dark:bg-energy-orange-900/30 dark:text-energy-orange-400">
                  {tomorrowTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="week" className="text-sm">
              Esta Semana
              {weekTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-calm-purple-100 text-calm-purple-700 dark:bg-calm-purple-900/30 dark:text-calm-purple-400">
                  {weekTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-0">
            {isLoading ? (
              <div className="space-y-2">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : todayTasks.length > 0 ? (
              <div className="space-y-1">
                {todayTasks.map((task) => (
                  <TaskCardCompact key={task.id} task={task} onTaskClick={handleTaskClick} />
                ))}
              </div>
            ) : (
              <EmptyTaskList message="Nenhuma tarefa para hoje. Aproveite para descansar!" />
            )}
          </TabsContent>

          <TabsContent value="tomorrow" className="mt-0">
            {isLoading ? (
              <div className="space-y-2">
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : tomorrowTasks.length > 0 ? (
              <div className="space-y-1">
                {tomorrowTasks.map((task) => (
                  <TaskCardCompact key={task.id} task={task} onTaskClick={handleTaskClick} />
                ))}
              </div>
            ) : (
              <EmptyTaskList message="Nenhuma tarefa para amanhã. Que tal planejar algo?" />
            )}
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            {isLoading ? (
              <div className="space-y-2">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : weekTasks.length > 0 ? (
              <div className="space-y-1">
                {weekTasks.map((task) => (
                  <TaskCardCompact key={task.id} task={task} onTaskClick={handleTaskClick} />
                ))}
              </div>
            ) : (
              <EmptyTaskList message="Semana livre! Hora de adicionar novas metas." />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default RecentTasks;
