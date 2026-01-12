import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { CreateTaskDto } from '@/types';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm, type TaskFormData } from '@/components/tasks/TaskForm';
import { TaskFiltersComponent, type TaskFilters } from '@/components/tasks/TaskFilters';
import { Plus, LogOut, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task, TaskStatus } from '@/types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const queryClient = useQueryClient();

  const [isMutating, setIsMutating] = useState(false);

  // Strongly-typed mutation payloads
  type NewTaskPayload = CreateTaskDto & { status?: TaskStatus };
  type UpdateTaskVariables = { id: string; data: Partial<CreateTaskDto & { status?: TaskStatus }> };

  const createTask = useMutation<Task, Error, NewTaskPayload>({
    mutationFn: async (payload: NewTaskPayload) => {
      const res = await api.post<Task>('/tasks', payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateTask = useMutation<Task, Error, UpdateTaskVariables>({
    mutationFn: async ({ id, data }: UpdateTaskVariables) => {
      const res = await api.put<Task>(`/tasks/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation<void, Error, string>({
    mutationFn: async (taskId: string) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    category: 'all',
    priority: 'all',
    status: 'all',
  });

  // Filtrar tarefas
  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      filters.search === '' ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = filters.category === 'all' || task.category === filters.category;

    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

    const matchesStatus = filters.status === 'all' || task.status === filters.status;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: tasks?.length || 0,
    pending: tasks?.filter((t) => t.status === 0).length || 0,
    inProgress: tasks?.filter((t) => t.status === 1).length || 0,
    completed: tasks?.filter((t) => t.status === 2).length || 0,
  };

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      setIsMutating(true);
      await createTask.mutateAsync({
        ...data,
        status: 0, // Pendente
        deadline: new Date(data.deadline).toISOString(),
      });
      toast.success('Tarefa criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar tarefa');
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;

    try {
      setIsMutating(true);
      await updateTask.mutateAsync({
        id: editingTask.id,
        data: {
          ...data,
          deadline: new Date(data.deadline).toISOString(),
        },
      });
      toast.success('Tarefa atualizada!');
      setEditingTask(null);
    } catch {
      toast.error('Erro ao atualizar tarefa');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      setIsMutating(true);
      await deleteTask.mutateAsync(taskId);
      toast.success('Tarefa excluída!');
    } catch {
      toast.error('Erro ao excluir tarefa');
    } finally {
      setIsMutating(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const task = tasks?.find((t) => t.id === taskId);
    if (!task) return;

    try {
      setIsMutating(true);
      await updateTask.mutateAsync({
        id: taskId,
        data: { ...task, status },
      });
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setIsMutating(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priority: 'all',
      status: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TDAH Tasks
                </h1>
                <p className="text-sm text-gray-600">
                  Olá, <span className="font-semibold">{user?.name}</span>! 👋
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </Button>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total de Tarefas</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-400">
            <div className="text-sm text-gray-600 mb-1">Pendentes</div>
            <div className="text-3xl font-bold text-gray-700">{stats.pending}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">Em Progresso</div>
            <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Concluídas</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando tarefas...</p>
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filters.search ||
              filters.category !== 'all' ||
              filters.priority !== 'all' ||
              filters.status !== 'all'
                ? 'Nenhuma tarefa encontrada'
                : 'Nenhuma tarefa ainda'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search ||
              filters.category !== 'all' ||
              filters.priority !== 'all' ||
              filters.status !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Comece criando sua primeira tarefa!'}
            </p>
            {!filters.search &&
              filters.category === 'all' &&
              filters.priority === 'all' &&
              filters.status === 'all' && (
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Primeira Tarefa
                </Button>
              )}
          </div>
        )}
      </main>

      {/* Task Form Dialog */}
      <TaskForm
        task={editingTask}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        isLoading={isMutating}
      />
    </div>
  );
}
