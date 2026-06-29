import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from './supabase'
import MinhasConsultas from './MinhasConsultas'
import Atendente from './Atendente'

function criarIcone(cor) {
    return L.divIcon({
        className: '',
        html: `<div style="background-color: ${cor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    })
}

const icones = {
    UPA:      criarIcone('#ef4444'),
    CAIS:     criarIcone('#3b82f6'),
    CIAM:     criarIcone('#22c55e'),
    Hospital: criarIcone('#a855f7'),
}

const corPorTipo = {
    UPA:      'bg-red-500',
    CAIS:     'bg-blue-500',
    CIAM:     'bg-green-500',
    Hospital: 'bg-purple-500',
}

const opcoesTempo = [
    'Sem espera',
    'Ate 30 minutos',
    '30 min a 1 hora',
    '1 a 2 horas',
    'Mais de 2 horas',
]

function ControlarMapa({ unidade }) {
    const map = useMap()
    useEffect(() => {
        if (unidade) {
            map.flyTo([unidade.lat, unidade.lng], 15, { duration: 0.8 })
        }
    }, [unidade, map])
    return null
}

function App() {
    const [unidades, setUnidades] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [unidadeSelecionada, setUnidadeSelecionada] = useState(null)
    const [unidadeFoco, setUnidadeFoco] = useState(null)
    const [ultimosReportes, setUltimosReportes] = useState({})
    const [mensagem, setMensagem] = useState('')
    const [tela, setTela] = useState('mapa')
    const [drawerAberto, setDrawerAberto] = useState(false)
    const markerRefs = useRef({})

    useEffect(() => {
        async function buscarUnidades() {
            const { data, error } = await supabase.from('unidades').select('*')
            if (error) console.error('Erro:', error)
            else setUnidades(data)
            setCarregando(false)
        }
        buscarUnidades()
    }, [])

    useEffect(() => {
        async function buscarReportes() {
            const { data, error } = await supabase
                .from('reportes')
                .select('*')
                .order('criado_em', { ascending: false })
            if (error) { console.error('Erro:', error); return }
            const mapa = {}
            data.forEach((r) => { if (!mapa[r.unidade_id]) mapa[r.unidade_id] = r.tempo_espera })
            setUltimosReportes(mapa)
        }
        buscarReportes()
    }, [])

    async function enviarReporte(unidadeId, tempo) {
        const { error } = await supabase
            .from('reportes')
            .insert([{ unidade_id: unidadeId, tempo_espera: tempo }])
        if (error) {
            setMensagem('Erro ao enviar. Tente novamente.')
        } else {
            setUltimosReportes((ant) => ({ ...ant, [unidadeId]: tempo }))
            setMensagem('Reporte enviado! Obrigado por contribuir.')
            setUnidadeSelecionada(null)
        }
        setTimeout(() => setMensagem(''), 3000)
    }

    function selecionarUnidade(unidade) {
        setUnidadeFoco(unidade)
        setUnidadeSelecionada(unidadeSelecionada === unidade.id ? null : unidade.id)
        setTimeout(() => {
            const ref = markerRefs.current[unidade.id]
            if (ref) ref.openPopup()
        }, 900)
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">

            <header className="bg-blue-700 text-white px-4 py-3 shadow-md flex-shrink-0">
                <h1 className="text-xl font-bold text-center">GPS da Saude GYN</h1>
                <p className="text-center text-xs mt-0.5 opacity-80">Unidades de saude de Goiania em tempo real</p>
            </header>

            <div className="flex justify-center gap-2 bg-white px-2 py-2 shadow flex-shrink-0">
                {['mapa', 'consultas', 'atendente'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTela(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tela === t ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        {t === 'mapa' ? 'Mapa' : t === 'consultas' ? 'Minhas Consultas' : 'Atendente'}
                    </button>
                ))}
            </div>

            {tela === 'consultas' && <div className="flex-1 overflow-y-auto"><MinhasConsultas /></div>}
            {tela === 'atendente' && <div className="flex-1 overflow-y-auto"><Atendente /></div>}

            {tela === 'mapa' && (
                <div className="flex-1 relative overflow-hidden">

                    {mensagem && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-green-600 text-white text-sm px-4 py-2 rounded-full shadow-lg">
                            {mensagem}
                        </div>
                    )}

                    <div className="absolute top-2 right-2 z-[1000] bg-white rounded-xl shadow px-3 py-2 flex flex-col gap-1 text-xs font-medium">
                        {Object.entries(corPorTipo).map(([tipo, cor]) => (
                            <span key={tipo} className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${cor}`}></span>
                                {tipo}
                            </span>
                        ))}
                    </div>

                    <MapContainer
                        center={[-16.6869, -49.2648]}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="© OpenStreetMap"
                        />
                        <ControlarMapa unidade={unidadeFoco} />
                        {unidades.map((unidade) => (
                            <Marker
                                key={unidade.id}
                                position={[unidade.lat, unidade.lng]}
                                icon={icones[unidade.tipo] || icones['UPA']}
                                ref={(ref) => { if (ref) markerRefs.current[unidade.id] = ref }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '160px' }}>
                                        <strong style={{ fontSize: '13px' }}>{unidade.nome}</strong>
                                        <br />
                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{unidade.tipo}</span>
                                        {unidade.endereco && (
                                            <><br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>{unidade.endereco}</span></>
                                        )}
                                        {ultimosReportes[unidade.id] && (
                                            <><br /><span style={{ fontSize: '11px', color: '#ea580c' }}>Espera: {ultimosReportes[unidade.id]}</span></>
                                        )}
                                        <br /><br />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${unidade.lat},${unidade.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#16a34a', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline' }}
                                            >
                                                Google Maps
                                            </a>
                                            <span style={{ color: '#d1d5db' }}>|</span>
                                            <a
                                                href={`https://waze.com/ul?ll=${unidade.lat},${unidade.lng}&navigate=yes`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline' }}
                                            >
                                                Waze
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    <div className={`absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ${drawerAberto ? 'h-[65vh]' : 'h-[72px]'}`}>
                        <div
                            className="flex flex-col items-center pt-2 pb-1 cursor-pointer"
                            onClick={() => setDrawerAberto(!drawerAberto)}
                        >
                            <div className="w-10 h-1 bg-gray-300 rounded-full mb-2"></div>
                            <div className="flex justify-between items-center w-full px-4">
                                <span className="font-bold text-gray-700 text-sm">
                                    {carregando ? 'Carregando...' : `${unidades.length} unidades de saude`}
                                </span>
                                <span className="text-gray-400 text-xs">{drawerAberto ? 'Fechar' : 'Ver lista'}</span>
                            </div>
                        </div>

                        <div className="overflow-y-auto h-[calc(100%-72px)] px-3 pb-4">
                            {unidades.map((unidade) => (
                                <div
                                    key={unidade.id}
                                    className={`mb-2 p-3 rounded-xl border transition-colors cursor-pointer ${unidadeSelecionada === unidade.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                    onClick={() => selecionarUnidade(unidade)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${corPorTipo[unidade.tipo] || 'bg-gray-400'}`}></span>
                                        <span className="font-semibold text-sm text-gray-800">{unidade.nome}</span>
                                    </div>

                                    <div className="ml-5 mt-0.5">
                                        <span className="text-xs text-gray-500">{unidade.tipo}</span>
                                        {unidade.endereco && (
                                            <p className="text-xs text-gray-400 mt-0.5">{unidade.endereco}</p>
                                        )}
                                        <div className="flex gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${unidade.lat},${unidade.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-green-600 underline font-medium"
                                            >
                                                Google Maps
                                            </a>
                                            <span className="text-gray-300 text-xs">|</span>
                                            <a
                                                href={`https://waze.com/ul?ll=${unidade.lat},${unidade.lng}&navigate=yes`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-500 underline font-medium"
                                            >
                                                Waze
                                            </a>
                                        </div>
                                        {ultimosReportes[unidade.id] ? (
                                            <p className="text-xs text-orange-600 mt-1 font-medium">
                                                Espera: {ultimosReportes[unidade.id]}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-300 mt-1">Sem reporte recente</p>
                                        )}
                                    </div>

                                    {unidadeSelecionada === unidade.id && (
                                        <div className="ml-5 mt-3" onClick={(e) => e.stopPropagation()}>
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Qual o tempo de espera agora?</p>
                                            <div className="flex flex-col gap-1">
                                                {opcoesTempo.map((opcao) => (
                                                    <button
                                                        key={opcao}
                                                        onClick={() => enviarReporte(unidade.id, opcao)}
                                                        className="text-xs bg-gray-100 hover:bg-blue-100 active:bg-blue-200 rounded-lg p-2 text-left font-medium text-gray-700 transition-colors"
                                                    >
                                                        {opcao}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setUnidadeSelecionada(null)}
                                                className="text-xs text-gray-400 mt-2 underline"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}

                                    {unidadeSelecionada !== unidade.id && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); selecionarUnidade(unidade) }}
                                            className="ml-5 mt-1 text-xs text-blue-600 underline"
                                        >
                                            Reportar tempo de espera
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default App
