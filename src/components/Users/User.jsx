import './User.css';

const User = ({
  player = 'X',
  name = 'Player X',
  isActive = false,
  isWinner = false,
  score = 0,
  className = '',
}) => {
  const isX = player === 'X';

  return (
    <div
      className={`user ${isX ? 'playerCardX' : 'playerCardO'} ${isActive ? 'activeUser' : ''} ${isWinner ? 'winnerUser' : ''} ${className}`}
      role="region"
      aria-label={`${name}: ${isActive ? "Current turn" : "Waiting"}`}
      aria-current={isActive ? 'true' : 'false'}
    >
      <div className="userDiv">
        {/* Status / Turn Tag */}
        <div className="userTurnIndicator">
          {isActive ? (
            <span className="turnBadge activeBadge">
              <span className="pulseDot" /> Turn
            </span>
          ) : (
            <span className="turnBadge waitingBadge">Waiting</span>
          )}
        </div>

        {/* Avatar Representation */}
        <div className="userWrap">
          <div className="head" />
          <div className="body" />
          <span className="playerSymbolBadge">{player}</span>
        </div>

        {/* Player Info */}
        <div className="userInfo">
          <span className="userName">{name}</span>
          <span className="userScoreMini">{score} {score === 1 ? 'Win' : 'Wins'}</span>
        </div>
      </div>
    </div>
  );
};

export default User;
