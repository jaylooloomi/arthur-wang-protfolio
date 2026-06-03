import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 不使用 StrictMode：其 dev 期雙重掛載會讓 drei <Scroll html> 對同一容器
// 重複呼叫 createRoot 而報錯，且與 Three.js 命令式初始化相衝突（R3F 慣例）。
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
