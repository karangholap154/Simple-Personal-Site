const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Generate mock contribution data
const generateContributions = () => {
  const contributions: number[][] = [];
  for (let week = 0; week < 52; week++) {
    const weekData: number[] = [];
    for (let day = 0; day < 7; day++) {
      // Random contribution level (0-4)
      const rand = Math.random();
      if (rand < 0.3) weekData.push(0);
      else if (rand < 0.5) weekData.push(1);
      else if (rand < 0.7) weekData.push(2);
      else if (rand < 0.85) weekData.push(3);
      else weekData.push(4);
    }
    contributions.push(weekData);
  }
  return contributions;
};

const contributions = generateContributions();

const GitHubContributions = () => {
  const getColor = (level: number) => {
    switch (level) {
      case 0: return "bg-contribution-0";
      case 1: return "bg-contribution-1";
      case 2: return "bg-contribution-2";
      case 3: return "bg-contribution-3";
      case 4: return "bg-contribution-4";
      default: return "bg-contribution-0";
    }
  };

  // Calculate week positions for each month (52 weeks / 12 months ≈ 4.33 weeks per month)
  const getMonthPositions = () => {
    const positions: { month: string; startWeek: number }[] = [];
    const weeksPerMonth = 52 / 12;
    
    months.forEach((month, index) => {
      positions.push({
        month,
        startWeek: Math.floor(index * weeksPerMonth),
      });
    });
    
    return positions;
  };

  const monthPositions = getMonthPositions();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">GitHub Contributions</h2>
      
      <div className="overflow-x-auto scrollbar-none">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="relative h-5 mb-2">
            {monthPositions.map((pos, i) => (
              <span 
                key={i} 
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${pos.startWeek * 14}px` }}
              >
                {pos.month}
              </span>
            ))}
          </div>
          
          {/* Contribution grid */}
          <div className="flex gap-[3px]">
            {contributions.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((level, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-[11px] h-[11px] rounded-sm ${getColor(level)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="flex gap-[3px]">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-[11px] h-[11px] rounded-sm ${getColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default GitHubContributions;
