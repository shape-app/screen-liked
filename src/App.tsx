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

  const renderStars = (score: number) => {
    return (
      <div className="stars">
        {[1, 2, 3].map((star) => (
          <span key={star} className={star <= score ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="container">
      <h1>2025 Shows</h1>
      <div className="shows-list">
        {shows.map((show, index) => (
          <div key={index} className="show-item">
            <div className="show-info">
              <span className="show-title">{show.title}</span>
              {show.watching && <span className="watching-badge">watching</span>}
            </div>
            {renderStars(show.score)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
