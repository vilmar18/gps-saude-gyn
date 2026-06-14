import { useState } from 'react'
import { supabase } from './supabase'

function MinhasConsultas() {
    const [cpf, setCpf] = useState('')
    const [dataNascimento, setDataNascimento] = useState('')
    const [consultas, setConsultas] = useState(null)
    const [erro, setErro] = useState('')
    const [buscando, setBuscando] = useState(false)

    async function buscarConsultas(e) {
        e.preventDefault()
        setErro('')
        setConsultas(null)
        setBuscando(true)

        const cpfLimpo = cpf.replace(/[^\d]/g, '')

        const { data: paciente, error: erroPaciente } = await supabase
            .from('pacientes')
            .select('*')
            .eq('cpf', cpfLimpo)
            .eq('data_nascimento', dataNascimento)
            .single()

        if (erroPaciente || !paciente) {
            setErro('Paciente não encontrado. Verifique o CPF e a data de nascimento.')
            setBuscando(false)
            return
        }

        const { data: listaConsultas, error: erroConsultas } = await supabase
            .from('consultas')
            .select(`
        id,
        medico,
        especialidade,
        data_consulta,
        horario,
        unidades ( nome, endereco, tipo )
      `)
            .eq('paciente_id', paciente.id)
            .order('data_consulta', { ascending: true })

        if (erroConsultas) {
            setErro('Erro ao buscar consultas. Tente novamente.')
        } else if (listaConsultas.length === 0) {
            setErro('Nenhuma consulta agendada encontrada.')
        } else {
            setConsultas(listaConsultas)
        }

        setBuscando(false)
    }

    function formatarData(dataIso) {
        const [ano, mes, dia] = dataIso.split('-')
        return `${dia}/${mes}/${ano}`
    }

    function formatarHorario(horario) {
        return horario.slice(0, 5)
    }

    return (
        <div className="flex flex-col items-center p-4">

            <form onSubmit={buscarConsultas} className="bg-white rounded-xl shadow p-6 w-full max-w-md mt-4">
                <h2 className="text-lg font-bold text-gray-700 mb-4">Consultar meu agendamento</h2>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">CPF</span>
                    <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        required
                    />
                </label>

                <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700">Data de nascimento</span>
                    <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        required
                    />
                </label>

                <button
                    type="submit"
                    disabled={buscando}
                    className="w-full bg-blue-700 text-white p-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
                >
                    {buscando ? 'Buscando...' : 'Buscar minhas consultas'}
                </button>
            </form>

            {erro && (
                <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg w-full max-w-md text-sm">
                    {erro}
                </div>
            )}

            {consultas && (
                <div className="mt-4 w-full max-w-md flex flex-col gap-3">
                    {consultas.map((consulta) => (
                        <div key={consulta.id} className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-700">
                            <p className="text-lg font-bold text-gray-800">{consulta.especialidade}</p>
                            <p className="text-sm text-gray-600">Médico: {consulta.medico}</p>
                            <p className="text-sm text-gray-600">
                                Data: {formatarData(consulta.data_consulta)} às {formatarHorario(consulta.horario)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Local: <strong>{consulta.unidades.nome}</strong>
                            </p>
                            {consulta.unidades.endereco && (
                                <p className="text-xs text-gray-400">{consulta.unidades.endereco}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MinhasConsultas