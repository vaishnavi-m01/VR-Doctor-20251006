import { useRef, useEffect } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  const lastRenderTime = useRef(0);
  const totalRenderTime = useRef(0);
  const averageRenderTime = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const renderTime = now - startTime.current;
    
    renderCount.current += 1;
    lastRenderTime.current = renderTime;
    totalRenderTime.current += renderTime;
    averageRenderTime.current = totalRenderTime.current / renderCount.current;
    
    // Warn if component is rendering too frequently
    if (renderCount.current > 10) {
      console.warn(`⚠️ ${componentName} rendered ${renderCount.current} times (avg: ${averageRenderTime.current.toFixed(2)}ms)`);
    }
    
    // Reset start time for next render
    startTime.current = now;
  });

  const metrics: PerformanceMetrics = {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
    averageRenderTime: averageRenderTime.current,
    totalRenderTime: totalRenderTime.current,
  };

  return metrics;
};

export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
  });
  
  return renderCount.current;
};

export const useRenderTime = (componentName: string) => {
  const startTime = useRef(Date.now());
  
  useEffect(() => {
    const renderTime = Date.now() - startTime.current;
    console.log(`⏱️ ${componentName} render time: ${renderTime}ms`);
    startTime.current = Date.now();
  });
};
