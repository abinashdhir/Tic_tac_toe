import { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import User from './components/Users/User';
import Board from './components/Board/Board';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import MoveTracker from './components/MoveTracker/MoveTracker';

// 8 Winning Combinations on a 3x3 grid
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal \
  [2, 4, 6], // Diagonal /
];

// Descriptive names for each cell position
const POSITION_NAMES = [
  'Top Left',
  'Top Center',
  'Top Right',
  'Middle Left',
  'Center',
  'Middle Right',
  'Bottom Left',
  'Bottom Center',
  'Bottom Right',
];

// Session storage key for scoreboard
const STORAGE_KEY = 'tictactoe_session_scores';
const TOTAL_AUTO_RESET_SECONDS = 5;

function getInitialScores() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        x: Number(parsed.x) || 0,
        o: Number(parsed.o) || 0,
        draws: Number(parsed.draws) || 0,
      };
    }
  } catch (e) {
    console.error('Failed to read session scores:', e);
  }
  return { x: 0, o: 0, draws: 0 };
}

function checkBoardState(board) {
  // Check for winning lines
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo, isDraw: false };
    }
  }

  // Check for draw (all 9 cells filled and no winner)
  const isFull = board.every((cell) => cell !== null);
  if (isFull) {
    return { winner: null, line: null, isDraw: true };
  }

  return { winner: null, line: null, isDraw: false };
}

function App() {
  // Core game states
  const [board, setBoard] = useState(() => Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [history, setHistory] = useState([]); // List of moves

  // Game outcome states
  const [winner, setWinner] = useState(null); // 'X' | 'O' | null
  const [winningLine, setWinningLine] = useState(null); // [a, b, c] | null
  const [isDraw, setIsDraw] = useState(false);
  const [lastGameSummary, setLastGameSummary] = useState(null);

  // Session scoreboard
  const [scores, setScores] = useState(getInitialScores);

  // Auto-reset countdown after game ends
  const [autoResetCountdown, setAutoResetCountdown] = useState(null);
  const [isAutoResetPaused, setIsAutoResetPaused] = useState(false);

  const isGameOver = Boolean(winner || isDraw);

  // Reset current board and move history for a new round
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setHistory([]);
    setTurn('X');
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setAutoResetCountdown(null);
    setIsAutoResetPaused(false);
  }, []);

  // Handle cell click (valid move validation)
  const handleCellClick = (index) => {
    // Invalid move: cell already filled or game is completed
    if (board[index] !== null || isGameOver) {
      return;
    }

    // Dismiss previous match summary once a new move begins
    if (lastGameSummary) {
      setLastGameSummary(null);
    }

    const nextBoard = [...board];
    nextBoard[index] = turn;

    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    const positionLabel = POSITION_NAMES[index];

    const newMove = {
      moveNumber: history.length + 1,
      player: turn,
      index,
      row,
      col,
      positionLabel,
      boardState: nextBoard,
    };

    const nextHistory = [...history, newMove];
    setBoard(nextBoard);
    setHistory(nextHistory);

    // Evaluate win/draw condition
    const result = checkBoardState(nextBoard);

    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setLastGameSummary(`Player ${result.winner} Won!`);

      // Update session scoreboard
      setScores((prev) => {
        const key = result.winner.toLowerCase();
        const updated = { ...prev, [key]: (prev[key] || 0) + 1 };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // Start auto-reset countdown
      setAutoResetCountdown(TOTAL_AUTO_RESET_SECONDS);
    } else if (result.isDraw) {
      setIsDraw(true);
      setLastGameSummary('Draw Match');

      // Update session scoreboard
      setScores((prev) => {
        const updated = { ...prev, draws: (prev.draws || 0) + 1 };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // Start auto-reset countdown
      setAutoResetCountdown(TOTAL_AUTO_RESET_SECONDS);
    } else {
      // Toggle turn
      setTurn((prevTurn) => (prevTurn === 'X' ? 'O' : 'X'));
    }
  };

  // Undo last move
  const handleUndo = () => {
    if (history.length === 0) return;

    // If game was completed, reverting the last move reopens the game
    if (isGameOver) {
      if (winner) {
        setScores((prev) => {
          const key = winner.toLowerCase();
          const updated = { ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      } else if (isDraw) {
        setScores((prev) => {
          const updated = { ...prev, draws: Math.max(0, (prev.draws || 0) - 1) };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
      setWinner(null);
      setWinningLine(null);
      setIsDraw(false);
      setLastGameSummary(null);
      setAutoResetCountdown(null);
      setIsAutoResetPaused(false);
    }

    const nextHistory = history.slice(0, -1);
    const lastMove = history[history.length - 1];

    const prevBoard =
      nextHistory.length > 0
        ? [...nextHistory[nextHistory.length - 1].boardState]
        : Array(9).fill(null);

    setBoard(prevBoard);
    setHistory(nextHistory);
    // Return turn to the player whose move was undone
    setTurn(lastMove.player);
  };

  // Reset session scores
  const handleResetScores = () => {
    const emptyScores = { x: 0, o: 0, draws: 0 };
    setScores(emptyScores);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(emptyScores));
  };

  // Auto-reset timer effect when game completes
  useEffect(() => {
    if (autoResetCountdown === null || isAutoResetPaused) return;

    const timer = setTimeout(() => {
      if (autoResetCountdown > 1) {
        setAutoResetCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      } else {
        resetGame();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoResetCountdown, isAutoResetPaused, resetGame]);

  // Turn status banner text
  const statusMessage = useMemo(() => {
    if (winner) {
      return `🎉 Player ${winner} Wins!`;
    }
    if (isDraw) {
      return `🤝 It's a Draw!`;
    }
    return `Player ${turn}'s Turn`;
  }, [winner, isDraw, turn]);

  const countdownPercent = autoResetCountdown !== null
    ? ((TOTAL_AUTO_RESET_SECONDS - autoResetCountdown) / TOTAL_AUTO_RESET_SECONDS) * 100
    : 0;

  return (
    <div className="App">
      {/* App Header */}
      <header className="appHeader">
        <div className="headerBadge">Pair Strategy Arena</div>
        <h1 className="appTitle">Tic Tac Toe</h1>
        <p className="appSubtitle">Modern pair play with real-time move tracking, undo, and session tally</p>
      </header>

      {/* Game Outcome & Auto-Reset Announcement Banner */}
      {isGameOver && (
        <div className={`outcomeBanner ${winner ? 'winnerBanner' : 'drawBanner'}`} role="alert">
          <div className="outcomeContent">
            <span className="outcomeIcon">{winner ? '🏆' : '🤝'}</span>
            <div className="outcomeTexts">
              <h2 className="outcomeTitle" id="winnerAnnouncement">
                {winner ? `Player ${winner} Victorious!` : `Match Ended in a Draw!`}
              </h2>
              {autoResetCountdown !== null && !isAutoResetPaused ? (
                <div>
                  <p className="outcomeCountdown">
                    Board auto-resetting for next round in <strong>{autoResetCountdown}s</strong>...
                  </p>
                  <div className="countdownProgress">
                    <div
                      className="countdownBar"
                      style={{ width: `${100 - countdownPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="outcomeCountdown">Auto-reset paused. Review board & move history.</p>
              )}
            </div>
          </div>
          <div className="outcomeActions">
            <button
              type="button"
              className="nextRoundBtn"
              id="nextRoundBtn"
              onClick={resetGame}
            >
              Play Next Round Now
            </button>
            {autoResetCountdown !== null && (
              <button
                type="button"
                className="pauseTimerBtn"
                onClick={() => setIsAutoResetPaused((prev) => !prev)}
              >
                {isAutoResetPaused ? 'Resume Timer' : 'Pause Timer'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Current Turn Status Bar with Previous Result Badge */}
      <div className="statusBar">
        <div className={`statusPill ${winner ? 'statusWinner' : isDraw ? 'statusDraw' : turn === 'X' ? 'statusX' : 'statusO'}`}>
          <span className="statusDot" />
          <span className="statusText">{statusMessage}</span>
        </div>

        {!isGameOver && lastGameSummary && (
          <div className="lastResultPill">
            <span className="lastResultIcon">⚡</span>
            <span>Last Round: {lastGameSummary}</span>
          </div>
        )}
      </div>

      {/* Primary Layout: ScoreBoard, Board, MoveTracker */}
      <main className="boardWrapper">
        <ScoreBoard
          scores={scores}
          onResetScores={handleResetScores}
        />

        <div className="boardCenterCol">
          <Board
            board={board}
            onCellClick={handleCellClick}
            turn={turn}
            winningLine={winningLine}
            isGameOver={isGameOver}
          />
        </div>

        <MoveTracker history={history} />
      </main>

      {/* Player Indicators & Action Controls */}
      <section className="controlwrap">
        <div className="userWrapper" aria-label="Player turn indicators">
          <User
            player="X"
            name="Player X"
            isActive={!isGameOver && turn === 'X'}
            isWinner={winner === 'X'}
            score={scores.x}
            className={turn === 'X' && !isGameOver ? 'activeUser' : ''}
          />

          <div className="vsDivider">
            <span className="vsText">VS</span>
          </div>

          <User
            player="O"
            name="Player O"
            isActive={!isGameOver && turn === 'O'}
            isWinner={winner === 'O'}
            score={scores.o}
            className={turn === 'O' && !isGameOver ? 'activeUser' : ''}
          />
        </div>

        <div className="control">
          <button
            className="resetBtn"
            id="resetBtn"
            onClick={resetGame}
            title="Clear the current board and move history"
          >
            <span className="btnIcon">↺</span> Reset Game
          </button>

          <button
            className="undoBtn"
            id="undoBtn"
            onClick={handleUndo}
            disabled={history.length === 0}
            title={history.length === 0 ? 'No moves to undo' : 'Undo last played move'}
          >
            <span className="btnIcon">↶</span> Undo Move
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
