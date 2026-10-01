import React from 'react';

const OccupancyDots = ({ totalBeds = 0, occupiedBeds = 0 }) => {
  const dots = [];
  for (let i = 0; i < totalBeds; i++) {
    const isOccupied = i < occupiedBeds;
    dots.push(
      <span
        key={i}
        title={isOccupied ? 'Occupied Bed' : 'Available Bed'}
        className={`dot-bed ${isOccupied ? 'occupied' : 'available'}`}
      />
    );
  }

  return (
    <div className="occupancy-dots" aria-label={`${occupiedBeds} of ${totalBeds} beds occupied`}>
      {dots}
    </div>
  );
};

export default OccupancyDots;
