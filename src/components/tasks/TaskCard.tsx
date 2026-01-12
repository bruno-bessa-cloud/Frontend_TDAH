import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Flag, CheckCircle2, Circle, Play, X } from "lucide-react"
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/pt-br"

dayjs.extend(relativeTime)
dayjs.locale("pt-br")

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

const categoryConfig = {
  0: { label: "Estudos", color: "bg-blue-100 text-blue-800 border-blue-200" },
  1: { label: "Trabalho", color: "bg-purple-100 text-purple-800 border-purple-200" },
  2: { label: "Casa", color: "bg-green-100 text-green-800 border-green-200" },
  3: { label: "Saúde", color: "bg-red-100 text-red-800 border-red-200" },
  4: { label: "Lazer", color: "bg-amber-100 text-amber-800 border-amber-200" },
  5: { label: "Outros", color: "bg-gray-100 text-gray-800 border-gray-200" },
}

const priorityConfig = {
  0: { label: "Baixa", icon: Flag, color: "text-gray-500" },
  1: { label: "Média", icon: Flag, color: "text-orange-500" },
  2: { label: "Alta", icon: Flag, color: "text-red-500" },
}

const statusConfig = {
  0: { label: "Pendente", icon: Circle, color: "text-gray-400" },
  1: { label: "Em Progresso", icon: Play, color: "text-blue-500" },
  2: { label: "Concluída", icon: CheckCircle2, color: "text-green-500" },
  3: { label: "Cancelada", icon: X, color: "text-red-500" },
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const category = categoryConfig[task.category as TaskCategory]
  const priority = priorityConfig[task.priority as TaskPriority]
  const status = statusConfig[task.status as TaskStatus]
  
  const PriorityIcon = priority.icon
  const StatusIcon = status.icon
  
  const isOverdue = dayjs(task.deadline).isBefore(dayjs()) && task.status !== 2
  const deadlineText = dayjs(task.deadline).fromNow()

  const handleStatusCycle = () => {
    if (!onStatusChange) return
    
    const statusCycle: TaskStatus[] = [0, 1, 2]
    const currentIndex = statusCycle.indexOf(task.status)
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
    
    onStatusChange(task.id, nextStatus)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 hover:scale-[1.02]" 
          style={{ borderLeftColor: isOverdue ? '#ef4444' : undefined }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`${category.color} border`}>
                {category.label}
              </Badge>
              <div className="flex items-center gap-1">
                <PriorityIcon className={`w-4 h-4 ${priority.color}`} />
                <span className={`text-xs font-medium ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>
          </div>
          
          <button
            onClick={handleStatusCycle}
            className="shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={`Status: ${status.label}`}
          >
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
          </button>
        </div>
      </CardHeader>

      {task.description && (
        <CardContent className="pb-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{task.estimatedMinutes} min</span>
          </div>
          
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
            <Calendar className="w-4 h-4" />
            <span>{deadlineText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8"
            >
              Editar
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Excluir
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
