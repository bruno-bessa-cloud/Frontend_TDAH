export const TaskCategory = {
  STUDY: 0,
  WORK: 1,
  HOME: 2,
  HEALTH: 3,
  LEISURE: 4,
  OTHER: 5,
} as const
export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory]

export const TaskPriority = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const TaskStatus = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Task {
  id: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  estimatedMinutes: number
  actualMinutes?: number
  deadline: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  category: TaskCategory
  priority: TaskPriority
  deadline: string
  estimatedMinutes: number
  description?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  idealSleepHours: string
  wakeUpTime: string
  password: string
  confirmPassword: string
}
