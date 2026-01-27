import { useState, useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Clock,
  Crown,
  Medal,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Users,
  TrendingUp,
  Timer,
  Calendar,
  Sparkles,
  Heart,
  BookOpen,
  Coffee,
  Rocket,
  Shield,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para conquistas
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'consistency' | 'focus' | 'social';
  progress: number;
  maxProgress: number;
  xpReward: number;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Configuração de categorias
const CATEGORY_CONFIG = {
  productivity: {
    label: 'Produtividade',
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  consistency: {
    label: 'Consistência',
    icon: Flame,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  focus: {
    label: 'Foco',
    icon: Target,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  social: {
    label: 'Social',
    icon: Users,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    borderColor: 'border-pink-300 dark:border-pink-700',
  },
};

// Configuração de raridades
const RARITY_CONFIG = {
  common: {
    label: 'Comum',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    gradient: 'from-gray-400 to-gray-500',
  },
  rare: {
    label: 'Raro',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    gradient: 'from-blue-400 to-cyan-500',
  },
  epic: {
    label: 'Épico',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    gradient: 'from-purple-400 to-pink-500',
  },
  legendary: {
    label: 'Lendário',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
  },
};

// Mock de conquistas - 12 conquistas
const MOCK_ACHIEVEMENTS: Achievement[] = [
  // Produtividade (3)
  {
    id: '1',
    title: 'Primeiro Passo',
    description: 'Complete sua primeira tarefa',
    icon: 'star',
    category: 'productivity',
    progress: 1,
    maxProgress: 1,
    xpReward: 50,
    unlockedAt: '2024-01-10',
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Produtivo',
    description: 'Complete 10 tarefas',
    icon: 'checkCircle',
    category: 'productivity',
    progress: 10,
    maxProgress: 10,
    xpReward: 100,
    unlockedAt: '2024-01-15',
    rarity: 'common',
  },
  {
    id: '3',
    title: 'Mestre das Tarefas',
    description: 'Complete 100 tarefas',
    icon: 'trophy',
    category: 'productivity',
    progress: 72,
    maxProgress: 100,
    xpReward: 500,
    rarity: 'epic',
  },
  // Consistência (3)
  {
    id: '4',
    title: 'Sequência Inicial',
    description: 'Mantenha uma sequência de 3 dias',
    icon: 'flame',
    category: 'consistency',
    progress: 3,
    maxProgress: 3,
    xpReward: 75,
    unlockedAt: '2024-01-12',
    rarity: 'common',
  },
  {
    id: '5',
    title: 'Sequência de Fogo',
    description: 'Mantenha uma sequência de 7 dias',
    icon: 'flame',
    category: 'consistency',
    progress: 7,
    maxProgress: 7,
    xpReward: 200,
    unlockedAt: '2024-01-18',
    rarity: 'rare',
  },
  {
    id: '6',
    title: 'Imbatível',
    description: 'Mantenha uma sequência de 30 dias',
    icon: 'crown',
    category: 'consistency',
    progress: 12,
    maxProgress: 30,
    xpReward: 1000,
    rarity: 'legendary',
  },
  // Foco (3)
  {
    id: '7',
    title: 'Iniciante Focado',
    description: 'Complete 1 hora de foco',
    icon: 'timer',
    category: 'focus',
    progress: 60,
    maxProgress: 60,
    xpReward: 100,
    unlockedAt: '2024-01-11',
    rarity: 'common',
  },
  {
    id: '8',
    title: 'Hiperfoco',
    description: 'Acumule 10 horas de foco',
    icon: 'target',
    category: 'focus',
    progress: 10,
    maxProgress: 10,
    xpReward: 300,
    unlockedAt: '2024-01-20',
    rarity: 'rare',
  },
  {
    id: '9',
    title: 'Mestre do Foco',
    description: 'Acumule 100 horas de foco',
    icon: 'brain',
    category: 'focus',
    progress: 42,
    maxProgress: 100,
    xpReward: 1500,
    rarity: 'legendary',
  },
  // Social (3)
  {
    id: '10',
    title: 'Primeiro Amigo',
    description: 'Adicione seu primeiro amigo',
    icon: 'users',
    category: 'social',
    progress: 0,
    maxProgress: 1,
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: '11',
    title: 'Motivador',
    description: 'Envie 5 mensagens de incentivo',
    icon: 'heart',
    category: 'social',
    progress: 2,
    maxProgress: 5,
    xpReward: 150,
    rarity: 'rare',
  },
  {
    id: '12',
    title: 'Líder da Comunidade',
    description: 'Ajude 10 pessoas a concluírem tarefas',
    icon: 'shield',
    category: 'social',
    progress: 3,
    maxProgress: 10,
    xpReward: 500,
    rarity: 'epic',
  },
];

// Função para obter ícone da conquista
function getAchievementIcon(iconName: string, className: string = 'h-6 w-6') {
  const icons: Record<string, React.ReactNode> = {
    star: <Star className={className} />,
    flame: <Flame className={className} />,
    trophy: <Trophy className={className} />,
    clock: <Clock className={className} />,
    target: <Target className={className} />,
    crown: <Crown className={className} />,
    medal: <Medal className={className} />,
    award: <Award className={className} />,
    timer: <Timer className={className} />,
    calendar: <Calendar className={className} />,
    sparkles: <Sparkles className={className} />,
    heart: <Heart className={className} />,
    users: <Users className={className} />,
    checkCircle: <CheckCircle2 className={className} />,
    book: <BookOpen className={className} />,
    coffee: <Coffee className={className} />,
    rocket: <Rocket className={className} />,
    shield: <Shield className={className} />,
    brain: <Brain className={className} />,
  };
  return icons[iconName] || <Star className={className} />;
}

// Componente de barra de progresso
function ProgressBar({ progress, max, className }: { progress: number; max: number; className?: string }) {
  const percentage = Math.min((progress / max) * 100, 100);

  return (
    <div className={cn('h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Componente de card de conquista
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isUnlocked = !!achievement.unlockedAt;
  const categoryConfig = CATEGORY_CONFIG[achievement.category];
  const rarityConfig = RARITY_CONFIG[achievement.rarity];
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg',
        isUnlocked
          ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-amber-300 dark:border-amber-600'
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
      )}
    >
      {/* Badge de raridade */}
      <div className="absolute top-2 right-2">
        <Badge
          className={cn(
            'text-[10px] font-semibold',
            isUnlocked ? rarityConfig.bgColor : 'bg-gray-200 dark:bg-gray-700',
            isUnlocked ? rarityConfig.color : 'text-gray-500'
          )}
        >
          {rarityConfig.label}
        </Badge>
      </div>

      {/* Indicador de desbloqueado/bloqueado */}
      {isUnlocked ? (
        <div className="absolute -top-2 -left-2">
          <div className={cn('rounded-full p-1.5 bg-gradient-to-r', rarityConfig.gradient)}>
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </div>
      ) : (
        <div className="absolute -top-2 -left-2">
          <div className="rounded-full p-1.5 bg-gray-400 dark:bg-gray-600">
            <Lock className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <CardContent className="p-4 pt-6">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div
            className={cn(
              'p-3 rounded-xl flex-shrink-0',
              isUnlocked
                ? `bg-gradient-to-br ${rarityConfig.gradient} text-white`
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            )}
          >
            {getAchievementIcon(achievement.icon)}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                'font-semibold truncate mb-1',
                isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {achievement.title}
            </h4>
            <p
              className={cn(
                'text-xs mb-3',
                isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {achievement.description}
            </p>

            {/* Categoria */}
            <div className="flex items-center gap-1 mb-3">
              <categoryConfig.icon className={cn('h-3 w-3', categoryConfig.color)} />
              <span className={cn('text-xs font-medium', categoryConfig.color)}>
                {categoryConfig.label}
              </span>
            </div>

            {/* Progresso */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={isUnlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}>
                  {isUnlocked ? 'Concluído!' : 'Progresso'}
                </span>
                <span className={cn('font-medium', isUnlocked ? 'text-green-600' : 'text-gray-500')}>
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <ProgressBar progress={achievement.progress} max={achievement.maxProgress} />
            </div>

            {/* Recompensa XP */}
            <div className="flex items-center gap-1 mt-3">
              <Zap className={cn('h-4 w-4', isUnlocked ? 'text-amber-500' : 'text-gray-400')} />
              <span className={cn('text-sm font-medium', isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500')}>
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Status badge */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-semibold',
          isUnlocked
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
        )}
      >
        {isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
      </div>
    </Card>
  );
}

// Componente de banner de estatísticas
function AchievementsBanner({
  total,
  unlocked,
  totalXP,
}: {
  total: number;
  unlocked: number;
  totalXP: number;
}) {
  const percentage = Math.round((unlocked / total) * 100);

  return (
    <Card className="border-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              <Trophy className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Suas Conquistas</h2>
              <p className="text-white/80">Continue progredindo para desbloquear mais!</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{unlocked}/{total}</p>
              <p className="text-sm text-white/80">Desbloqueadas</p>
            </div>
            <div className="h-12 w-px bg-white/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-sm text-white/80">Completo</p>
            </div>
            <div className="h-12 w-px bg-white/30" />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Zap className="h-5 w-5" />
                <p className="text-3xl font-bold">{totalXP}</p>
              </div>
              <p className="text-sm text-white/80">XP Ganho</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Filtrar conquistas
  const filteredAchievements = useMemo(() => {
    let filtered = [...MOCK_ACHIEVEMENTS];

    if (selectedCategory) {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (showUnlockedOnly) {
      filtered = filtered.filter((a) => a.unlockedAt);
    }

    return filtered;
  }, [selectedCategory, showUnlockedOnly]);

  // Estatísticas
  const stats = useMemo(() => {
    const unlocked = MOCK_ACHIEVEMENTS.filter((a) => a.unlockedAt);
    const totalXP = unlocked.reduce((sum, a) => sum + a.xpReward, 0);
    return {
      total: MOCK_ACHIEVEMENTS.length,
      unlocked: unlocked.length,
      totalXP,
    };
  }, []);

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; unlocked: number }> = {};
    Object.keys(CATEGORY_CONFIG).forEach((cat) => {
      const catAchievements = MOCK_ACHIEVEMENTS.filter((a) => a.category === cat);
      counts[cat] = {
        total: catAchievements.length,
        unlocked: catAchievements.filter((a) => a.unlockedAt).length,
      };
    });
    return counts;
  }, []);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900 min-h-screen">
            {/* Banner */}
            <AchievementsBanner
              total={stats.total}
              unlocked={stats.unlocked}
              totalXP={stats.totalXP}
            />

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filtro por categoria */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null ? 'bg-gray-800 dark:bg-gray-200' : ''}
                >
                  Todas ({stats.total})
                </Button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = categoryCounts[key];
                  return (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      className={cn(
                        selectedCategory === key && config.bgColor,
                        selectedCategory === key && config.color
                      )}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {config.label} ({count.unlocked}/{count.total})
                    </Button>
                  );
                })}
              </div>

              {/* Toggle desbloqueadas */}
              <Button
                variant={showUnlockedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                className={showUnlockedOnly ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {showUnlockedOnly ? 'Mostrando desbloqueadas' : 'Mostrar só desbloqueadas'}
              </Button>
            </div>

            {/* Grid de conquistas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>

            {/* Mensagem se não houver conquistas */}
            {filteredAchievements.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Trophy className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhuma conquista encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dica */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      Dica: Conquistas Lendárias
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      As conquistas lendárias oferecem as maiores recompensas de XP!
                      Mantenha sua sequência diária e acumule horas de foco para desbloqueá-las.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
