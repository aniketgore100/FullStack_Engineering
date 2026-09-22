import { useState } from 'react'
import './App.css'
import { Search } from './components/Search'
import { Home } from './pages/home'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path='/home' element={<Home/>}/>
    </Routes>
  )
}

export default App
