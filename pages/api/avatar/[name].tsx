import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { renderToReadableStream } from "react-dom/server";
import { generateGradient } from "../../../utils/gradient";

export const runtime = "edge";

export default async function handler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name");
  const text = searchParams.get("text");
  const size = Number(searchParams.get("size") || "120");
  const rounded = Number(searchParams.get("rounded") || "0");

  const [username, type] = name?.split(".") || [];
  const fileType = type?.includes("svg") ? "svg" : "png";

  const gradient = await generateGradient(username || `${Math.random()}`);

  const avatar = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <defs>
          {/* Create radial gradients for each mesh point */}
          {gradient.meshPoints.map((point, index) => (
            <radialGradient
              key={index}
              id={`meshGradient${index}`}
              cx={point.x}
              cy={point.y}
              r={point.scale * 0.7}
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={point.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={point.color} stopOpacity="0" />
            </radialGradient>
          ))}
          
          {/* Fallback linear gradient */}
          <linearGradient id="fallbackGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient.fromColor} />
            <stop offset="100%" stopColor={gradient.toColor} />
          </linearGradient>
        </defs>
        
        {/* Base background with fallback gradient */}
        <rect
          fill="url(#fallbackGradient)"
          x="0"
          y="0"
          width={size}
          height={size}
          rx={rounded}
          ry={rounded}
        />
        
        {/* Layer mesh gradient points */}
        {gradient.meshPoints.map((point, index) => (
          <rect
            key={index}
            fill={`url(#meshGradient${index})`}
            x="0"
            y="0"
            width={size}
            height={size}
            rx={rounded}
            ry={rounded}
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
        
        {fileType === "svg" && !!text ? (
          <text
            x="50%"
            y="50%"
            alignmentBaseline="central"
            dominantBaseline="central"
            textAnchor="middle"
            fill="#fff"
            fontFamily="sans-serif"
            fontSize={(size * 0.9) / text.length}
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
          >
            {text}
          </text>
        ) : null}
      </g>
    </svg>
  );

  if (fileType === "svg") {
    const stream = await renderToReadableStream(avatar);
    return new Response(stream, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, immutable"
      }
    });
  }

  return new ImageResponse(avatar, {
    width: size,
    height: size
  });
}
