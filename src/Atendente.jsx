// Atendente.jsx
// Tela de login e cadastro de consultas para atendentes das unidades de saúde

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function Atendente() {
    // Campos de login
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [logado, setLogado] = useState(false)
    const [erroLogin, setErroLogin] = useState('')

    // Campos do formulário de cadastro de consulta
    const [cpfPaciente, setCpfPaciente] = useState('')
    const [nomePaciente, setNomePaciente] = useState('')
    const [dataNascimento, setDataNascimento] = useState('')
    const [unidadeId, setUnidadeId] = useState('')
    const [medico, setMedico] = useState('')
    const [especialidade, setEspecialidade] = useState('')
    const [dataConsulta, setDataConsulta] = useState('')
    const [horario, setHorario] = useState('')

    // Lista de unidades para o select
    const [unidades, setUnidades] = useState([])

    // Mensagem de sucesso ou erro ao cadastrar
    const [mensagem, setMensagem] = useState('')

    // Busca as unidades ao carregar a tela
    useEffect(() => {
        async function buscarUnidades() {
            const { data } = await supabase.from('unidades').select('id, nome, tipo').order('nome')
            if (data) setUnidades(data)
        }
        buscarUnidades()
    }, [])

    // Função de login do atendente
    async function fazerLogin(e) {
        e.preventDefault()
        setErroLogin('')

        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

        if (error) {
            setErroLogin('Email ou senha incorretos.')
        } else {
            setLogado(true)
        }
    }

    // Função de logout
    async function fazerLogout() {
        await supabase.auth.signOut()
        setLogado(false)
        setEmail('')
        setSenha('')
    }

    // Função que cadastra a consulta
    async function cadastrarConsulta(e) {
        e.preventDefault()
        setMensagem('')

        const cpfLimpo = cpfPaciente.replace(/[^\d]/g, '')

        // Verifica se o paciente já existe no banco
        let { data: paciente } = await supabase
            .from('pacientes')
            .select('id')
            .eq('cpf', cpfLimpo)
            .single()

        // Se não existe, cria o paciente
        if (!paciente) {
            const { data: novoPaciente, error: erroCriacao } = await supabase
                .from('pacientes')
                .insert([{ nome: nomePaciente, cpf: cpfLimpo, data_nascimento: dataNascimento }])
                .select()
                .single()

            if (erroCriacao) {
                setMensagem('Erro ao cadastrar paciente. Verifique os dados.')
                return
            }
            paciente = novoPaciente
        }

        // Cadastra a consulta
        const { error: erroConsulta } = await supabase
            .from('consultas')
            .insert([{
                paciente_id: paciente.id,
                unidade_id: parseInt(unidadeId),
                medico,
                especialidade,
                data_consulta: dataConsulta,
                horario,
            }])

        if (erroConsulta) {
            setMensagem('Erro ao cadastrar consulta. Tente novamente.')
        } else {
            setMensagem('Consulta cadastrada com sucesso!')
            // Limpa o formulário
            setCpfPaciente('')
            setNomePaciente('')
            setDataNascimento('')
            setUnidadeId('')
            setMedico('')
            setEspecialidade('')
            setDataConsulta('')
            setHorario('')
        }

        setTimeout(() => setMensagem(''), 4000)
    }

    // Tela de login
    if (!logado) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <form onSubmit={fazerLogin} className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
                    <h2 className="text-xl font-bold text-gray-700 mb-1">Área do Atendente</h2>
                    <p className="text-sm text-gray-500 mb-4">Acesso restrito à equipe de saúde</p>

                    <label className="block mb-3">
                        <span className="text-sm font-medium text-gray-700">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </label>

                    <label className="block mb-4">
                        <span className="text-sm font-medium text-gray-700">Senha</span>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                            required
                        />
                    </label>

                    {erroLogin && (
                        <p className="text-red-600 text-sm mb-3">{erroLogin}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white p-2 rounded-lg font-medium hover:bg-blue-800"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        )
    }

    // Tela de cadastro de consulta (após login)
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-lg mx-auto">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">Cadastrar Consulta</h2>
                    <button
                        onClick={fazerLogout}
                        className="text-sm text-red-600 underline"
                    >
                        Sair
                    </button>
                </div>

                {mensagem && (
                    <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                        mensagem.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {mensagem}
                    </div>
                )}

                <form onSubmit={cadastrarConsulta} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">

                    <p className="font-medium text-gray-600 text-sm">Dados do paciente</p>

                    <label className="block">
                        <span className="text-sm text-gray-700">CPF do paciente</span>
                        <input type="text" value={cpfPaciente}
                               onChange={(e) => setCpfPaciente(e.target.value)}
                               placeholder="000.000.000-00"
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-700">Nome completo</span>
                        <input type="text" value={nomePaciente}
                               onChange={(e) => setNomePaciente(e.target.value)}
                               placeholder="Nome do paciente"
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-700">Data de nascimento</span>
                        <input type="date" value={dataNascimento}
                               onChange={(e) => setDataNascimento(e.target.value)}
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <p className="font-medium text-gray-600 text-sm mt-2">Dados da consulta</p>

                    <label className="block">
                        <span className="text-sm text-gray-700">Unidade de saúde</span>
                        <select value={unidadeId}
                                onChange={(e) => setUnidadeId(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                                required>
                            <option value="">Selecione a unidade...</option>
                            {unidades.map((u) => (
                                <option key={u.id} value={u.id}>{u.nome} ({u.tipo})</option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-700">Médico</span>
                        <input type="text" value={medico}
                               onChange={(e) => setMedico(e.target.value)}
                               placeholder="Dr. Nome do Médico"
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-700">Especialidade</span>
                        <input type="text" value={especialidade}
                               onChange={(e) => setEspecialidade(e.target.value)}
                               placeholder="Ex: Cardiologia, Pediatria"
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-700">Data da consulta</span>
                        <input type="date" value={dataConsulta}
                               onChange={(e) => setDataConsulta(e.target.value)}
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <label className="block">
                        <span className="text-sm text-gray-700">Horário</span>
                        <input type="time" value={horario}
                               onChange={(e) => setHorario(e.target.value)}
                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                               required />
                    </label>

                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white p-2 rounded-lg font-medium hover:bg-blue-800 mt-2"
                    >
                        Cadastrar Consulta
                    </button>

                </form>
            </div>
        </div>
    )
}

export default Atendente