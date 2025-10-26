import React, { useState, useRef, useCallback } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialRatio?: number; // 0-1, where 0.5 = 50/50 split
  minLeftSize?: number; // pixels
  minRightSize?: number; // pixels
}

const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  initialRatio = 0.4,
  minLeftSize = 200,
  minRightSize = 200,
}) => {
  const [ratio, setRatio] = useState(initialRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const maxWidth = rect.width;

      // Calculate new ratio with minimum sizes
      const newRatio = Math.max(
        minLeftSize / maxWidth,
        Math.min((maxWidth - minRightSize) / maxWidth, newX / maxWidth)
      );

      setRatio(newRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minLeftSize, minRightSize]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full"
      style={{ userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* Left Pane */}
      <div
        className="overflow-hidden"
        style={{
          width: `${ratio * 100}%`,
          minWidth: `${minLeftSize}px`,
        }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-slate-300 dark:bg-slate-700 hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors ${
          isDragging ? 'bg-blue-500 cursor-col-resize' : 'cursor-col-resize'
        }`}
        style={{
          userSelect: 'none',
        }}
      />

      {/* Right Pane */}
      <div
        className="overflow-hidden flex-1"
        style={{
          minWidth: `${minRightSize}px`,
        }}
      >
        {right}
      </div>
    </div>
  );
};

export default SplitPane;
