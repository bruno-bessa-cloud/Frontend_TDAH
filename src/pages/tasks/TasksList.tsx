import useTasks from '../../hooks/useTasks'

export default function TasksList() {
  const { data: tasks, isLoading, isError } = useTasks()

  if (isLoading) return <div className="p-6">Carregando tarefas...</div>
  if (isError) return <div className="p-6">Erro ao carregar tarefas</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Tarefas</h2>
      {tasks && tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="p-4 border rounded">
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-gray-600">Prazo: {new Date(task.deadline).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div>Nenhuma tarefa encontrada</div>
      )}
    </div>
  )
}
