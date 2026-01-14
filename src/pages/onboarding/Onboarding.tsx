import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  Briefcase,
  GraduationCap,
  CalendarClock,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Clock,
  Rocket,
} from 'lucide-react';
import { TimeBlockType } from '@/types';
import type { TimeBlock, OnboardingData } from '@/types';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
];

const STEPS = [
  { id: 1, title: 'Bem-vindo', icon: Sparkles },
  { id: 2, title: 'Trabalho', icon: Briefcase },
  { id: 3, title: 'Aulas', icon: GraduationCap },
  { id: 4, title: 'Compromissos', icon: CalendarClock },
];

// Gera ID único
const generateId = () => Math.random().toString(36).substring(2, 9);

// Step 1: Welcome
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-focus-blue-500 to-calm-purple-500 flex items-center justify-center">
        <Brain className="w-12 h-12 text-white" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Bem-vindo ao TDAH Manager!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
          Vamos configurar sua rotina para ajudar você a organizar melhor seu dia a dia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
        <Card className="border-2 border-focus-blue-200 dark:border-focus-blue-800 bg-focus-blue-50 dark:bg-focus-blue-900/20">
          <CardContent className="p-4 text-center">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-focus-blue-500" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Trabalho</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure seus horários de trabalho</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-energy-orange-200 dark:border-energy-orange-800 bg-energy-orange-50 dark:bg-energy-orange-900/20">
          <CardContent className="p-4 text-center">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-energy-orange-500" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Aulas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Adicione suas aulas e estudos</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-calm-purple-200 dark:border-calm-purple-800 bg-calm-purple-50 dark:bg-calm-purple-900/20">
          <CardContent className="p-4 text-center">
            <CalendarClock className="w-8 h-8 mx-auto mb-2 text-calm-purple-500" />
            <h3 className="font-semibold text-gray-800 dark:text-white">Compromissos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Marque seus compromissos fixos</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-success-green-50 dark:bg-success-green-900/20 border border-success-green-200 dark:border-success-green-800 rounded-xl p-4 max-w-md">
        <p className="text-sm text-success-green-700 dark:text-success-green-300">
          <Sparkles className="w-4 h-4 inline mr-2" />
          Leva apenas <strong>2 minutos</strong> para configurar. Você pode ajustar tudo depois!
        </p>
      </div>

      <Button size="lg" onClick={onNext} className="mt-4 bg-gradient-to-r from-focus-blue-500 to-calm-purple-500 hover:from-focus-blue-600 hover:to-calm-purple-600">
        Começar Configuração
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}

// Color class mappings for Tailwind (classes must be complete, not dynamic)
const colorClasses = {
  blue: {
    enabled: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
  },
  orange: {
    enabled: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
  },
};

// Schedule Table Component (used for Work and Class steps)
interface ScheduleTableProps {
  schedules: { [day: number]: { enabled: boolean; startTime: string; endTime: string } };
  onChange: (day: number, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => void;
  colorScheme: 'blue' | 'orange';
}

function ScheduleTable({ schedules, onChange, colorScheme }: ScheduleTableProps) {
  const activeClass = colorClasses[colorScheme].enabled;

  return (
    <div className="space-y-3">
      {DAYS_OF_WEEK.map((day) => {
        const schedule = schedules[day.value] || { enabled: false, startTime: '09:00', endTime: '18:00' };
        const isEnabled = schedule.enabled;

        return (
          <div
            key={day.value}
            className={cn(
              'flex items-center gap-4 p-3 rounded-xl border-2 transition-all',
              isEnabled
                ? activeClass
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
            )}
          >
            <div className="flex items-center gap-3 w-32">
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => onChange(day.value, 'enabled', checked)}
              />
              <span className={cn('font-medium', isEnabled ? 'text-gray-800 dark:text-white' : 'text-gray-400')}>
                {day.label}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-500 dark:text-gray-400">De:</Label>
                <Input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => onChange(day.value, 'startTime', e.target.value)}
                  disabled={!isEnabled}
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-500 dark:text-gray-400">Até:</Label>
                <Input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => onChange(day.value, 'endTime', e.target.value)}
                  disabled={!isEnabled}
                  className="w-28"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Step 2: Work Schedule
interface StepWorkProps {
  schedules: { [day: number]: { enabled: boolean; startTime: string; endTime: string } };
  onChange: (day: number, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => void;
}

function StepWork({ schedules, onChange }: StepWorkProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-focus-blue-100 dark:bg-focus-blue-900/30 flex items-center justify-center mx-auto">
          <Briefcase className="w-8 h-8 text-focus-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Horários de Trabalho</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Em quais dias e horários você trabalha? Ative os dias que se aplicam.
        </p>
      </div>

      <ScheduleTable schedules={schedules} onChange={onChange} colorScheme="blue" />

      <div className="bg-focus-blue-50 dark:bg-focus-blue-900/20 border border-focus-blue-200 dark:border-focus-blue-800 rounded-xl p-4">
        <p className="text-sm text-focus-blue-700 dark:text-focus-blue-300">
          <Clock className="w-4 h-4 inline mr-2" />
          Não se preocupe se seus horários variam. Você pode configurar isso como sua rotina mais comum.
        </p>
      </div>
    </div>
  );
}

// Step 3: Class Schedule
interface StepClassProps {
  schedules: { [day: number]: { enabled: boolean; startTime: string; endTime: string } };
  onChange: (day: number, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => void;
}

function StepClass({ schedules, onChange }: StepClassProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-energy-orange-100 dark:bg-energy-orange-900/30 flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8 text-energy-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Horários de Aula</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Você estuda ou faz algum curso? Configure seus horários de aula.
        </p>
      </div>

      <ScheduleTable schedules={schedules} onChange={onChange} colorScheme="orange" />

      <div className="bg-energy-orange-50 dark:bg-energy-orange-900/20 border border-energy-orange-200 dark:border-energy-orange-800 rounded-xl p-4">
        <p className="text-sm text-energy-orange-700 dark:text-energy-orange-300">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Se você não estuda atualmente, pode pular esta etapa deixando todos os dias desativados.
        </p>
      </div>
    </div>
  );
}

// Step 4: Fixed Commitments
interface Commitment {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface StepCommitmentsProps {
  commitments: Commitment[];
  onAdd: (commitment: Commitment) => void;
  onRemove: (id: string) => void;
}

function StepCommitments({ commitments, onAdd, onRemove }: StepCommitmentsProps) {
  const [newCommitment, setNewCommitment] = useState<Omit<Commitment, 'id'>>({
    title: '',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:00',
  });

  const handleAdd = () => {
    if (!newCommitment.title.trim()) return;

    onAdd({
      id: generateId(),
      ...newCommitment,
    });

    setNewCommitment({
      title: '',
      dayOfWeek: 1,
      startTime: '10:00',
      endTime: '11:00',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-calm-purple-100 dark:bg-calm-purple-900/30 flex items-center justify-center mx-auto">
          <CalendarClock className="w-8 h-8 text-calm-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Compromissos Fixos</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tem compromissos que se repetem toda semana? Academia, terapia, reuniões fixas...
        </p>
      </div>

      {/* Add new commitment form */}
      <Card className="border-2 border-dashed border-calm-purple-300 dark:border-calm-purple-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-calm-purple-500" />
            Adicionar Compromisso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome do compromisso</Label>
              <Input
                id="title"
                placeholder="Ex: Academia, Terapia, Reunião..."
                value={newCommitment.title}
                onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Dia da semana</Label>
              <select
                id="day"
                value={newCommitment.dayOfWeek}
                onChange={(e) => setNewCommitment({ ...newCommitment, dayOfWeek: Number(e.target.value) })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Hora início</Label>
              <Input
                id="start"
                type="time"
                value={newCommitment.startTime}
                onChange={(e) => setNewCommitment({ ...newCommitment, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Hora fim</Label>
              <Input
                id="end"
                type="time"
                value={newCommitment.endTime}
                onChange={(e) => setNewCommitment({ ...newCommitment, endTime: e.target.value })}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!newCommitment.title.trim()}
            className="w-full bg-calm-purple-500 hover:bg-calm-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Compromisso
          </Button>
        </CardContent>
      </Card>

      {/* List of commitments */}
      {commitments.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Seus compromissos ({commitments.length})</Label>
          <div className="space-y-2">
            {commitments.map((commitment) => {
              const day = DAYS_OF_WEEK.find((d) => d.value === commitment.dayOfWeek);
              return (
                <div
                  key={commitment.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-calm-purple-200 dark:border-calm-purple-800 bg-calm-purple-50 dark:bg-calm-purple-900/20"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-calm-purple-500">{day?.short}</Badge>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{commitment.title}</p>
                      <p className="text-sm text-gray-500">
                        {commitment.startTime} - {commitment.endTime}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(commitment.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CalendarClock className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Nenhum compromisso adicionado ainda.</p>
          <p className="text-sm">Você pode pular esta etapa se não tiver compromissos fixos.</p>
        </div>
      )}
    </div>
  );
}

// Progress Indicator
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  isCompleted && 'bg-success-green-500 text-white',
                  isCurrent && 'bg-focus-blue-500 text-white ring-4 ring-focus-blue-200 dark:ring-focus-blue-800',
                  !isCompleted && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium',
                  isCurrent ? 'text-focus-blue-600 dark:text-focus-blue-400' : 'text-gray-500'
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-focus-blue-500 to-calm-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Main Onboarding Component
export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Work schedules state
  const [workSchedules, setWorkSchedules] = useState<{
    [day: number]: { enabled: boolean; startTime: string; endTime: string };
  }>({
    1: { enabled: true, startTime: '09:00', endTime: '18:00' },
    2: { enabled: true, startTime: '09:00', endTime: '18:00' },
    3: { enabled: true, startTime: '09:00', endTime: '18:00' },
    4: { enabled: true, startTime: '09:00', endTime: '18:00' },
    5: { enabled: true, startTime: '09:00', endTime: '18:00' },
    6: { enabled: false, startTime: '09:00', endTime: '13:00' },
    0: { enabled: false, startTime: '09:00', endTime: '13:00' },
  });

  // Class schedules state
  const [classSchedules, setClassSchedules] = useState<{
    [day: number]: { enabled: boolean; startTime: string; endTime: string };
  }>({
    1: { enabled: false, startTime: '19:00', endTime: '22:00' },
    2: { enabled: false, startTime: '19:00', endTime: '22:00' },
    3: { enabled: false, startTime: '19:00', endTime: '22:00' },
    4: { enabled: false, startTime: '19:00', endTime: '22:00' },
    5: { enabled: false, startTime: '19:00', endTime: '22:00' },
    6: { enabled: false, startTime: '08:00', endTime: '12:00' },
    0: { enabled: false, startTime: '08:00', endTime: '12:00' },
  });

  // Fixed commitments state
  const [commitments, setCommitments] = useState<Commitment[]>([]);

  const handleWorkChange = (day: number, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setWorkSchedules((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleClassChange = (day: number, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setClassSchedules((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleAddCommitment = (commitment: Commitment) => {
    setCommitments((prev) => [...prev, commitment]);
  };

  const handleRemoveCommitment = (id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  };

  const convertToTimeBlocks = (
    schedules: { [day: number]: { enabled: boolean; startTime: string; endTime: string } },
    type: TimeBlockType
  ): TimeBlock[] => {
    return Object.entries(schedules)
      .filter(([, schedule]) => schedule.enabled)
      .map(([day, schedule]) => ({
        id: generateId(),
        dayOfWeek: Number(day) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        type,
        title: type === TimeBlockType.WORK ? 'Trabalho' : 'Aula',
        isRecurring: true,
      }));
  };

  const handleFinish = () => {
    // Convert data to OnboardingData format
    const onboardingData: OnboardingData = {
      workSchedule: convertToTimeBlocks(workSchedules, TimeBlockType.WORK),
      classSchedule: convertToTimeBlocks(classSchedules, TimeBlockType.CLASS),
      fixedCommitments: commitments.map((c) => ({
        id: c.id,
        dayOfWeek: c.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: c.startTime,
        endTime: c.endTime,
        type: TimeBlockType.FIXED,
        title: c.title,
        isRecurring: true,
      })),
    };

    // Save to localStorage
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    localStorage.setItem('onboardingCompleted', 'true');

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl border-0">
        <CardHeader className="pb-2">
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        </CardHeader>

        <CardContent className="pt-6">
          {currentStep === 1 && <StepWelcome onNext={handleNext} />}

          {currentStep === 2 && <StepWork schedules={workSchedules} onChange={handleWorkChange} />}

          {currentStep === 3 && <StepClass schedules={classSchedules} onChange={handleClassChange} />}

          {currentStep === 4 && (
            <StepCommitments
              commitments={commitments}
              onAdd={handleAddCommitment}
              onRemove={handleRemoveCommitment}
            />
          )}

          {/* Navigation buttons */}
          {currentStep > 1 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-focus-blue-500 to-calm-purple-500 hover:from-focus-blue-600 hover:to-calm-purple-600"
              >
                {currentStep === 4 ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Finalizar e Começar
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
