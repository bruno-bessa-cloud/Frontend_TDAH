/**
 * scheduler.ts - Algoritmo de Agendamento Automático de Tarefas
 *
 * Este módulo implementa um sistema inteligente de agendamento que distribui
 * tarefas pendentes nos horários livres da semana, respeitando compromissos
 * fixos (trabalho, aulas, etc.) e priorizando por urgência e importância.
 *
 * Estrutura principal:
 * - Cada dia possui slots de 30 minutos das 06:00 às 23:00
 * - Slots são representados como strings ['06:00', '06:30', '07:00', ...]
 * - Blocos fixos removem slots da disponibilidade
 * - Tarefas são alocadas em sequências consecutivas de slots livres
 *
 * @module scheduler
 * @author Frontend TDAH Team
 * @version 2.0.0
 */

import type { Task, TimeBlock, ScheduledTask } from '../types';
import { TaskStatus, TaskPriority } from '../types';

// ============================================================================
// CONSTANTES DE CONFIGURAÇÃO
// ============================================================================

/** Hora de início do dia disponível para agendamento (6h da manhã) */
const DAY_START_HOUR = 6;

/** Hora de término do dia disponível para agendamento (23h) */
const DAY_END_HOUR = 23;

/** Duração de cada slot em minutos */
const SLOT_DURATION_MINUTES = 30;

/** Total de slots por dia: (23-6) * 2 = 34 slots de 30min cada */
const SLOTS_PER_DAY = (DAY_END_HOUR - DAY_START_HOUR) * (60 / SLOT_DURATION_MINUTES);

/** Número de dias na semana */
const DAYS_IN_WEEK = 7;

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

/**
 * Estrutura que representa os slots disponíveis de uma semana.
 * Cada dia é um array de strings no formato "HH:mm".
 *
 * Exemplo:
 * {
 *   0: ['06:00', '06:30', '07:00', ...], // Domingo
 *   1: ['06:00', '06:30', '07:00', ...], // Segunda
 *   ...
 *   6: ['06:00', '06:30', '07:00', ...]  // Sábado
 * }
 */
type WeekSlots = {
  [day: number]: string[];
};

/**
 * Resultado da busca por slots consecutivos.
 * Contém as informações necessárias para criar um ScheduledTask.
 */
interface ConsecutiveSlotsResult {
  /** Dia da semana onde os slots foram encontrados (0-6) */
  dayOfWeek: number;
  /** Índice inicial no array de slots do dia */
  startIndex: number;
  /** Lista de slots que serão utilizados */
  slots: string[];
}

// ============================================================================
// FUNÇÕES AUXILIARES - MANIPULAÇÃO DE TEMPO
// ============================================================================

/**
 * Converte um horário no formato "HH:mm" para minutos desde meia-noite.
 * Útil para comparações e cálculos de intervalo.
 *
 * @param time - Horário no formato "HH:mm"
 * @returns Total de minutos desde 00:00
 *
 * @example
 * timeToMinutes("06:00") // 360 (6 * 60)
 * timeToMinutes("12:30") // 750 (12 * 60 + 30)
 * timeToMinutes("23:00") // 1380 (23 * 60)
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para formato "HH:mm".
 *
 * @param minutes - Total de minutos desde 00:00
 * @returns Horário no formato "HH:mm"
 *
 * @example
 * minutesToTime(360)  // "06:00"
 * minutesToTime(750)  // "12:30"
 * minutesToTime(1380) // "23:00"
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Gera um ID único para identificar cada agendamento.
 * Combina timestamp com número aleatório para garantir unicidade.
 *
 * @returns String única no formato "sched_timestamp_random"
 *
 * @example
 * generateScheduleId() // "sched_1705678234567_a1b2c3"
 */
function generateScheduleId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `sched_${timestamp}_${random}`;
}

// ============================================================================
// FUNÇÃO: createWeekSlots
// ============================================================================

/**
 * Cria a estrutura de slots disponíveis para toda a semana.
 * Cada dia recebe um array com todos os horários de 30 em 30 minutos,
 * começando às 06:00 e terminando às 22:30 (último slot antes das 23:00).
 *
 * @returns Objeto WeekSlots com 7 dias, cada um com 34 slots
 *
 * Estrutura gerada:
 * - Cada dia: ['06:00', '06:30', '07:00', ..., '22:00', '22:30']
 * - Total: 34 slots por dia (17 horas * 2 slots/hora)
 *
 * @example
 * const weekSlots = createWeekSlots();
 * console.log(weekSlots[0]); // ['06:00', '06:30', ..., '22:30'] - Domingo
 * console.log(weekSlots[0].length); // 34
 */
export function createWeekSlots(): WeekSlots {
  const weekSlots: WeekSlots = {};

  // Itera por cada dia da semana (0 = Domingo até 6 = Sábado)
  for (let day = 0; day < DAYS_IN_WEEK; day++) {
    const daySlots: string[] = [];

    // Gera slots de 30 em 30 minutos das 06:00 às 22:30
    // O último slot começa às 22:30 e termina às 23:00
    for (let slot = 0; slot < SLOTS_PER_DAY; slot++) {
      // Calcula o horário: início (6h * 60min) + (slot * 30min)
      const totalMinutes = DAY_START_HOUR * 60 + slot * SLOT_DURATION_MINUTES;
      const timeString = minutesToTime(totalMinutes);
      daySlots.push(timeString);
    }

    weekSlots[day] = daySlots;
  }

  return weekSlots;
}

// ============================================================================
// FUNÇÃO: getDateForDay
// ============================================================================

/**
 * Calcula a data específica para um dia da semana a partir da data de início.
 * Assume que weekStartDate é um domingo (dia 0 da semana).
 *
 * @param weekStartDate - Data de início da semana (deve ser domingo)
 * @param dayOfWeek - Dia da semana desejado (0 = domingo, 6 = sábado)
 * @returns Data no formato ISO "YYYY-MM-DD"
 *
 * @example
 * // Se weekStartDate é 2026-01-18 (domingo)
 * getDateForDay(new Date('2026-01-18'), 0) // "2026-01-18" (domingo)
 * getDateForDay(new Date('2026-01-18'), 1) // "2026-01-19" (segunda)
 * getDateForDay(new Date('2026-01-18'), 6) // "2026-01-24" (sábado)
 */
export function getDateForDay(weekStartDate: Date, dayOfWeek: number): string {
  // Cria cópia para não modificar o original
  const targetDate = new Date(weekStartDate);

  // Adiciona o número de dias correspondente ao dia da semana
  targetDate.setDate(targetDate.getDate() + dayOfWeek);

  // Retorna apenas a parte da data (YYYY-MM-DD)
  return targetDate.toISOString().split('T')[0];
}

// ============================================================================
// FUNÇÃO: markOccupiedSlots
// ============================================================================

/**
 * Remove slots ocupados pelos blocos fixos da estrutura de slots disponíveis.
 * Modifica o weekSlots removendo os horários que conflitam com fixedBlocks.
 *
 * @param weekSlots - Estrutura de slots da semana (será modificada)
 * @param fixedBlocks - Lista de blocos de tempo fixos (trabalho, aulas, etc.)
 * @param weekStartDate - Data de início da semana para validação de blocos
 *
 * Processo para cada bloco fixo:
 * 1. Verifica se o bloco é válido para a semana atual (validFrom/validUntil)
 * 2. Identifica quais slots estão dentro do intervalo do bloco
 * 3. Remove esses slots do array de slots disponíveis do dia
 *
 * @example
 * // Bloco de trabalho das 09:00 às 12:00 na segunda-feira
 * // Remove os slots: '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'
 */
export function markOccupiedSlots(
  weekSlots: WeekSlots,
  fixedBlocks: TimeBlock[],
  weekStartDate: Date
): void {
  for (const block of fixedBlocks) {
    const dayOfWeek = block.dayOfWeek;
    const dateForDay = getDateForDay(weekStartDate, dayOfWeek);

    // ========================================================================
    // Validação de datas do bloco recorrente
    // ========================================================================

    // Se o bloco tem validFrom, verifica se a data do dia é >= validFrom
    if (block.validFrom) {
      const fromDate = new Date(block.validFrom);
      const checkDate = new Date(dateForDay);
      if (checkDate < fromDate) {
        // Bloco ainda não começou, pula
        continue;
      }
    }

    // Se o bloco tem validUntil, verifica se a data do dia é <= validUntil
    if (block.validUntil) {
      const untilDate = new Date(block.validUntil);
      const checkDate = new Date(dateForDay);
      if (checkDate > untilDate) {
        // Bloco já expirou, pula
        continue;
      }
    }

    // ========================================================================
    // Remoção dos slots ocupados
    // ========================================================================

    // Converte horários do bloco para minutos para facilitar comparação
    const blockStartMinutes = timeToMinutes(block.startTime);
    const blockEndMinutes = timeToMinutes(block.endTime);

    // Filtra o array de slots, mantendo apenas os que NÃO conflitam com o bloco
    // Um slot conflita se seu horário está dentro do intervalo do bloco
    weekSlots[dayOfWeek] = weekSlots[dayOfWeek].filter((slotTime) => {
      const slotMinutes = timeToMinutes(slotTime);

      // Slot está ocupado se: slotMinutes >= blockStart E slotMinutes < blockEnd
      // Exemplo: bloco 09:00-12:00, slot 09:00 está ocupado (540 >= 540 && 540 < 720)
      // Exemplo: bloco 09:00-12:00, slot 12:00 NÃO está ocupado (720 >= 540 && 720 < 720 = false)
      const isOccupied = slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes;

      // Retorna true para MANTER o slot (ou seja, quando NÃO está ocupado)
      return !isOccupied;
    });
  }
}

// ============================================================================
// FUNÇÃO: sortTasksByPriority
// ============================================================================

/**
 * Filtra tarefas pendentes e ordena por prioridade de agendamento.
 *
 * @param tasks - Lista de todas as tarefas do usuário
 * @returns Lista filtrada e ordenada de tarefas pendentes
 *
 * Critérios de filtro:
 * - Remove tarefas com status COMPLETED (já concluídas)
 * - Remove tarefas com status CANCELLED (canceladas)
 * - Remove tarefas sem tempo estimado (estimatedMinutes <= 0)
 *
 * Critérios de ordenação (nesta ordem de prioridade):
 * 1. priority DESC - Tarefas HIGH (2) vêm antes de MEDIUM (1) e LOW (0)
 * 2. deadline ASC - Deadlines mais próximos vêm primeiro
 * 3. estimatedMinutes ASC - Tarefas mais curtas vêm primeiro (quick wins)
 *
 * A ordenação tripla garante que:
 * - Tarefas urgentes e importantes são agendadas primeiro
 * - Em caso de mesma prioridade, as mais urgentes (deadline) têm preferência
 * - Em caso de mesma prioridade e deadline, as mais rápidas são feitas primeiro
 *
 * @example
 * const tasks = [
 *   { priority: LOW, deadline: '2026-01-25', estimatedMinutes: 30 },
 *   { priority: HIGH, deadline: '2026-01-20', estimatedMinutes: 60 },
 *   { priority: HIGH, deadline: '2026-01-20', estimatedMinutes: 30 },
 * ];
 * // Resultado: [HIGH/20/30min, HIGH/20/60min, LOW/25/30min]
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks
    // ========================================================================
    // Etapa 1: Filtrar tarefas elegíveis para agendamento
    // ========================================================================
    .filter((task) => {
      // Apenas tarefas PENDING ou IN_PROGRESS podem ser agendadas
      const isNotCompleted = task.status !== TaskStatus.COMPLETED;
      const isNotCancelled = task.status !== TaskStatus.CANCELLED;

      // Tarefa precisa ter tempo estimado válido
      const hasValidDuration = task.estimatedMinutes > 0;

      return isNotCompleted && isNotCancelled && hasValidDuration;
    })
    // ========================================================================
    // Etapa 2: Ordenar por múltiplos critérios
    // ========================================================================
    .sort((a, b) => {
      // Critério 1: Prioridade (HIGH = 2, MEDIUM = 1, LOW = 0)
      // Subtração b - a para ordem decrescente (HIGH primeiro)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      // Critério 2: Deadline (mais cedo primeiro)
      // Comparação de strings ISO funciona para ordenação cronológica
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      if (deadlineA !== deadlineB) {
        return deadlineA - deadlineB; // Ordem crescente (mais cedo primeiro)
      }

      // Critério 3: Duração estimada (mais curto primeiro - "quick wins")
      // Tarefas rápidas são feitas primeiro quando prioridade e deadline iguais
      return a.estimatedMinutes - b.estimatedMinutes; // Ordem crescente
    });
}

// ============================================================================
// FUNÇÃO: findConsecutiveSlots
// ============================================================================

/**
 * Busca uma sequência de slots consecutivos livres em qualquer dia da semana.
 * Procura dia a dia até encontrar espaço suficiente para a tarefa.
 *
 * @param weekSlots - Estrutura de slots disponíveis da semana
 * @param slotsNeeded - Quantidade de slots consecutivos necessários
 * @returns Objeto com informações dos slots encontrados, ou null se não houver espaço
 *
 * Algoritmo:
 * 1. Itera por cada dia da semana (começando no domingo)
 * 2. Para cada dia, percorre os slots disponíveis
 * 3. Verifica se há slots suficientes a partir da posição atual
 * 4. Valida que os slots são realmente consecutivos (diferença de 30min)
 * 5. Retorna imediatamente ao encontrar a primeira sequência válida
 *
 * A busca "greedy" (gulosa) garante que as tarefas mais prioritárias
 * peguem os primeiros horários disponíveis da semana.
 *
 * @example
 * // Precisa de 3 slots (90 minutos)
 * // Slots disponíveis no dia 1: ['06:00', '06:30', '08:00', '08:30', '09:00']
 * // Retorna: { dayOfWeek: 1, startIndex: 2, slots: ['08:00', '08:30', '09:00'] }
 * // Note que '06:00', '06:30' não servem pois precisaria de '07:00' que não existe
 */
export function findConsecutiveSlots(
  weekSlots: WeekSlots,
  slotsNeeded: number
): ConsecutiveSlotsResult | null {
  // Percorre cada dia da semana
  for (let day = 0; day < DAYS_IN_WEEK; day++) {
    const daySlots = weekSlots[day];

    // Se o dia não tem slots suficientes, pula para o próximo
    if (daySlots.length < slotsNeeded) {
      continue;
    }

    // Tenta encontrar sequência consecutiva começando de cada posição
    for (let startIdx = 0; startIdx <= daySlots.length - slotsNeeded; startIdx++) {
      // Verifica se os próximos 'slotsNeeded' slots são realmente consecutivos
      let isConsecutive = true;

      for (let i = 0; i < slotsNeeded - 1; i++) {
        const currentSlotMinutes = timeToMinutes(daySlots[startIdx + i]);
        const nextSlotMinutes = timeToMinutes(daySlots[startIdx + i + 1]);

        // Slots consecutivos devem ter exatamente 30 minutos de diferença
        // Exemplo: '09:00' (540) e '09:30' (570) = diferença de 30 OK
        // Exemplo: '09:00' (540) e '10:00' (600) = diferença de 60 FALHA
        if (nextSlotMinutes - currentSlotMinutes !== SLOT_DURATION_MINUTES) {
          isConsecutive = false;
          break;
        }
      }

      // Se encontrou sequência válida, retorna imediatamente
      if (isConsecutive) {
        return {
          dayOfWeek: day,
          startIndex: startIdx,
          slots: daySlots.slice(startIdx, startIdx + slotsNeeded),
        };
      }
    }
  }

  // Não encontrou espaço em nenhum dia
  return null;
}

// ============================================================================
// FUNÇÃO PRINCIPAL: scheduleTasksInWeek
// ============================================================================

/**
 * Função principal de agendamento automático de tarefas na semana.
 *
 * Distribui tarefas pendentes nos horários livres da semana, respeitando
 * os compromissos fixos e priorizando por urgência/importância.
 *
 * @param fixedBlocks - Lista de blocos de tempo fixos (trabalho, aulas, compromissos)
 * @param tasks - Lista de todas as tarefas do usuário
 * @param weekStartDate - Data de início da semana (deve ser domingo)
 * @returns Lista de tarefas agendadas com horários específicos
 *
 * =============================================================================
 * ALGORITMO DETALHADO
 * =============================================================================
 *
 * PASSO 1: Criar estrutura de slots disponíveis
 * - Gera array de 7 dias com slots de 30min cada (06:00 às 22:30)
 * - Total: 7 dias × 34 slots = 238 slots disponíveis inicialmente
 *
 * PASSO 2: Marcar slots ocupados
 * - Para cada bloco fixo, remove os slots correspondentes do array
 * - Respeita validFrom/validUntil para blocos com período de validade
 *
 * PASSO 3: Ordenar tarefas por prioridade
 * - Filtra: remove COMPLETED e CANCELLED
 * - Ordena: priority DESC > deadline ASC > estimatedMinutes ASC
 *
 * PASSO 4: Alocar tarefas (algoritmo guloso)
 * - Para cada tarefa na ordem de prioridade:
 *   a. Calcula slots necessários: ceil(estimatedMinutes / 30)
 *   b. Busca primeira sequência de slots consecutivos livres
 *   c. Se encontrar: cria ScheduledTask e remove slots do pool
 *   d. Se não encontrar: tarefa não é agendada (log de warning)
 *
 * PASSO 5: Retornar lista de agendamentos
 * - Cada ScheduledTask contém: id, taskId, task, dayOfWeek, startTime, endTime, date
 *
 * =============================================================================
 * LIMITAÇÕES E CONSIDERAÇÕES
 * =============================================================================
 *
 * - Algoritmo guloso: pode não encontrar solução ótima global
 * - Não faz backtracking: se uma alocação impedir outras, não tenta reorganizar
 * - Não considera preferências de horário do usuário
 * - Tarefas muito longas podem não caber em nenhum dia
 * - Não fragmenta tarefas: cada tarefa deve caber em bloco contínuo
 *
 * @example
 * const fixedBlocks = [
 *   { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', title: 'Trabalho', ... }
 * ];
 * const tasks = [
 *   { id: 't1', title: 'Estudar', estimatedMinutes: 60, priority: HIGH, ... },
 *   { id: 't2', title: 'Exercício', estimatedMinutes: 30, priority: MEDIUM, ... }
 * ];
 * const weekStart = new Date('2026-01-18'); // Domingo
 *
 * const scheduled = scheduleTasksInWeek(fixedBlocks, tasks, weekStart);
 * // [
 * //   { id: 'sched_...', taskId: 't1', dayOfWeek: 0, startTime: '06:00', endTime: '07:00', ... },
 * //   { id: 'sched_...', taskId: 't2', dayOfWeek: 0, startTime: '07:00', endTime: '07:30', ... }
 * // ]
 */
export function scheduleTasksInWeek(
  fixedBlocks: TimeBlock[],
  tasks: Task[],
  weekStartDate: Date
): ScheduledTask[] {
  // ===========================================================================
  // PASSO 1: Criar estrutura de slots disponíveis para a semana
  // ===========================================================================
  // Gera array de horários para cada dia: ['06:00', '06:30', ..., '22:30']
  const weekSlots = createWeekSlots();

  // ===========================================================================
  // PASSO 2: Remover slots ocupados pelos blocos fixos
  // ===========================================================================
  // Modifica weekSlots in-place, removendo horários conflitantes
  markOccupiedSlots(weekSlots, fixedBlocks, weekStartDate);

  // ===========================================================================
  // PASSO 3: Filtrar e ordenar tarefas por prioridade de agendamento
  // ===========================================================================
  // Resultado: array ordenado por prioridade DESC, deadline ASC, duração ASC
  const sortedTasks = sortTasksByPriority(tasks);

  // ===========================================================================
  // PASSO 4: Alocar cada tarefa no primeiro horário disponível
  // ===========================================================================
  const scheduledTasks: ScheduledTask[] = [];

  for (const task of sortedTasks) {
    // -------------------------------------------------------------------------
    // 4.1: Calcular quantidade de slots necessários
    // -------------------------------------------------------------------------
    // Arredonda para cima: tarefa de 45min precisa de 2 slots (60min)
    const slotsNeeded = Math.ceil(task.estimatedMinutes / SLOT_DURATION_MINUTES);

    // -------------------------------------------------------------------------
    // 4.2: Buscar sequência de slots consecutivos livres
    // -------------------------------------------------------------------------
    const availableSlots = findConsecutiveSlots(weekSlots, slotsNeeded);

    // -------------------------------------------------------------------------
    // 4.3: Se não encontrou espaço, pula para próxima tarefa
    // -------------------------------------------------------------------------
    if (!availableSlots) {
      console.warn(
        `[Scheduler] Sem horário disponível para tarefa "${task.title}" ` +
        `(${task.estimatedMinutes}min = ${slotsNeeded} slots)`
      );
      continue;
    }

    // -------------------------------------------------------------------------
    // 4.4: Criar registro de tarefa agendada
    // -------------------------------------------------------------------------
    const { dayOfWeek, startIndex, slots } = availableSlots;

    // Horário de início é o primeiro slot alocado
    const startTime = slots[0];

    // Horário de término é 30min após o último slot
    // Exemplo: último slot '09:30' -> endTime '10:00'
    const lastSlotMinutes = timeToMinutes(slots[slots.length - 1]);
    const endTime = minutesToTime(lastSlotMinutes + SLOT_DURATION_MINUTES);

    // Data específica do dia na semana
    const date = getDateForDay(weekStartDate, dayOfWeek);

    // Monta o objeto ScheduledTask
    const scheduledTask: ScheduledTask = {
      id: generateScheduleId(),
      taskId: task.id,
      task: task, // Referência completa à tarefa original
      dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime,
      endTime,
      date,
    };

    scheduledTasks.push(scheduledTask);

    // -------------------------------------------------------------------------
    // 4.5: Remover slots usados do pool de disponibilidade
    // -------------------------------------------------------------------------
    // Remove os slots alocados para que não sejam usados por outras tarefas
    // Usa splice para remover diretamente do array (mais eficiente)
    weekSlots[dayOfWeek].splice(startIndex, slotsNeeded);
  }

  // ===========================================================================
  // PASSO 5: Retornar lista de tarefas agendadas
  // ===========================================================================
  return scheduledTasks;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS EXPORTADAS
// ============================================================================

/**
 * Calcula o início da semana (domingo) para uma data qualquer.
 * Útil para garantir que weekStartDate seja sempre um domingo.
 *
 * @param date - Data de referência (qualquer dia da semana)
 * @returns Date correspondente ao domingo da semana
 *
 * @example
 * getWeekStartDate(new Date('2026-01-22')) // Date('2026-01-18') - domingo
 * getWeekStartDate(new Date('2026-01-18')) // Date('2026-01-18') - já é domingo
 */
export function getWeekStartDate(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 = domingo, 6 = sábado

  // Subtrai o número de dias para voltar ao domingo
  result.setDate(result.getDate() - dayOfWeek);

  // Zera horas para consistência
  result.setHours(0, 0, 0, 0);

  return result;
}

/**
 * Calcula estatísticas de disponibilidade da semana.
 * Útil para mostrar ao usuário quanto tempo livre resta.
 *
 * @param fixedBlocks - Lista de blocos fixos
 * @param weekStartDate - Data de início da semana
 * @returns Objeto com estatísticas de disponibilidade
 *
 * @example
 * const stats = getWeekAvailability(blocks, weekStart);
 * console.log(`${stats.freeMinutes} minutos livres (${100 - stats.occupancyPercentage}%)`);
 */
export function getWeekAvailability(
  fixedBlocks: TimeBlock[],
  weekStartDate: Date
): {
  /** Total de slots na semana (238 = 7 dias × 34 slots) */
  totalSlots: number;
  /** Slots ocupados por blocos fixos */
  occupiedSlots: number;
  /** Slots disponíveis para tarefas */
  freeSlots: number;
  /** Minutos livres totais */
  freeMinutes: number;
  /** Percentual de ocupação (0-100) */
  occupancyPercentage: number;
} {
  const weekSlots = createWeekSlots();
  const totalSlots = DAYS_IN_WEEK * SLOTS_PER_DAY;

  // Conta slots antes de marcar ocupados
  let initialSlots = 0;
  for (let day = 0; day < DAYS_IN_WEEK; day++) {
    initialSlots += weekSlots[day].length;
  }

  // Marca ocupados
  markOccupiedSlots(weekSlots, fixedBlocks, weekStartDate);

  // Conta slots após marcar ocupados
  let freeSlots = 0;
  for (let day = 0; day < DAYS_IN_WEEK; day++) {
    freeSlots += weekSlots[day].length;
  }

  const occupiedSlots = totalSlots - freeSlots;

  return {
    totalSlots,
    occupiedSlots,
    freeSlots,
    freeMinutes: freeSlots * SLOT_DURATION_MINUTES,
    occupancyPercentage: Math.round((occupiedSlots / totalSlots) * 100),
  };
}

/**
 * Obtém os slots disponíveis para um dia específico.
 * Útil para visualização na interface.
 *
 * @param fixedBlocks - Lista de blocos fixos
 * @param weekStartDate - Data de início da semana
 * @param dayOfWeek - Dia da semana (0-6)
 * @returns Array de horários disponíveis no formato "HH:mm"
 */
export function getAvailableSlotsForDay(
  fixedBlocks: TimeBlock[],
  weekStartDate: Date,
  dayOfWeek: number
): string[] {
  const weekSlots = createWeekSlots();
  markOccupiedSlots(weekSlots, fixedBlocks, weekStartDate);
  return weekSlots[dayOfWeek] || [];
}
