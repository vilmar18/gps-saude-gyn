// App.jsx — componente principal do GPS da Saúde GYN
// É aqui que o sistema começa. Tudo que o usuário vê passa por aqui.

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// MapContainer  — cria o mapa na tela
// TileLayer     — carrega as imagens do mapa (ruas, bairros) do OpenStreetMap
// Marker        — coloca um pino/marcador no mapa
// Popup         — o balão que aparece quando o usuário clica num marcador

import 'leaflet/dist/leaflet.css'
// Importa o estilo visual do Leaflet — sem isso o mapa fica quebrado

import L from 'leaflet'
// L é o objeto principal do Leaflet, usado para configurações avançadas

// Correção necessária: o Leaflet tem um bug no ícone padrão quando usado com Vite
// Essas 3 linhas corrigem o ícone do marcador no mapa
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

// Lista das unidades de saúde de Goiânia
// Cada objeto representa uma unidade com nome, tipo e coordenadas (latitude e longitude)
const unidades = [
  {
    id: 1,
    nome: 'UPA Novo Mundo',
    tipo: 'UPA',
    lat: -16.6960,
    lng: -49.3010,
  },
  {
    id: 2,
    nome: 'UPA Noroeste',
    tipo: 'UPA',
    lat: -16.6540,
    lng: -49.2800,
  },
  {
    id: 3,
    nome: 'UPA Amendoeiras',
    tipo: 'UPA',
    lat: -16.7350,
    lng: -49.3200,
  },
  {
    id: 4,
    nome: 'CAIS Campinas',
    tipo: 'CAIS',
    lat: -16.6890,
    lng: -49.2540,
  },
  {
    id: 5,
    nome: 'CAIS Cândida de Morais',
    tipo: 'CAIS',
    lat: -16.7100,
    lng: -49.2900,
  },
]

// Componente principal do App
function App() {
  return (
    // div externa — ocupa a tela inteira, fundo cinza claro
    <div className="min-h-screen bg-gray-100">

      {/* Cabeçalho do sistema */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">
          GPS da Saúde GYN
        </h1>
        <p className="text-center text-sm mt-1">
          Unidades de saúde de Goiânia em tempo real
        </p>
      </header>

      {/* Área do mapa — ocupa o restante da tela */}
      <main className="p-4">
        <MapContainer
          center={[-16.6869, -49.2648]} // Centro do mapa: coordenadas de Goiânia
          zoom={12}                       // Nível de zoom inicial (quanto maior, mais próximo)
          style={{ height: '80vh', width: '100%', borderRadius: '12px' }}
          // height: 80vh = 80% da altura da tela
          // width: 100%  = largura total disponível
          // borderRadius = bordas arredondadas no mapa
        >
          {/* TileLayer carrega o visual do mapa (ruas, nomes) do OpenStreetMap — gratuito */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap'
          />

          {/* Percorre a lista de unidades e coloca um marcador no mapa para cada uma */}
          {unidades.map((unidade) => (
            <Marker
              key={unidade.id}              // identificador único de cada marcador
              position={[unidade.lat, unidade.lng]} // posição no mapa
            >
              {/* Popup: balão que aparece quando o usuário clica no marcador */}
              <Popup>
                <strong>{unidade.nome}</strong>
                <br />
                Tipo: {unidade.tipo}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  )
}

// Exporta o componente para que o React consiga usá-lo
export default App