import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { ArrowLeft, UserPlus } from 'lucide-react'

type RegisterFormValues = {
  name: string
  email: string
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  idealSleepHours: string
  wakeUpTime: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState } = useForm<RegisterFormValues>({
    mode: 'onTouched'
  })
  const { errors } = formState
  const [isLoading, setIsLoading] = useState(false)

  const password = watch('password')

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Conta criada com sucesso! Bem-vindo!', {
      duration: 4000,
      style: {
        background: '#00A651',
        color: '#fff',
      },
    })

    console.log('Registration successful with:', {
      ...data,
      password: '***',
      confirmPassword: '***'
    })

    localStorage.setItem('mock_new_user', JSON.stringify({
      name: data.name,
      email: data.email,
      gender: data.gender,
      idealSleepHours: data.idealSleepHours,
      wakeUpTime: data.wakeUpTime,
      createdAt: new Date().toISOString()
    }))

    setTimeout(() => {
      console.log('Redirecting to /login')
      navigate('/login')
    }, 2000)

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <Toaster position="top-center" />

      <div className="w-full max-w-2xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-6 text-[#00A651] hover:text-[#008a44] transition-colors font-semibold"
        >
          <ArrowLeft size={24} />
          <span>Voltar</span>
        </Link>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-[#00A651] rounded-full">
              <UserPlus size={48} className="text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-[#00A651] mb-2">
            Vamos criar uma conta :)
          </h1>
          <p className="text-gray-600 text-lg">
            Preencha os campos abaixo para começar sua jornada!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-base font-semibold text-gray-700 mb-2"
              >
                Nome completo *
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Por favor, digite seu nome',
                  minLength: {
                    value: 2,
                    message: 'O nome deve ter pelo menos 2 caracteres'
                  }
                })}
                className={`
                  w-full px-4 py-3 text-base
                  bg-gray-100 border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                  transition-all duration-200
                  ${errors.name ? 'border-[#E74C3C]' : 'border-gray-200'}
                `}
                placeholder="Digite seu nome"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Por favor, digite seu email',
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Digite um email válido'
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
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              Como você se identifica? *
            </label>
            <select
              id="gender"
              {...register('gender', {
                required: 'Por favor, selecione uma opção'
              })}
              className={`
                w-full px-4 py-3 text-base
                bg-gray-100 border-2 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                transition-all duration-200
                ${errors.gender ? 'border-[#E74C3C]' : 'border-gray-200'}
              `}
              disabled={isLoading}
            >
              <option value="">Selecione uma opção</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
              <option value="prefer-not-to-say">Prefiro não dizer</option>
            </select>
            {errors.gender && (
              <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="idealSleepHours"
                className="block text-base font-semibold text-gray-700 mb-2"
              >
                Quantas horas de sono você precisa? *
              </label>
              <select
                id="idealSleepHours"
                {...register('idealSleepHours', {
                  required: 'Por favor, selecione suas horas de sono'
                })}
                className={`
                  w-full px-4 py-3 text-base
                  bg-gray-100 border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                  transition-all duration-200
                  ${errors.idealSleepHours ? 'border-[#E74C3C]' : 'border-gray-200'}
                `}
                disabled={isLoading}
              >
                <option value="">Selecione</option>
                <option value="5">5 horas</option>
                <option value="6">6 horas</option>
                <option value="7">7 horas</option>
                <option value="8">8 horas</option>
                <option value="9">9 horas</option>
                <option value="10">10 horas</option>
              </select>
              {errors.idealSleepHours && (
                <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                  {errors.idealSleepHours.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="wakeUpTime"
                className="block text-base font-semibold text-gray-700 mb-2"
              >
                Que horas você precisa acordar? *
              </label>
              <input
                id="wakeUpTime"
                type="time"
                {...register('wakeUpTime', {
                  required: 'Por favor, selecione o horário'
                })}
                className={`
                  w-full px-4 py-3 text-base
                  bg-gray-100 border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                  transition-all duration-200
                  ${errors.wakeUpTime ? 'border-[#E74C3C]' : 'border-gray-200'}
                `}
                disabled={isLoading}
              />
              {errors.wakeUpTime && (
                <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                  {errors.wakeUpTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-gray-700 mb-2"
              >
                Senha *
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Por favor, crie uma senha',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter pelo menos 6 caracteres'
                  }
                })}
                className={`
                  w-full px-4 py-3 text-base
                  bg-gray-100 border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                  transition-all duration-200
                  ${errors.password ? 'border-[#E74C3C]' : 'border-gray-200'}
                `}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-base font-semibold text-gray-700 mb-2"
              >
                Confirme a senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Por favor, confirme sua senha',
                  validate: (value) =>
                    value === password || 'As senhas não coincidem'
                })}
                className={`
                  w-full px-4 py-3 text-base
                  bg-gray-100 border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent
                  transition-all duration-200
                  ${errors.confirmPassword ? 'border-[#E74C3C]' : 'border-gray-200'}
                `}
                placeholder="Digite a senha novamente"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-[#E74C3C] text-sm mt-2 flex items-center gap-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-4 px-6 text-lg font-bold rounded-xl
              transition-all duration-200 transform
              ${isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#F5A623] text-white hover:bg-[#e09515] hover:scale-[1.02] active:scale-[0.98]'
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
                Criando sua conta...
              </span>
            ) : (
              'Salvar e Criar Conta'
            )}
          </button>

          <div className="text-center space-y-2 pt-4">
            <p className="text-gray-600">
              Já tem uma conta?
            </p>
            <Link
              to="/login"
              className="inline-block text-lg font-semibold text-[#00A651] hover:text-[#008a44] transition-colors"
            >
              Faça login aqui!
            </Link>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 text-center">
            <strong>Modo de Desenvolvimento:</strong><br />
            Esta página está simulando o comportamento de registro.<br />
            Nenhuma conexão real com API está sendo feita.<br />
            Após o registro simulado, você será redirecionado para a página de login.
          </p>
        </div>
      </div>
    </div>
  )
}
