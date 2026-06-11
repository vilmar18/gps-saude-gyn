import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Função que cria ícones coloridos para cada tipo de unidade
// Cada tipo recebe uma cor diferente para facilitar a identificação no mapa
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

// Ícones por tipo de unidade
const icones = {
  UPA:  criarIcone('#ef4444'),  // vermelho
  CAIS: criarIcone('#3b82f6'),  // azul
  CIAM: criarIcone('#22c55e'),  // verde
}

// Lista completa das unidades de saúde de Goiânia
const unidades = [
  { id: 1,  nome: 'UPA Novo Mundo',           tipo: 'UPA',  lat: -16.6960, lng: -49.3010 },
  { id: 2,  nome: 'UPA Noroeste',             tipo: 'UPA',  lat: -16.6540, lng: -49.2800 },
  { id: 3,  nome: 'UPA Amendoeiras',          tipo: 'UPA',  lat: -16.7350, lng: -49.3200 },
  { id: 4,  nome: 'UPA Jardim Guanabara',     tipo: 'UPA',  lat: -16.6420, lng: -49.2350 },
  { id: 5,  nome: 'UPA Vila Nova',            tipo: 'UPA',  lat: -16.7100, lng: -49.2650 },
  { id: 6,  nome: 'CAIS Campinas',            tipo: 'CAIS', lat: -16.6890, lng: -49.2540 },
  { id: 7,  nome: 'CAIS Cândida de Morais',   tipo: 'CAIS', lat: -16.7100, lng: -49.2900 },
  { id: 8,  nome: 'CAIS Jardim América',      tipo: 'CAIS', lat: -16.7200, lng: -49.2700 },
  { id: 9,  nome: 'CAIS Finsocial',           tipo: 'CAIS', lat: -16.6700, lng: -49.3100 },
  { id: 10, nome: 'CAIS Vila União',          tipo: 'CAIS', lat: -16.6600, lng: -49.2600 },
  { id: 11, nome: 'CIAM Centro',              tipo: 'CIAM', lat: -16.6790, lng: -49.2550 },
  { id: 12, nome: 'CIAM Novo Horizonte',      tipo: 'CIAM', lat: -16.6950, lng: -49.3150 },
]

// Componente principal
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Cabeçalho */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">GPS da Saúde GYN</h1>
        <p className="text-center text-sm mt-1">Unidades de saúde de Goiânia em tempo real</p>
      </header>

      {/* Legenda de cores */}
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

      {/* Área principal: lista + mapa lado a lado */}
      <div className="flex flex-1 gap-4 p-4">

        {/* Painel lateral com lista de unidades */}
        <div className="w-72 bg-white rounded-xl shadow p-3 overflow-y-auto max-h-[80vh]">
          <h2 className="font-bold text-gray-700 mb-3 text-lg">Unidades de Saúde</h2>
          {unidades.map((unidade) => (
            <div key={unidade.id} className="mb-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              {/* Bolinha colorida + nome da unidade */}
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full inline-block ${
                  unidade.tipo === 'UPA'  ? 'bg-red-500'   :
                  unidade.tipo === 'CAIS' ? 'bg-blue-500'  :
                  'bg-green-500'
                }`}></span>
                <span className="font-medium text-sm text-gray-800">{unidade.nome}</span>
              </div>
              {/* Tipo da unidade */}
              <span className="text-xs text-gray-500 ml-5">{unidade.tipo}</span>
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