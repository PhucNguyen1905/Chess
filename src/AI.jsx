import React, { useEffect, useState } from 'react'
import './App.css'
import { gameSubject, initGame, resetGame } from './Game'
import Board from './Board'
import { useHistory } from 'react-router-dom'

function AI() {
  const [board, setBoard] = useState([])
  const [isGameOver, setIsGameOver] = useState()
  const [result, setResult] = useState()
  const [showModal2, setShowModal2] = useState(false);
  const history = useHistory()


  const gameDifficulty = [
    { label: "Easy", value: 1 },
    { label: "Normal", value: 2 },
    { label: "Hard", value: 3 },
  ];

  
  function setGameDifficulty(diff) {
    localStorage.setItem("difficulty", diff);
    setShowModal2(false)
  }

  function handlePauseGame() {
    setShowModal2(true);
  }
  function handleExit(){
    setShowModal2(false)
    resetGame()
    history.push('/')

  }
  useEffect(() => {
    initGame()
    const subscribe = gameSubject.subscribe((game) => {
      setBoard(game.board)
      setIsGameOver(game.isGameOver)
      setResult(game.result)
    })
    return () => subscribe.unsubscribe()
  }, [])
  return (
    <div className="app-container">
      {isGameOver && (
        <h2 className="vertical-text">
          GAME OVER
          <button onClick={resetGame}>
            <span className="vertical-text"> NEW GAME</span>
          </button>
        </h2>
      )}
      <div className="board-container">
        <Board board={board}/>
      <div className='pause-button'  onClick={handlePauseGame}><i class="fas fa-play"></i></div>

      </div>
      {result && <p className="vertical-text">{result}</p>}
      <div className={`modal ${showModal2 ? "is-active" : ""}`}>
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="card">
              <div className="card-content">
                <div className="content"><h2>Game Paused</h2></div>
              </div>
              <footer className="card-footer">
                {gameDifficulty.map(({ label, value }) => (
                  <span
                    className="card-footer-item pointer"
                    key={value}
                    onClick={() => setGameDifficulty(value)}
                  >
                    {label}
                  </span>
                ))}
              </footer>
              <footer className="card-footer">
                  <span
                    className="card-footer-item card-item-single pointer"
                    onClick={() => setShowModal2(false)}
                  >
                    Continue
                  </span>
              </footer>
              <footer className="card-footer">
                  <span
                    className="card-footer-item card-item-single pointer"
                    onClick={() => handleExit()}
                  >
                    Exit
                  </span>
              </footer>
            </div>
          </div>

        </div>
    </div>
  )
}

export default AI
