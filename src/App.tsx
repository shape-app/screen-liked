/**
 * Copyright (c) 2025-present Shape
 * Licensed under the MIT License
 */

import './App.css'

interface Show {
  title: string
  score: number
  watching?: boolean
}

function App() {
  const shows: Show[] = [
    { title: "The Rookie S7", score: 2 },
    { title: "Bitch x Rich S2", score: 1 },
    { title: "Law and the City", score: 3 },
    { title: "Blue Bloods S13 S14", score: 1 },
    { title: "Beyond the Bar", score: 3 },
    { title: "Salon de Holmes", score: 3 },
    { title: "Shin's Project", score: 3, watching: true },
    { title: "Ms. Incognito", score: 0, watching: true },
  ]

  const renderRating = (score: number) => {
    return (
      <div className="rating">
        {Array.from({ length: score }, (_, i) => (
          <span key={i} className="dot"></span>
        ))}
      </div>
    )
  }

  return (
    <div className="container">
      <h1>2025</h1>
      <p className="subtitle">● Liked · ●● Really liked · ●●● Loved</p>
      <div className="shows-list">
        {shows.map((show, index) => (
          <div key={index} className="show-item">
            <div className="show-info">
              <span className="show-title">{show.title}</span>
              {show.watching && <span className="watching-badge">watching</span>}
            </div>
            {renderRating(show.score)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
