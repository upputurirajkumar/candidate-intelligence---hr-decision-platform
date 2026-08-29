import React from 'react';

export const FuturisticBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Fine Ambient Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      {/* Top Left Subtle Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      {/* Top Right Subtle Cyan Glow */}
      <div className="absolute top-20 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Bottom Center Soft Glow */}
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
    </div>
  );
};
