import './Board.css';

const Board = ({ board = Array(9).fill(null), onCellClick, turn = 'X', winningLine = [], isGameOver = false }) => {
  return (
    <div className="board" role="region" aria-label="Tic Tac Toe Board">
      <div className="boxWrapper">
        {board.map((cell, index) => {
          const isWinningCell = Array.isArray(winningLine) && winningLine.includes(index);
          const isClickable = !cell && !isGameOver;

          return (
            <div
              key={index}
              id={String(index)}
              className={`box ${cell === 'X' ? 'userOne' : ''} ${cell === 'O' ? 'userTwo' : ''} ${isWinningCell ? 'winningBox' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => onCellClick && onCellClick(index)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
                  e.preventDefault();
                  onCellClick && onCellClick(index);
                }
              }}
              role="button"
              tabIndex={isClickable ? 0 : -1}
              aria-label={`Cell ${index + 1}: ${cell ? `Filled with ${cell}` : 'Empty'}`}
            >
              {cell ? (
                <span className={`cellSymbol ${cell === 'X' ? 'symbolX' : 'symbolO'}`}>
                  {cell}
                </span>
              ) : isClickable ? (
                <span className="ghostSymbol">{turn}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
