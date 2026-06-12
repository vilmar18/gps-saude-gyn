import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from './supabase'

function criarIcone(cor) {
    return L.divIcon({
        className: '',
        html: `<div style="
      background-color: ${cor};
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.5);
    "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    })
}

const icones = {
    UPA:  criarIcone('#ef4444'),
    CAIS: criarIcone('#3b82f6'),
    CIAM: criarIcone('#22c55e'),
}

// Opções de tempo de espera que o usuário pode escolher
const opcoesTempo = [
    'Sem espera',
    'Até 30 minutos',
    '30 min a 1 hora',
    '1 a 2 horas',
    'Mais de 2 horas',
]

function App() {
    const [unidades, setUnidades] = useState([])
    const [carregando, setCarregando] = useState(true)

    // Guarda qual unidade está aberta para reportar (null = nenhuma)
    const [unidadeSelecionada, setUnidadeSelecionada] = useState(null)

    // Guarda os últimos reportes de cada unidade
    // Formato: { 1: "Até 30 minutos", 2: "1 a 2 horas", ... }
    const [ultimosReportes, setUltimosReportes] = useState({})

    // Mensagem de sucesso ao enviar reporte
    const [mensagem, setMensagem] = useState('')

    // Busca as unidades de saúde no banco
    useEffect(() => {
        async function buscarUnidades() {
            const { data, error } = await supabase
                .from('unidades')
                .select('*')

            if (error) {
                console.error('Erro ao buscar unidades:', error)
            } else {
                setUnidades(data)
            }
            setCarregando(false)
        }

        buscarUnidades()
    }, [])

    // Busca o último reporte de cada unidade
    useEffect(() => {
        async function buscarReportes() {
            const { data, error } = await supabase
                .from('reportes')
                .select('*')
                .order('criado_em', { ascending: false }) // mais recentes primeiro

            if (error) {
                console.error('Erro ao buscar reportes:', error)
                return
            }

            // Monta um objeto com o reporte mais recente de cada unidade
            const mapa = {}
            data.forEach((reporte) => {
                if (!mapa[reporte.unidade_id]) {
                    mapa[reporte.unidade_id] = reporte.tempo_espera
                }
            })
            setUltimosReportes(mapa)
        }

        buscarReportes()
    }, [])

    // Função chamada quando o usuário escolhe um tempo de espera
    async function enviarReporte(unidadeId, tempo) {
        const { error } = await supabase
            .from('reportes')
            .insert([{ unidade_id: unidadeId, tempo_espera: tempo }])

        if (error) {
            console.error('Erro ao enviar reporte:', error)
            setMensagem('Erro ao enviar. Tente novamente.')
        } else {
            // Atualiza o reporte mais recente na tela imediatamente
            setUltimosReportes((anterior) => ({
                ...anterior,
                [unidadeId]: tempo,
            }))
            setMensagem('Reporte enviado! Obrigado por contribuir.')
            setUnidadeSelecionada(null) // fecha o formulário
        }

        // Limpa a mensagem após 3 segundos
        setTimeout(() => setMensagem(''), 3000)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            <header className="bg-blue-700 text-white p-4 shadow-md">
                <h1 className="text-2xl font-bold text-center">GPS da Saúde GYN</h1>
                <p className="text-center text-sm mt-1">Unidades de saúde de Goiânia em tempo real</p>
            </header>

            {/* Mensagem de feedback */}
            {mensagem && (
                <div className="bg-green-100 text-green-800 text-center p-2 text-sm font-medium">
                    {mensagem}
                </div>
            )}

            <div className="flex gap-4 justify-center bg-white p-3 shadow text-sm font-medium">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> UPA
        </span>
                <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> CAIS
        </span>
                <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> CIAM
        </span>
            </div>

            <div className="flex flex-1 gap-4 p-4">

                {/* Painel lateral */}
                <div className="w-80 bg-white rounded-xl shadow p-3 overflow-y-auto max-h-[80vh]">
                    <h2 className="font-bold text-gray-700 mb-3 text-lg">Unidades de Saúde</h2>

                    {carregando && <p className="text-sm text-gray-500">Carregando...</p>}

                    {unidades.map((unidade) => (
                        <div key={unidade.id} className="mb-2 p-2 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full inline-block ${
                    unidade.tipo === 'UPA'  ? 'bg-red-500'   :
                        unidade.tipo === 'CAIS' ? 'bg-blue-500'  :
                            'bg-green-500'
                }`}></span>
                                <span className="font-medium text-sm text-gray-800">{unidade.nome}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-5">{unidade.tipo}</span>
                            {unidade.endereco && (
                                <p className="text-xs text-gray-400 ml-5 mt-1">{unidade.endereco}</p>
                            )}

                            {/* Mostra o último tempo de espera reportado */}
                            {ultimosReportes[unidade.id] && (
                                <p className="text-xs text-orange-600 ml-5 mt-1 font-medium">
                                    ⏱ {ultimosReportes[unidade.id]}
                                </p>
                            )}

                            {/* Botão para abrir/fechar o formulário de reporte */}
                            <button
                                onClick={() => setUnidadeSelecionada(
                                    unidadeSelecionada === unidade.id ? null : unidade.id
                                )}
                                className="text-xs text-blue-600 ml-5 mt-1 underline"
                            >
                                {unidadeSelecionada === unidade.id ? 'Cancelar' : 'Reportar tempo de espera'}
                            </button>

                            {/* Formulário de reporte - aparece só na unidade selecionada */}
                            {unidadeSelecionada === unidade.id && (
                                <div className="ml-5 mt-2 flex flex-col gap-1">
                                    {opcoesTempo.map((opcao) => (
                                        <button
                                            key={opcao}
                                            onClick={() => enviarReporte(unidade.id, opcao)}
                                            className="text-xs bg-gray-100 hover:bg-blue-100 rounded p-1 text-left"
                                        >
                                            {opcao}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Mapa */}
                <div className="flex-1">
                    <MapContainer
                        center={[-16.6869, -49.2648]}
                        zoom={12}
                        style={{ height: '80vh', width: '100%', borderRadius: '12px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© OpenStreetMap'
                        />
                        {unidades.map((unidade) => (
                            <Marker
                                key={unidade.id}
                                position={[unidade.lat, unidade.lng]}
                                icon={icones[unidade.tipo]}
                            >
                                <Popup>
                                    <strong>{unidade.nome}</strong>
                                    <br />
                                    Tipo: {unidade.tipo}
                                    {unidade.endereco && (
                                        <>
                                            <br />
                                            {unidade.endereco}
                                        </>
                                    )}
                                    {ultimosReportes[unidade.id] && (
                                        <>
                                            <br />
                                            ⏱ Espera: {ultimosReportes[unidade.id]}
                                        </>
                                    )}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

            </div>
        </div>
    )
}

export default App