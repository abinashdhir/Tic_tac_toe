import './ScoreBoard.css';

const ScoreBoard = ({ scores = { x: 0, o: 0, draws: 0 }, onResetScores }) => {
  const totalGames = (scores.x || 0) + (scores.o || 0) + (scores.draws || 0);

  return (
    <div className="scoreboardCard" role="region" aria-label="Session Scoreboard">
      <div className="scoreboardHeader">
        <div className="scoreboardTitleWrap">
          <span className="scoreboardIcon">📊</span>
          <h2 className="scoreboardTitle">Session Scoreboard</h2>
        </div>
        <span className="totalGamesBadge">{totalGames} {totalGames === 1 ? 'Round' : 'Rounds'}</span>
      </div>

      <div className="scoreGrid">
        {/* Player X Stats */}
        <div className="scoreItem itemX">
          <div className="scoreBadgeWrap">
            <span className="playerBadge badgeX">X</span>
            <span className="scoreLabel">Player X</span>
          </div>
          <div className="scoreValue" id="scoreX">{scores.x || 0}</div>
          <span className="scoreSubtext">Wins</span>
        </div>

        {/* Draws Stats */}
        <div className="scoreItem itemDraw">
          <div className="scoreBadgeWrap">
            <span className="playerBadge badgeDraw">🤝</span>
            <span className="scoreLabel">Ties</span>
          </div>
          <div className="scoreValue" id="scoreDraws">{scores.draws || 0}</div>
          <span className="scoreSubtext">Draws</span>
        </div>

        {/* Player O Stats */}
        <div className="scoreItem itemO">
          <div className="scoreBadgeWrap">
            <span className="playerBadge badgeO">O</span>
            <span className="scoreLabel">Player O</span>
          </div>
          <div className="scoreValue" id="scoreO">{scores.o || 0}</div>
          <span className="scoreSubtext">Wins</span>
        </div>
      </div>

      {onResetScores && (
        <button
          type="button"
          className="resetScoreBtn"
          onClick={onResetScores}
          title="Reset session score counts to zero"
          disabled={totalGames === 0}
        >
          <span className="btnIcon">↺</span> Reset Scores
        </button>
      )}
    </div>
  );
};

export default ScoreBoard;
