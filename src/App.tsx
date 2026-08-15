import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { TabBar } from './components/TabBar'
import { Compare } from './screens/Compare'
import { Feed } from './screens/Feed'
import { Log } from './screens/Log'
import { NearbyMap } from './screens/NearbyMap'
import { Shelves } from './screens/Shelves'
import { StoreDetail } from './screens/StoreDetail'

/** Full-screen flows own the whole viewport; the tab bar would only get in the way. */
const FULLSCREEN = ['/log', '/compare']

function Shell() {
  const { pathname } = useLocation()
  const showTabs = !FULLSCREEN.includes(pathname)

  return (
    <div className="bg-surface mx-auto flex h-full max-w-md flex-col">
      <main className={`min-h-0 flex-1 overflow-y-auto ${showTabs ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/map" element={<NearbyMap />} />
          <Route path="/store/:storeId" element={<StoreDetail />} />
          <Route path="/shelves" element={<Shelves />} />
          <Route path="/log" element={<Log />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
      {showTabs && <TabBar />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
