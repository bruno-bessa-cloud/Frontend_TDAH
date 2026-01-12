import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Sun } from 'lucide-react';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    mode: 'onTouched',
  });
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success('Login realizado com sucesso! Bem-vindo de volta!', {
      duration: 3000,
      style: {
        background: '#00A651',
        color: '#fff',
      },
    });

    console.log('Login successful with:', data);

    localStorage.setItem(
      'mock_user',
      JSON.stringify({
        email: data.email,
        name: 'Demo User',
        loginAt: new Date().toISOString(),
      })
    );

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <Toaster position="top-center" />

      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="relative">
            <Sun size={100} className="text-[#F5A623] fill-[#F5A623]" strokeWidth={2.5} />
          </div>
          <h1 className="text-7xl font-bold text-[#00A651]">Login</h1>
        </div>

        <p className="text-center text-gray-600 mb-10 text-lg">Que bom te ver novamente!</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Por favor, digite seu email',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Digite um email válido',
                },
              })}
              className={`
                w-full px-4 py-3 text-base
                bg-gray-100 border-2 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                transition-all duration-200
                ${errors.email ? 'border-[#E74C3C]' : 'border-gray-200'}
              `}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Por favor, digite sua senha',
                minLength: {
                  value: 6,
                  message: 'A senha deve ter pelo menos 6 caracteres',
                },
              })}
              className={`
                w-full px-4 py-3 text-base
                bg-gray-100 border-2 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                transition-all duration-200
                ${errors.password ? 'border-[#E74C3C]' : 'border-gray-200'}
              `}
              placeholder="••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-4 px-6 text-lg font-bold rounded-xl
              transition-all duration-200 transform
              ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00A651] text-white hover:bg-[#008a44] hover:scale-[1.02] active:scale-[0.98]'
              }
              shadow-lg hover:shadow-xl
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() =>
                toast('Funcionalidade em breve!', {
                  duration: 2000,
                })
              }
              className="text-sm text-gray-600 hover:text-[#00A651] transition-colors underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600">Não tem uma conta ainda?</p>
            <Link
              to="/register"
              className="inline-block text-lg font-semibold text-[#00A651] hover:text-[#008a44] transition-colors"
            >
              Cadastre-se aqui!
            </Link>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 text-center">
            <strong>Modo de Desenvolvimento:</strong>
            <br />
            Esta página está simulando o comportamento de login.
            <br />
            Nenhuma conexão real com API está sendo feita.
          </p>
        </div>
      </div>
    </div>
  );
}
