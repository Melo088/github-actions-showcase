import Nav from './components/Nav.jsx'
import Hero from './sections/Hero.jsx'
import Eventos from './sections/Eventos.jsx'
import Yaml from './sections/Yaml.jsx'
import Secrets from './sections/Secrets.jsx'
import Pruebas from './sections/Pruebas.jsx'
import Marketplace from './sections/Marketplace.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Eventos />
        <Yaml />
        <Secrets />
        <Pruebas />
        <Marketplace />
      </main>
    </>
  )
}
