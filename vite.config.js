//Importa a função que configura o Vite
import { defineConfig } from 'vite'

//Importa o pluguin do Rect - permite usar JSX (a sintaxe HTML dentro do JavaScript)
import react from '@vitejs/plugin-react'

//Importa o plugin do Tailwind - conecta o Tailwind ao Vite
import tailwindcss from '@tailwindcss/vite'

//Exporta a configuração do projeto
export default defineConfig({
    plugins: [
        react(),         // Ativa o React no projeto
        tailwindcss(),  //  Ativa o Tailwind no projeto
    ],
})