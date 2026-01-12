import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import type { TaskCategory, TaskPriority, TaskStatus } from "@/types"

export interface TaskFilters {
  search: string
  category: TaskCategory | "all"
  priority: TaskPriority | "all"
  status: TaskStatus | "all"
}

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  onReset: () => void
}

const categories = [
  { value: "all", label: "Todas as categorias", icon: "🌐" },
  { value: "0", label: "Estudos", icon: "📚" },
  { value: "1", label: "Trabalho", icon: "💼" },
  { value: "2", label: "Casa", icon: "🏠" },
  { value: "3", label: "Saúde", icon: "💚" },
  { value: "4", label: "Lazer", icon: "🎮" },
  { value: "5", label: "Outros", icon: "📌" },
]

const priorities = [
  { value: "all", label: "Todas as prioridades" },
  { value: "0", label: "Baixa" },
  { value: "1", label: "Média" },
  { value: "2", label: "Alta" },
]

const statuses = [
  { value: "all", label: "Todos os status" },
  { value: "0", label: "Pendente" },
  { value: "1", label: "Em Progresso" },
  { value: "2", label: "Concluída" },
  { value: "3", label: "Cancelada" },
]

export function TaskFiltersComponent({ filters, onFiltersChange, onReset }: TaskFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all"

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-base font-semibold flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar
            </Label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="Buscar tarefas..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFiltersChange({ ...filters, search: e.target.value })
                }
                className="pr-10"
              />
              {filters.search && (
                <button
                  onClick={() => onFiltersChange({ ...filters, search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria</Label>
              <Select
                value={filters.category.toString()}
                onValueChange={(value: string) =>
                  onFiltersChange({
                    ...filters,
                    category: value === "all" ? "all" : (parseInt(value) as TaskCategory),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prioridade</Label>
              <Select
                value={filters.priority.toString()}
                onValueChange={(value: string) =>
                  onFiltersChange({
                    ...filters,
                    priority: value === "all" ? "all" : (parseInt(value) as TaskPriority),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={filters.status.toString()}
                onValueChange={(value: string) =>
                  onFiltersChange({
                    ...filters,
                    status: value === "all" ? "all" : (parseInt(value) as TaskStatus),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
