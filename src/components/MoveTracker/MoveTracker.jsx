import { useEffect, useRef } from 'react';
import './MoveTracker.css';

const MoveTracker = ({ history = [] }) => {
  const listEndRef = useRef(null);

  // Auto scroll to bottom when new moves are added
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [history.length]);

  return (
    <div className="moveTrackerCard" role="region" aria-label="Move History Tracker">
      <div className="trackerHeader">
        <div className="trackerTitleWrap">
          <span className="trackerIcon">⏱</span>
          <h2 className="trackerTitle">Move History</h2>
        </div>
        <span className="moveCountBadge">
          {history.length} {history.length === 1 ? 'Move' : 'Moves'}
        </span>
      </div>

      <div className="moveListContainer">
        {history.length === 0 ? (
          <div className="emptyMoveState">
            <span className="emptyIcon">🎯</span>
            <p className="emptyTitle">No moves yet</p>
            <p className="emptySubtext">Click any cell to start tracking turns and positions</p>
          </div>
        ) : (
          <ul className="moveList" aria-label="List of moves">
            {history.map((move, idx) => {
              const isLatest = idx === history.length - 1;
              return (
                <li
                  key={`${move.moveNumber}-${move.index}`}
                  className={`moveItem ${isLatest ? 'latestMove' : ''} ${move.player === 'X' ? 'moveItemX' : 'moveItemO'}`}
                >
                  <div className="moveNumCol">
                    <span className="moveNumBadge">#{move.moveNumber}</span>
                  </div>

                  <div className="movePlayerCol">
                    <span className={`playerTag ${move.player === 'X' ? 'playerTagX' : 'playerTagO'}`}>
                      {move.player}
                    </span>
                  </div>

                  <div className="moveDetailsCol">
                    <div className="moveCoord">
                      Row <span className="coordVal">{move.row}</span>, Col <span className="coordVal">{move.col}</span>
                    </div>
                    <div className="movePositionLabel">{move.positionLabel} (Cell #{move.index})</div>
                  </div>

                  {isLatest && (
                    <span className="latestPill">Latest</span>
                  )}
                </li>
              );
            })}
            <div ref={listEndRef} />
          </ul>
        )}
      </div>
    </div>
  );
};

export default MoveTracker;
