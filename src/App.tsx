import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PagerProvider } from './context/PagerContext'
import { HomePage } from './pages/HomePage'
import { SendPage } from './pages/SendPage'

function App() {
  return (
    <PagerProvider>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <h1>90年代寻呼机模拟器</h1>
            <p className="app-subtitle">BRAVO Pager Simulator · 1998</p>
          </header>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/send" element={<SendPage />} />
          </Routes>
          <footer className="app-footer">
            Mock 数据 · 无后端 · 复古绿屏 UI
          </footer>
        </div>
      </BrowserRouter>
    </PagerProvider>
  )
}

export default App
