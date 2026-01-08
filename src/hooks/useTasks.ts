import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import type { Task } from '../types'

export function useTasks() {
  return useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks')
      return response.data as Task[]
    },
  })
}

export default useTasks
