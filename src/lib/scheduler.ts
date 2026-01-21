/**
 * scheduler.ts - Algoritmo de Agendamento Automático de Tarefas
 *
 * Este módulo implementa um sistema inteligente de agendamento que distribui
 * tarefas pendentes nos horários livres da semana, respeitando compromissos
 * fixos (trabalho, aulas, etc.) e priorizando por urgência e importância.
 *
 * ESTRUTURA PRINCIPAL:
 * - Cada dia possui slots de 30 minutos das 06:00 às 23:00
 * - Slots são representados como strings ['06:00', '06:30', '07:00', ...]
 * - Blocos fixos removem slots da disponibilidade
 * - Tarefas são alocadas em sequências consecutivas de slots livres
 *
 * FUNÇÕES AUXILIARES:
 * - createWeekSlots(): Cria grid de 7 dias com 34 slots cada
 * - getOccupiedSlots(): Gera array de slots ocupados por um bloco
 * - findConsecutiveSlots(): Busca sequência de slots consecutivos livres
 * - calculateEndTime(): Calcula horário de término
 * - getDateForDay(): Calcula data para um dia da semana
 *
 * @module scheduler
 * @author Frontend TDAH Team
 * @version 3.0.0
 */

import type { Task, TimeBlock, ScheduledTask } from '@/types';
import { TaskStatus } from '@/types';

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
// FUNÇÃO AUXILIAR: generateUniqueId
// ============================================================================

/**
 * Gera um ID único para identificar cada agendamento.
 * Usa crypto.randomUUID() se disponível, senão fallback para Math.random.
 *
 * @returns String única para identificar o agendamento
 *
 * @example
 * generateUniqueId() // "550e8400-e29b-41d4-a716-446655440000" (se crypto disponível)
 * generateUniqueId() // "sched_1705678234567_a1b2c3" (fallback)
 */
function generateUniqueId(): string {
  // Tenta usar crypto.randomUUID() se disponível (browsers modernos e Node.js 14.17+)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: combina timestamp com número aleatório
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `sched_${timestamp}_${random}`;
}

// ============================================================================
// FUNÇÃO AUXILIAR: timeToMinutes
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

// ============================================================================
// FUNÇÃO AUXILIAR: createWeekSlots
// ============================================================================

/**
 * Cria a estrutura de slots disponíveis para toda a semana.
 * Retorna um array de 7 arrays (um para cada dia da semana).
 * Cada dia contém 34 strings representando slots de 30 minutos.
 *
 * ESTRUTURA DO RETORNO:
 * - Índice 0: Domingo ['06:00', '06:30', ..., '22:30']
 * - Índice 1: Segunda ['06:00', '06:30', ..., '22:30']
 * - ...
 * - Índice 6: Sábado ['06:00', '06:30', ..., '22:30']
 *
 * Total: 7 dias × 34 slots = 238 slots na semana
 *
 * @returns Array bidimensional string[][] com 7 arrays de 34 slots cada
 *
 * @example
 * const weekSlots = createWeekSlots();
 * console.log(weekSlots[0]); // ['06:00', '06:30', '07:00', ..., '22:30'] - Domingo
 * console.log(weekSlots[0].length); // 34
 * console.log(weekSlots.length); // 7
 */
export function createWeekSlots(): string[][] {
  // Inicializa array de 7 dias
  const weekSlots: string[][] = [];

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

    weekSlots.push(daySlots);
  }

  return weekSlots;
}

// ============================================================================
// FUNÇÃO AUXILIAR: getOccupiedSlots
// ============================================================================

/**
 * Gera array de slots ocupados entre um horário de início e fim.
 * Usado para identificar quais slots devem ser removidos quando há um bloco fixo.
 *
 * LÓGICA:
 * 1. Converte startTime e endTime para minutos
 * 2. Itera em incrementos de 30 minutos
 * 3. Para cada incremento, gera o slot no formato "HH:mm"
 * 4. Retorna array com todos os slots ocupados
 *
 * Nota: O endTime NÃO é incluído como slot ocupado, apenas os slots
 * que começam ANTES do endTime.
 *
 * @param startTime - Horário de início no formato "HH:mm"
 * @param endTime - Horário de término no formato "HH:mm"
 * @returns Array de strings com os slots ocupados
 *
 * @example
 * getOccupiedSlots("09:00", "12:00")
 * // Retorna: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
 * // Note que '12:00' NÃO está incluído
 *
 * @example
 * getOccupiedSlots("14:00", "15:30")
 * // Retorna: ['14:00', '14:30', '15:00']
 */
export function getOccupiedSlots(startTime: string, endTime: string): string[] {
  const occupiedSlots: string[] = [];

  // Converte horários para minutos para facilitar iteração
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Itera em incrementos de 30 minutos, do início até ANTES do fim
  // O slot do endTime não é ocupado (ex: bloco 09:00-10:00 ocupa apenas 09:00 e 09:30)
  for (let minutes = startMinutes; minutes < endMinutes; minutes += SLOT_DURATION_MINUTES) {
    const slotTime = minutesToTime(minutes);
    occupiedSlots.push(slotTime);
  }

  return occupiedSlots;
}

// ============================================================================
// FUNÇÃO AUXILIAR: findConsecutiveSlots
// ============================================================================

/**
 * Busca uma sequência de slots consecutivos livres dentro de um array de slots.
 * Verifica se os slots são realmente consecutivos (diferença de 30min entre eles).
 *
 * ALGORITMO:
 * 1. Verifica se há slots suficientes no array
 * 2. Itera por cada posição possível de início
 * 3. Para cada posição, verifica se os N próximos slots são consecutivos
 * 4. Retorna imediatamente ao encontrar sequência válida
 * 5. Retorna array vazio se não encontrar
 *
 * IMPORTANTE: Esta função verifica consecutividade real, não apenas
 * posição no array. Slots ['06:00', '06:30', '08:00'] não são todos
 * consecutivos porque há um gap entre '06:30' e '08:00'.
 *
 * @param freeSlots - Array de slots livres disponíveis
 * @param slotsNeeded - Quantidade de slots consecutivos necessários
 * @returns Array com os slots consecutivos encontrados, ou array vazio se não houver
 *
 * @example
 * // Slots todos consecutivos
 * findConsecutiveSlots(['06:00', '06:30', '07:00', '07:30'], 2)
 * // Retorna: ['06:00', '06:30']
 *
 * @example
 * // Slots com gap - precisa de 3 consecutivos
 * findConsecutiveSlots(['06:00', '06:30', '08:00', '08:30', '09:00'], 3)
 * // Retorna: ['08:00', '08:30', '09:00'] (os primeiros 2 não servem pois há gap)
 *
 * @example
 * // Não há slots suficientes consecutivos
 * findConsecutiveSlots(['06:00', '08:00', '10:00'], 2)
 * // Retorna: [] (nenhum par é consecutivo)
 */
export function findConsecutiveSlots(freeSlots: string[], slotsNeeded: number): string[] {
  // Se não há slots suficientes no total, retorna vazio
  if (freeSlots.length < slotsNeeded) {
    return [];
  }

  // Tenta encontrar sequência consecutiva começando de cada posição
  for (let startIdx = 0; startIdx <= freeSlots.length - slotsNeeded; startIdx++) {
    // Assume que a sequência é válida até provar o contrário
    let isConsecutive = true;

    // Verifica se os próximos 'slotsNeeded' slots são realmente consecutivos
    for (let i = 0; i < slotsNeeded - 1; i++) {
      const currentSlotMinutes = timeToMinutes(freeSlots[startIdx + i]);
      const nextSlotMinutes = timeToMinutes(freeSlots[startIdx + i + 1]);

      // Slots consecutivos devem ter exatamente 30 minutos de diferença
      // Exemplo válido: '09:00' (540) e '09:30' (570) = diferença de 30 ✓
      // Exemplo inválido: '09:00' (540) e '10:00' (600) = diferença de 60 ✗
      if (nextSlotMinutes - currentSlotMinutes !== SLOT_DURATION_MINUTES) {
        isConsecutive = false;
        break;
      }
    }

    // Se encontrou sequência válida, retorna os slots
    if (isConsecutive) {
      return freeSlots.slice(startIdx, startIdx + slotsNeeded);
    }
  }

  // Não encontrou sequência consecutiva suficiente
  return [];
}

// ============================================================================
// FUNÇÃO AUXILIAR: calculateEndTime
// ============================================================================

/**
 * Calcula o horário de término baseado no horário de início e duração em minutos.
 *
 * @param startTime - Horário de início no formato "HH:mm"
 * @param durationMinutes - Duração em minutos
 * @returns Horário de término no formato "HH:mm"
 *
 * @example
 * calculateEndTime("09:00", 30)  // "09:30"
 * calculateEndTime("09:00", 60)  // "10:00"
 * calculateEndTime("09:00", 90)  // "10:30"
 * calculateEndTime("22:00", 60)  // "23:00"
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
}

// ============================================================================
// FUNÇÃO AUXILIAR: getDateForDay
// ============================================================================

/**
 * Calcula a data específica para um dia da semana a partir da data de início.
 * Assume que weekStartDate é um domingo (dia 0 da semana).
 *
 * CÁLCULO:
 * 1. Cria cópia da data de início para não modificar o original
 * 2. Adiciona o número de dias correspondente ao dayOfWeek
 * 3. Retorna no formato ISO YYYY-MM-DD
 *
 * @param weekStartDate - Data de início da semana (deve ser domingo)
 * @param dayOfWeek - Dia da semana desejado (0 = domingo, 6 = sábado)
 * @returns Data no formato "YYYY-MM-DD"
 *
 * @example
 * // Se weekStartDate é 2026-01-18 (domingo)
 * getDateForDay(new Date('2026-01-18'), 0) // "2026-01-18" (domingo)
 * getDateForDay(new Date('2026-01-18'), 1) // "2026-01-19" (segunda)
 * getDateForDay(new Date('2026-01-18'), 5) // "2026-01-23" (sexta)
 * getDateForDay(new Date('2026-01-18'), 6) // "2026-01-24" (sábado)
 */
export function getDateForDay(weekStartDate: Date, dayOfWeek: number): string {
  // Cria cópia para não modificar o original
  const targetDate = new Date(weekStartDate);

  // Adiciona o número de dias correspondente ao dia da semana
  // dayOfWeek 0 = domingo (mesmo dia), dayOfWeek 1 = segunda (+1 dia), etc.
  targetDate.setDate(targetDate.getDate() + dayOfWeek);

  // Retorna apenas a parte da data no formato YYYY-MM-DD
  return targetDate.toISOString().split('T')[0];
}

// ============================================================================
// FUNÇÃO AUXILIAR: sortTasksByPriority
// ============================================================================

/**
 * Filtra tarefas não completadas e ordena por prioridade de agendamento.
 *
 * FILTRO:
 * - Remove tarefas com status === TaskStatus.COMPLETED
 * - Remove tarefas com estimatedMinutes <= 0 (sem duração válida)
 *
 * ORDENAÇÃO (nesta ordem de prioridade):
 * 1. priority DESC - Alta (2) > Média (1) > Baixa (0)
 * 2. deadline ASC - Deadlines mais próximos primeiro
 * 3. estimatedMinutes ASC - Tarefas mais curtas primeiro (quick wins)
 *
 * A ordenação tripla garante que:
 * - Tarefas urgentes e importantes são agendadas primeiro
 * - Em caso de mesma prioridade, as mais urgentes (deadline) têm preferência
 * - Em caso de mesma prioridade e deadline, as mais rápidas são feitas primeiro
 *
 * @param tasks - Lista de todas as tarefas do usuário
 * @returns Lista filtrada e ordenada de tarefas pendentes
 *
 * @example
 * const tasks = [
 *   { priority: 0, deadline: '2026-01-25', estimatedMinutes: 30 }, // LOW
 *   { priority: 2, deadline: '2026-01-20', estimatedMinutes: 60 }, // HIGH
 *   { priority: 2, deadline: '2026-01-20', estimatedMinutes: 30 }, // HIGH
 * ];
 * sortTasksByPriority(tasks);
 * // Resultado: [HIGH/20/30min, HIGH/20/60min, LOW/25/30min]
 */
function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks
    // ========================================================================
    // ETAPA 1: Filtrar tarefas elegíveis para agendamento
    // ========================================================================
    .filter((task) => {
      // Exclui tarefas já completadas
      const isNotCompleted = task.status !== TaskStatus.COMPLETED;

      // Tarefa precisa ter tempo estimado válido (maior que zero)
      const hasValidDuration = task.estimatedMinutes > 0;

      return isNotCompleted && hasValidDuration;
    })
    // ========================================================================
    // ETAPA 2: Ordenar por múltiplos critérios
    // ========================================================================
    .sort((a, b) => {
      // CRITÉRIO 1: Prioridade (HIGH = 2, MEDIUM = 1, LOW = 0)
      // Subtração b - a para ordem DECRESCENTE (HIGH primeiro)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      // CRITÉRIO 2: Deadline (mais cedo primeiro)
      // Converte string para Date e compara timestamps
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      if (deadlineA !== deadlineB) {
        return deadlineA - deadlineB; // Ordem CRESCENTE (mais cedo primeiro)
      }

      // CRITÉRIO 3: Duração estimada (mais curto primeiro - "quick wins")
      // Tarefas rápidas são priorizadas quando prioridade e deadline são iguais
      return a.estimatedMinutes - b.estimatedMinutes; // Ordem CRESCENTE
    });
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
 * =============================================================================
 * ALGORITMO DETALHADO
 * =============================================================================
 *
 * PASSO 1: Criar grid de slots da semana
 * - Chama createWeekSlots() para criar string[][] com 7 dias
 * - Cada dia tem 34 slots de 30min: ['06:00', '06:30', ..., '22:30']
 *
 * PASSO 2: Remover slots ocupados pelos blocos fixos
 * - Para cada fixedBlock:
 *   a. Obtém o dayOfWeek do bloco
 *   b. Chama getOccupiedSlots(startTime, endTime) para gerar lista de slots ocupados
 *   c. Remove esses slots do array do dia correspondente
 *
 * PASSO 3: Filtrar e ordenar tarefas
 * - Filtra: remove tarefas com status === COMPLETED
 * - Ordena por: priority DESC, deadline ASC, estimatedMinutes ASC
 *
 * PASSO 4: Alocar cada tarefa (algoritmo guloso)
 * - Para cada tarefa ordenada:
 *   a. Calcula slots necessários: Math.ceil(estimatedMinutes / 30)
 *   b. Itera pelos 7 dias procurando sequência de slots livres consecutivos
 *   c. Usa findConsecutiveSlots() para encontrar sequência válida
 *   d. Quando encontra:
 *      - Cria ScheduledTask com id único (crypto.randomUUID ou Math.random)
 *      - Define taskId, task (cópia completa), dayOfWeek, startTime, endTime, date
 *      - Adiciona ao array scheduledTasks
 *      - Remove slots usados do array do dia
 *      - Faz break para ir para próxima tarefa
 *
 * PASSO 5: Retornar scheduledTasks
 *
 * =============================================================================
 * LIMITAÇÕES
 * =============================================================================
 * - Algoritmo guloso: pode não encontrar solução ótima global
 * - Não faz backtracking: se uma alocação impedir outras, não reorganiza
 * - Tarefas muito longas podem não caber em nenhum dia
 * - Não fragmenta tarefas: cada tarefa deve caber em bloco contínuo
 *
 * @param fixedBlocks - Lista de blocos de tempo fixos (trabalho, aulas, compromissos)
 * @param tasks - Lista de todas as tarefas do usuário
 * @param weekStartDate - Data de início da semana (deve ser domingo)
 * @returns Array de ScheduledTask com tarefas agendadas
 *
 * @example
 * const fixedBlocks = [
 *   { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', title: 'Trabalho', ... }
 * ];
 * const tasks = [
 *   { id: 't1', title: 'Estudar', estimatedMinutes: 60, priority: 2, status: 0, ... },
 *   { id: 't2', title: 'Exercício', estimatedMinutes: 30, priority: 1, status: 0, ... }
 * ];
 * const weekStart = new Date('2026-01-18'); // Domingo
 *
 * const scheduled = scheduleTasksInWeek(fixedBlocks, tasks, weekStart);
 * // [
 * //   { id: 'uuid...', taskId: 't1', task: {...}, dayOfWeek: 0, startTime: '06:00', endTime: '07:00', date: '2026-01-18' },
 * //   { id: 'uuid...', taskId: 't2', task: {...}, dayOfWeek: 0, startTime: '07:00', endTime: '07:30', date: '2026-01-18' }
 * // ]
 */
export function scheduleTasksInWeek(
  fixedBlocks: TimeBlock[],
  tasks: Task[],
  weekStartDate: Date
): ScheduledTask[] {
  // ===========================================================================
  // PASSO 1: Criar grid de slots da semana
  // ===========================================================================
  // Cria array de 7 dias, cada dia com 34 slots de 30min
  // weekSlots[0] = domingo, weekSlots[1] = segunda, ..., weekSlots[6] = sábado
  const weekSlots: string[][] = createWeekSlots();

  // ===========================================================================
  // PASSO 2: Remover slots ocupados pelos blocos fixos
  // ===========================================================================
  // Para cada bloco fixo, remove os slots correspondentes do dia
  for (const block of fixedBlocks) {
    const dayOfWeek = block.dayOfWeek;

    // Gera array de slots que este bloco ocupa
    // Ex: bloco 09:00-12:00 gera ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
    const occupiedSlots = getOccupiedSlots(block.startTime, block.endTime);

    // Remove cada slot ocupado do array de slots livres do dia
    // Usa filter para manter apenas slots que NÃO estão na lista de ocupados
    weekSlots[dayOfWeek] = weekSlots[dayOfWeek].filter(
      (slot) => !occupiedSlots.includes(slot)
    );
  }

  // ===========================================================================
  // PASSO 3: Filtrar e ordenar tarefas por prioridade
  // ===========================================================================
  // Resultado: array ordenado por prioridade DESC, deadline ASC, duração ASC
  const sortedTasks = sortTasksByPriority(tasks);

  // ===========================================================================
  // PASSO 4: Alocar cada tarefa no primeiro horário disponível
  // ===========================================================================
  const scheduledTasks: ScheduledTask[] = [];

  // Itera por cada tarefa na ordem de prioridade
  for (const task of sortedTasks) {
    // -------------------------------------------------------------------------
    // 4.1: Calcular quantidade de slots necessários
    // -------------------------------------------------------------------------
    // Arredonda para cima: tarefa de 45min precisa de 2 slots (60min)
    const slotsNeeded = Math.ceil(task.estimatedMinutes / SLOT_DURATION_MINUTES);

    // -------------------------------------------------------------------------
    // 4.2: Procurar sequência de slots livres em qualquer dia da semana
    // -------------------------------------------------------------------------
    // Variável para controlar se encontrou slot
    let foundSlot = false;

    // Itera pelos 7 dias da semana procurando espaço
    for (let dayOfWeek = 0; dayOfWeek < DAYS_IN_WEEK; dayOfWeek++) {
      // Busca sequência de slots consecutivos livres neste dia
      const consecutiveSlots = findConsecutiveSlots(weekSlots[dayOfWeek], slotsNeeded);

      // Se encontrou slots suficientes consecutivos
      if (consecutiveSlots.length > 0) {
        // ---------------------------------------------------------------------
        // 4.3: Criar objeto ScheduledTask
        // ---------------------------------------------------------------------

        // Horário de início é o primeiro slot da sequência
        const startTime = consecutiveSlots[0];

        // Calcula horário de término somando 30min ao último slot
        // Alternativa: usar a função calculateEndTime
        const durationMinutes = slotsNeeded * SLOT_DURATION_MINUTES;
        const endTime = calculateEndTime(startTime, durationMinutes);

        // Calcula a data específica deste dia na semana (YYYY-MM-DD)
        const date = getDateForDay(weekStartDate, dayOfWeek);

        // Monta o objeto ScheduledTask completo
        const scheduledTask: ScheduledTask = {
          // ID único gerado por crypto.randomUUID ou Math.random
          id: generateUniqueId(),

          // ID da tarefa original
          taskId: task.id,

          // Cópia completa do objeto task (spread para criar cópia)
          task: { ...task },

          // Dia da semana onde foi agendado (0-6)
          dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,

          // Horários de início e fim
          startTime,
          endTime,

          // Data no formato YYYY-MM-DD
          date,
        };

        // Adiciona ao array de resultado
        scheduledTasks.push(scheduledTask);

        // ---------------------------------------------------------------------
        // 4.4: Remover slots usados do pool de disponibilidade
        // ---------------------------------------------------------------------
        // Remove os slots alocados para que não sejam usados por outras tarefas
        weekSlots[dayOfWeek] = weekSlots[dayOfWeek].filter(
          (slot) => !consecutiveSlots.includes(slot)
        );

        // ---------------------------------------------------------------------
        // 4.5: Break para ir para próxima tarefa
        // ---------------------------------------------------------------------
        foundSlot = true;
        break;
      }
    }

    // Log de warning se não encontrou espaço para a tarefa
    if (!foundSlot) {
      console.warn(
        `[Scheduler] Sem horário disponível para tarefa "${task.title}" ` +
        `(${task.estimatedMinutes}min = ${slotsNeeded} slots)`
      );
    }
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
 */
export function getWeekAvailability(
  fixedBlocks: TimeBlock[],
  weekStartDate: Date
): {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  freeMinutes: number;
  occupancyPercentage: number;
} {
  const weekSlots = createWeekSlots();
  const totalSlots = DAYS_IN_WEEK * SLOTS_PER_DAY;

  // Remove slots ocupados
  for (const block of fixedBlocks) {
    const occupiedSlots = getOccupiedSlots(block.startTime, block.endTime);
    weekSlots[block.dayOfWeek] = weekSlots[block.dayOfWeek].filter(
      (slot) => !occupiedSlots.includes(slot)
    );
  }

  // Conta slots livres restantes
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
