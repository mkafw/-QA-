
export interface HelixPoint {
  x: number;
  y: number;
  z: number;
}

export const HELIX_CONSTANTS = {
  TILT: 0.3, // 3D Tilt perspective
  AMP_LIMIT: 140, // Max amplitude
  FREQ_CYCLES: 2.5, // How many full twists visible
};

/**
 * Pure function to calculate a 3D point on the DNA Helix
 */
export const calculateHelixPoint = (
  yBase: number,
  strand: 'A' | 'B',
  rotation: number,
  width: number,
  startY: number,
  helixHeight: number
): HelixPoint => {
  const freq = (5 * Math.PI) / helixHeight; // 2.5 cycles fixed
  const amp = Math.min(width * 0.2, HELIX_CONSTANTS.AMP_LIMIT);
  
  // Calculate Angle
  const angle = (yBase - startY) * freq + rotation + (strand === 'B' ? Math.PI : 0);
  
  // 3D Projection
  const x = (width / 2) + amp * Math.sin(angle);
  const z = Math.cos(angle);
  
  // Apply Tilt: Y position shifts based on depth (Z)
  const y = yBase + (z * amp * HELIX_CONSTANTS.TILT);

  return { x, y, z };
};

/**
 * Calculate dynamic helix dimensions based on container and data size
 */
export const calculateHelixDimensions = (containerHeight: number, dataCount: number) => {
  const nodeSpacing = 60; // Breathing room
  // Helix grows if data exceeds screen
  const calculatedHeight = Math.max(containerHeight * 0.8, dataCount * nodeSpacing);
  const startY = (containerHeight - calculatedHeight) / 2;
  
  return { height: calculatedHeight, startY };
};
