import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Save, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      email: '',
      avatarUrl: '',
      bio: '',
    },
  });

  // Carregar dados do usuário no formulário
  useEffect(() => {
    if (user) {
      // Carregar dados extras do localStorage
      const storedProfile = localStorage.getItem('userProfile');
      const profile = storedProfile ? JSON.parse(storedProfile) : {};

      reset({
        name: user.name || '',
        email: user.email || '',
        avatarUrl: profile.avatarUrl || '',
        bio: profile.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Atualizar o usuário no AuthContext
      const updatedUser = {
        ...user!,
        name: data.name,
      };

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Salvar dados extras do perfil
      const profileExtras = {
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      };
      localStorage.setItem('userProfile', JSON.stringify(profileExtras));

      // Atualizar o contexto
      setUser(updatedUser);

      toast.success('Perfil atualizado com sucesso!');

      // Reset do form para limpar o estado isDirty
      reset(data);
    } catch {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Funcionalidade em desenvolvimento. Entre em contato com o suporte para excluir sua conta.');
  };

  return (
    <div className="space-y-6">
      {/* Card principal do perfil */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-focus-blue-500" />
            Meu Perfil
          </CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e preferências de conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres',
                  },
                })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled
                {...register('email')}
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                O email não pode ser alterado
              </p>
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL do Avatar (opcional)</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://exemplo.com/sua-foto.jpg"
                {...register('avatarUrl', {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: 'URL inválida',
                  },
                })}
                className={errors.avatarUrl ? 'border-red-500' : ''}
              />
              {errors.avatarUrl && (
                <p className="text-sm text-red-500">{errors.avatarUrl.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Cole o link de uma imagem para usar como avatar
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você (opcional)</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                rows={4}
                {...register('bio', {
                  maxLength: {
                    value: 500,
                    message: 'A bio deve ter no máximo 500 caracteres',
                  },
                })}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="bg-focus-blue-500 hover:bg-focus-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-300">
                Excluir conta permanentemente
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Todos os seus dados serão removidos. Esta ação não pode ser desfeita.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="flex-shrink-0"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
