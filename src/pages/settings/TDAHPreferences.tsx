import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Timer,
  Bell,
  Palette,
  Save,
  RotateCcw,
  Focus,
  Droplets,
  Coffee,
  Sparkles,
  Volume2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Interface para as preferências TDAH
interface TDAHPreferences {
  // Preferências de Foco
  pomodoroDuration: number;
  breakDuration: number;
  extremeFocusMode: boolean;

  // Lembretes
  breakReminders: boolean;
  hydrationReminders: boolean;
  reminderFrequency: number;

  // Interface
  visualComplexity: 'minimal' | 'standard' | 'rich';
  reducedAnimations: boolean;
  soundFeedback: boolean;
}

// Valores padrão
const DEFAULT_PREFERENCES: TDAHPreferences = {
  pomodoroDuration: 25,
  breakDuration: 5,
  extremeFocusMode: false,
  breakReminders: true,
  hydrationReminders: false,
  reminderFrequency: 60,
  visualComplexity: 'standard',
  reducedAnimations: false,
  soundFeedback: true,
};

// Carregar preferências do localStorage
const loadPreferences = (): TDAHPreferences => {
  try {
    const saved = localStorage.getItem('tdahPreferences');
    if (saved) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCES;
};

// Salvar preferências no localStorage
const savePreferences = (prefs: TDAHPreferences) => {
  localStorage.setItem('tdahPreferences', JSON.stringify(prefs));
};

export default function TDAHPreferences() {
  const [preferences, setPreferences] = useState<TDAHPreferences>(loadPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  // Detectar mudanças
  useEffect(() => {
    const saved = loadPreferences();
    const changed = JSON.stringify(preferences) !== JSON.stringify(saved);
    setHasChanges(changed);
  }, [preferences]);

  // Atualizar uma preferência
  const updatePreference = <K extends keyof TDAHPreferences>(
    key: K,
    value: TDAHPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Salvar todas as preferências
  const handleSave = () => {
    savePreferences(preferences);
    setHasChanges(false);
    toast.success('Preferências salvas com sucesso!');
  };

  // Restaurar padrões
  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    toast('Preferências restauradas para o padrão', { icon: 'ℹ️' });
  };

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-calm-purple-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Preferências TDAH
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personalize sua experiência para melhor foco e produtividade
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-gray-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-calm-purple-500 hover:bg-calm-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Card: Preferências de Foco */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-focus-blue-500" />
            Preferências de Foco
          </CardTitle>
          <CardDescription>
            Configure os tempos de trabalho e pausas do método Pomodoro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Duração Pomodoro */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Duração do Pomodoro</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tempo de foco contínuo antes de uma pausa
              </p>
            </div>
            <Select
              value={String(preferences.pomodoroDuration)}
              onValueChange={(value) =>
                updatePreference('pomodoroDuration', Number(value))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="25">25 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Duração Pausa */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Duração da Pausa</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tempo de descanso entre sessões de foco
              </p>
            </div>
            <Select
              value={String(preferences.breakDuration)}
              onValueChange={(value) =>
                updatePreference('breakDuration', Number(value))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="10">10 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Modo Foco Extremo */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Focus className="h-4 w-4 text-red-500" />
                <Label className="text-sm font-medium">Modo Foco Extremo</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Oculta todas as notificações durante sessões de foco para minimizar distrações
              </p>
            </div>
            <Switch
              checked={preferences.extremeFocusMode}
              onCheckedChange={(checked) =>
                updatePreference('extremeFocusMode', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Card: Lembretes */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-amber-500" />
            Lembretes
          </CardTitle>
          <CardDescription>
            Configure lembretes para manter hábitos saudáveis durante o trabalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lembrete de Pausas */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                <Label className="text-sm font-medium">Lembrete de Pausas</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receba alertas para fazer pausas regulares e evitar fadiga mental
              </p>
            </div>
            <Switch
              checked={preferences.breakReminders}
              onCheckedChange={(checked) =>
                updatePreference('breakReminders', checked)
              }
            />
          </div>

          <Separator />

          {/* Lembrete de Hidratação */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <Label className="text-sm font-medium">Lembrete de Hidratação</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receba lembretes para beber água e manter-se hidratado
              </p>
            </div>
            <Switch
              checked={preferences.hydrationReminders}
              onCheckedChange={(checked) =>
                updatePreference('hydrationReminders', checked)
              }
            />
          </div>

          <Separator />

          {/* Frequência dos Lembretes */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Frequência dos Lembretes</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Com que frequência você deseja receber os lembretes
              </p>
            </div>
            <Select
              value={String(preferences.reminderFrequency)}
              onValueChange={(value) =>
                updatePreference('reminderFrequency', Number(value))
              }
              disabled={!preferences.breakReminders && !preferences.hydrationReminders}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Card: Interface */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-green-500" />
            Interface
          </CardTitle>
          <CardDescription>
            Ajuste a aparência e comportamento visual para seu conforto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Complexidade Visual */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <Label className="text-sm font-medium">Complexidade Visual</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Escolha o nível de detalhes visuais na interface
              </p>
            </div>
            <Select
              value={preferences.visualComplexity}
              onValueChange={(value) =>
                updatePreference('visualComplexity', value as TDAHPreferences['visualComplexity'])
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimalista</SelectItem>
                <SelectItem value="standard">Padrão</SelectItem>
                <SelectItem value="rich">Rica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Animações Reduzidas */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <Label className="text-sm font-medium">Animações Reduzidas</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reduz ou remove animações para diminuir distrações visuais
              </p>
            </div>
            <Switch
              checked={preferences.reducedAnimations}
              onCheckedChange={(checked) =>
                updatePreference('reducedAnimations', checked)
              }
            />
          </div>

          <Separator />

          {/* Sons de Feedback */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-teal-500" />
                <Label className="text-sm font-medium">Sons de Feedback</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reproduz sons sutis ao completar ações (marcar tarefa, iniciar timer, etc.)
              </p>
            </div>
            <Switch
              checked={preferences.soundFeedback}
              onCheckedChange={(checked) =>
                updatePreference('soundFeedback', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Dica TDAH */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-calm-purple-50 to-focus-blue-50 dark:from-calm-purple-900/20 dark:to-focus-blue-900/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-calm-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-calm-purple-700 dark:text-calm-purple-300">
                Dica para TDAH
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Experimente começar com sessões de foco mais curtas (15-25 min) e aumente gradualmente.
                Se você se distrai facilmente, ative o Modo Foco Extremo e as Animações Reduzidas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de mudanças não salvas */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
          <Card className="border-0 shadow-xl bg-amber-50 dark:bg-amber-900/30">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                Alterações não salvas
              </span>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Salvar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
