import ReactDOM from 'react-dom/client'
import '@arco-design/web-react/dist/css/arco.css'
import './styles.css'
import App from './App'
import { AuthProvider } from './providers/AuthProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
