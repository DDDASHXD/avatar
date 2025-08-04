import color from "tinycolor2";
import easyMeshGradient from "easy-mesh-gradient";

async function hash(str: string): Promise<number> {
  let sum = 0;
  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(str)
  );
  for (const n of new Uint8Array(buffer)) {
    sum += n;
  }
  return sum;
}

async function hue(str: string): Promise<number> {
  const n = await hash(str);
  return n % 360;
}

interface MeshGradientPoint {
  x: number;
  y: number;
  h: number;
  s: number;
  l: number;
  scale: number;
  color: string;
}

export async function generateGradient(username: string) {
  const baseHue = await hue(username);
  
  // Generate mesh gradient with username as seed for reproducible results
  const meshGradientCSS = easyMeshGradient({
    seed: username,
    pointCount: 4,
    hueRange: [baseHue - 60, baseHue + 60], // Limit hue range around the base hue
    saturationRange: [0.7, 1],
    lightnessRange: [0.4, 0.8],
    scaleRange: [0.8, 1.5],
    easingStops: 15
  });

  // Extract the radial gradients from the CSS string for SVG conversion
  const gradientMatches = meshGradientCSS.match(/radial-gradient\([^)]+\)/g) || [];
  
  // Generate mesh points for SVG rendering
  const meshPoints: MeshGradientPoint[] = [];
  
  // Create some points based on the username hash for consistent generation
  const pointCount = 4;
  for (let i = 0; i < pointCount; i++) {
    const pointHash = await hash(username + i);
    const x = (pointHash % 100) / 100;
    const y = ((pointHash >> 8) % 100) / 100;
    const h = baseHue + ((pointHash >> 16) % 120) - 60; // ±60 degrees from base hue
    const s = 0.7 + ((pointHash >> 24) % 30) / 100; // 0.7-1.0
    const l = 0.4 + ((pointHash >> 32) % 40) / 100; // 0.4-0.8
    const scale = 0.8 + ((pointHash >> 40) % 70) / 100; // 0.8-1.5
    
    const pointColor = color({ h, s, l });
    
    meshPoints.push({
      x,
      y,
      h,
      s,
      l,
      scale,
      color: pointColor.toHexString()
    });
  }

  // Fallback to original linear gradient approach for simpler cases
  const h = await hue(username);
  const c1 = color({ h, s: 0.95, l: 0.5 });
  const second = c1.triad()[1].toHexString();

  return {
    fromColor: c1.toHexString(),
    toColor: second,
    meshGradientCSS,
    meshPoints
  };
}
