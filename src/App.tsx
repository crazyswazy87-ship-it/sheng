import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import About from './pages/About'
import TermsOfUse from './pages/TermsOfUse'


function App() {
  return (
    <>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/terms" element={<TermsOfUse />} /> 
    </Routes>
    
    </>
  )
}

export default App