/**
 * PomodoroTimer.tsx - Componente de Timer Pomodoro
 *
 * Timer baseado na técnica Pomodoro para pessoas com TDAH:
 * - 4 sessões de foco de 25 minutos
 * - Pausas de 5 minutos entre sessões
 * - Visual circular com progress ring animado
 * - Feedback visual por cores (verde=foco, azul=pausa)
 *
 * @author Frontend TDAH Team
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Brain,
  X,
  Coffee,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS E CONSTANTES
// ============================================================================

interface PomodoroTimerProps {
  /** Controla se o dialog está aberto */
  open: boolean;
  /** Função para fechar o dialog */
  onClose: () => void;
  /** Título da tarefa sendo trabalhada */
  taskTitle: string;
  /** ID da tarefa (para tracking) */
  taskId: string;
  /** Callback opcional chamado ao completar todas as sessões */
  onComplete?: (taskId: string, totalMinutes: number) => void;
}

/** Modo do timer: foco (trabalho) ou pausa (descanso) */
type TimerMode = 'focus' | 'break';

/** Duração do foco em segundos (25 minutos) */
const FOCUS_DURATION = 25 * 60; // 1500 segundos

/** Duração da pausa em segundos (5 minutos) */
const BREAK_DURATION = 5 * 60; // 300 segundos

/** Número máximo de sessões */
const MAX_SESSIONS = 4;

/** Circunferência do círculo SVG (2 * PI * raio) */
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 120; // raio = 120

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata segundos para MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PomodoroTimer({
  open,
  onClose,
  taskTitle,
  taskId,
  onComplete,
}: PomodoroTimerProps) {
  // ==========================================================================
  // ESTADOS
  // ==========================================================================

  /** Tempo restante em segundos */
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);

  /** Timer está rodando? */
  const [isRunning, setIsRunning] = useState(false);

  /** Timer está pausado? (diferente de não iniciado) */
  const [isPaused, setIsPaused] = useState(false);

  /** Sessão atual (1 a 4) */
  const [currentSession, setCurrentSession] = useState(1);

  /** Modo atual: foco ou pausa */
  const [mode, setMode] = useState<TimerMode>('focus');

  /** Total de minutos focados (para estatísticas) */
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // ==========================================================================
  // CÁLCULOS DERIVADOS
  // ==========================================================================

  /** Duração total baseado no modo atual */
  const totalDuration = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;

  /** Progresso de 0 a 1 */
  const progress = timeLeft / totalDuration;

  /** Offset do stroke para animação do progress ring */
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /** Inicia ou resume o timer */
  const handlePlay = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  /** Pausa o timer */
  const handlePause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  /** Reseta o timer para o estado inicial */
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(FOCUS_DURATION);
    setCurrentSession(1);
    setMode('focus');
    setTotalFocusMinutes(0);
  }, []);

  /** Fecha o dialog e reseta */
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // ==========================================================================
  // EFEITO DO TIMER
  // ==========================================================================

  useEffect(() => {
    // Se não está rodando, não faz nada
    if (!isRunning) return;

    // Configura o intervalo de 1 segundo
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        // Se ainda tem tempo, decrementa
        if (prev > 1) {
          return prev - 1;
        }

        // Tempo acabou! Processa a transição
        // ----------------------------------------------------------------

        if (mode === 'focus') {
          // Adiciona os minutos focados ao total
          setTotalFocusMinutes((m) => m + Math.floor(FOCUS_DURATION / 60));

          if (currentSession < MAX_SESSIONS) {
            // Ainda tem sessões: vai para pausa
            toast.success('Ótimo trabalho! Hora de uma pausa de 5 minutos.', {
              icon: '☕',
              duration: 4000,
            });
            setMode('break');
            return BREAK_DURATION;
          } else {
            // Completou todas as sessões!
            toast.success('Todas as 4 sessões concluídas! Parabéns! 🎉', {
              duration: 5000,
            });
            setIsRunning(false);
            setIsPaused(false);

            // Callback opcional
            if (onComplete) {
              onComplete(taskId, totalFocusMinutes + Math.floor(FOCUS_DURATION / 60));
            }

            return 0;
          }
        } else {
          // Estava em pausa: volta para foco
          toast('Pausa acabou! Vamos voltar ao foco.', {
            icon: '🧠',
            duration: 3000,
          });
          setMode('focus');
          setCurrentSession((s) => s + 1);
          return FOCUS_DURATION;
        }
      });
    }, 1000);

    // Cleanup: limpa o intervalo quando o componente desmonta ou para de rodar
    return () => clearInterval(intervalId);
  }, [isRunning, mode, currentSession, onComplete, taskId, totalFocusMinutes]);

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Timer Pomodoro
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* Badge indicando modo atual */}
          <Badge
            className={cn(
              'mb-6 px-4 py-2 text-sm',
              mode === 'focus'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            )}
          >
            {mode === 'focus' ? (
              <>
                <Brain className="h-4 w-4 mr-2 inline" />
                Estudando: {taskTitle}
              </>
            ) : (
              <>
                <Coffee className="h-4 w-4 mr-2 inline" />
                Pausa
              </>
            )}
          </Badge>

          {/* Display circular com progress ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg
              className="absolute inset-0 -rotate-90"
              width="256"
              height="256"
              viewBox="0 0 256 256"
            >
              {/* Círculo de fundo */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Círculo de progresso */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  'transition-all duration-1000 ease-linear',
                  mode === 'focus'
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-blue-500 dark:text-blue-400'
                )}
              />
            </svg>

            {/* Display do tempo */}
            <div
              className={cn(
                'relative z-10 w-52 h-52 rounded-full border-8 flex flex-col items-center justify-center',
                'bg-white dark:bg-gray-900',
                mode === 'focus'
                  ? 'border-green-500 dark:border-green-400'
                  : 'border-blue-500 dark:border-blue-400'
              )}
            >
              <span
                className={cn(
                  'text-6xl font-bold tabular-nums',
                  mode === 'focus'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                )}
              >
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {mode === 'focus' ? 'Foco' : 'Descanso'}
              </span>
            </div>
          </div>

          {/* Indicador de sessão */}
          <div className="mt-6 flex items-center gap-2">
            {Array.from({ length: MAX_SESSIONS }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  idx < currentSession
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Sessão {currentSession} de {MAX_SESSIONS}
          </p>

          {/* Botões de controle */}
          <div className="flex items-center gap-4 mt-6">
            {/* Play */}
            <Button
              size="lg"
              onClick={handlePlay}
              disabled={isRunning && !isPaused}
              className={cn(
                'w-16 h-16 rounded-full',
                'bg-green-600 hover:bg-green-700 text-white',
                'disabled:bg-green-400 disabled:cursor-not-allowed'
              )}
            >
              <Play className="h-8 w-8" />
            </Button>

            {/* Pause */}
            <Button
              size="lg"
              onClick={handlePause}
              disabled={!isRunning}
              className={cn(
                'w-16 h-16 rounded-full',
                'bg-yellow-500 hover:bg-yellow-600 text-white',
                'disabled:bg-yellow-300 disabled:cursor-not-allowed'
              )}
            >
              <Pause className="h-8 w-8" />
            </Button>

            {/* Reset */}
            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
              className={cn(
                'w-16 h-16 rounded-full',
                'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800'
              )}
            >
              <RotateCcw className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>

          {/* Dica */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center max-w-xs">
            Técnica Pomodoro: 25 min de foco + 5 min de pausa.
            <br />
            Complete 4 sessões para máxima produtividade!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
