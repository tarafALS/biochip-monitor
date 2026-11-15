import { useState } from 'react'
import Layout from './components/Layout'
import RoleSelect from './components/RoleSelect'
import { LanguageProvider } from './i18n'
import ChipData from './pages/ChipData'
import Connection from './pages/Connection'
import ManualInputs from './pages/ManualInputs'
import { ManualProvider } from './sim/ManualContext'
import { SimulationProvider } from './sim/SimulationContext'
import Starfield from './viz/Starfield'

const PAGE_COMPONENTS = { chip: ChipData, manual: ManualInputs, connection: Connection }

export default function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('chip')
  const Page = PAGE_COMPONENTS[page]

  return (
    <LanguageProvider>
      <SimulationProvider>
        <ManualProvider>
        <Starfield />
        {session ? (
          <Layout session={session} onSessionChange={setSession} page={page} onPageChange={setPage}>
            <Page astronautId={session.astronautId} role={session.role} />
          </Layout>
        ) : (
          <RoleSelect onSelect={setSession} />
        )}
        </ManualProvider>
      </SimulationProvider>
    </LanguageProvider>
  )
}
