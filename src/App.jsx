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

function App() {
    const [unidades, setUnidades] = useState([])
    const [carregando, setCarregando] = useState(true)

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

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            <header className="bg-blue-700 text-white p-4 shadow-md">
                <h1 className="text-2xl font-bold text-center">GPS da Saúde GYN</h1>
                <p className="text-center text-sm mt-1">Unidades de saúde de Goiânia em tempo real</p>
            </header>

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

                <div className="w-72 bg-white rounded-xl shadow p-3 overflow-y-auto max-h-[80vh]">
                    <h2 className="font-bold text-gray-700 mb-3 text-lg">Unidades de Saúde</h2>

                    {carregando && <p className="text-sm text-gray-500">Carregando...</p>}

                    {unidades.map((unidade) => (
                        <div key={unidade.id} className="mb-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
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
                        </div>
                    ))}
                </div>

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