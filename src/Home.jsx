import React, { useState } from "react";
import { auth, db } from "./firebase";
import { useHistory } from "react-router-dom";
export default function Home() {
  const { currentUser } = auth;
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const history = useHistory();
  const newGameOptions = [
    { label: "Black pieces", value: "b" },
    { label: "White pieces", value: "w" },
    { label: "Random", value: "r" },
  ];

  const gameDifficulty = [
    { label: "Easy", value: 1 },
    { label: "Normal", value: 2 },
    { label: "Hard", value: 3 },
  ];

  function handlePlayOnline() {
    setShowModal(true);
  }

  function handlePlayOffline() {
    setShowModal2(true);
  }

  function startOfflineGame(diff) {
    localStorage.setItem("difficulty", diff);
    history.push(`/ai`);
  }

  async function startOnlineGame(startingPiece) {
    const member = {
      uid: currentUser.uid,
      piece:
        startingPiece === "r"
          ? ["b", "w"][Math.round(Math.random())]
          : startingPiece,
      name: localStorage.getItem("userName"),
      creator: true,
    };
    const game = {
      status: "waiting",
      members: [member],
      gameId: `${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    };
    await db.collection("games").doc(game.gameId).set(game);
    history.push(`/game/${game.gameId}`);
  }

  return (
    <>
      <div className="app-container ">
        <div className={`modal ${showModal ? "is-active" : ""}`}>
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="card">
              <div className="card-content">
                <div className="content">
                  <h2>Select the piece you want to start</h2>
                </div>
              </div>
              <footer className="card-footer">
                {newGameOptions.map(({ label, value }) => (
                  <span
                    className="card-footer-item pointer"
                    key={value}
                    onClick={() => startOnlineGame(value)}
                  >
                    {label}
                  </span>
                ))}
              </footer>
            </div>
          </div>
          <button
            className="modal-close is-large"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        <div className={`modal ${showModal2 ? "is-active" : ""}`}>
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="card">
              <div className="card-content">
                <div className="content"><h2>Select Difficulty</h2></div>
              </div>
              <footer className="card-footer">
                {gameDifficulty.map(({ label, value }) => (
                  <span
                    className="card-footer-item pointer"
                    key={value}
                    onClick={() => startOfflineGame(value)}
                  >
                    {label}
                  </span>
                ))}
              </footer>
            </div>
          </div>
          <button
            className="modal-close is-large"
            onClick={() => setShowModal2(false)}
          ></button>
        </div>


        <div id="menu">
        <div id="chess">
            <p>CHESS GAME</p>
          </div>
          <div id="single" onClick={handlePlayOffline}>
            <p>SINGLE PLAYER</p>
          </div>
          <div id="multiplayer" onClick={handlePlayOnline}>
            <p>MULTIPLAYER</p>
          </div>

        </div>
      </div>
    </>
  );
}
