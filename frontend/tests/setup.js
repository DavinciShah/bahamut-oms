import '@testing-library/jest-dom';

// Mock canvas API not available in jsdom
HTMLCanvasElement.prototype.getContext = () => null;
