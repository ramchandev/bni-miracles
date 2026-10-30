import { Circle, Line, Svg } from "@react-pdf/renderer";

const NODE = "#64748B";
const NODE_SOFT = "#94A3B8";
const EDGE = "#CBD5E1";

type Pt = { x: number; y: number };

/** Grey neural / networking node graph for the roster cover. */
export function NetworkingNodes({ size = 260 }: { size?: number }) {
  const nodes: Pt[] = [
    { x: 130, y: 28 },
    { x: 188, y: 48 },
    { x: 228, y: 98 },
    { x: 242, y: 158 },
    { x: 210, y: 210 },
    { x: 152, y: 238 },
    { x: 88, y: 228 },
    { x: 42, y: 178 },
    { x: 32, y: 118 },
    { x: 58, y: 62 },
    { x: 108, y: 98 },
    { x: 168, y: 118 },
    { x: 148, y: 168 },
    { x: 98, y: 158 },
    { x: 130, y: 130 },
    { x: 190, y: 160 },
    { x: 70, y: 130 },
    { x: 160, y: 70 },
    { x: 100, y: 200 },
    { x: 200, y: 80 },
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
    [0, 17], [1, 19], [2, 11], [3, 15], [4, 5], [5, 18], [6, 13], [7, 16], [8, 10], [9, 10],
    [14, 10], [14, 11], [14, 12], [14, 13], [14, 15], [14, 16], [14, 17], [14, 18], [14, 19],
    [10, 13], [11, 15], [12, 18], [13, 16], [10, 17], [11, 19], [12, 15], [16, 18],
    [0, 14], [3, 14], [6, 14], [9, 14],
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 260 260">
      {edges.map(([a, b], i) => (
        <Line
          key={`e-${i}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={EDGE}
          strokeWidth={1}
        />
      ))}
      {nodes.map((n, i) => {
        const hub = i === 14;
        return (
          <Circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={hub ? 6 : i % 4 === 0 ? 4.2 : 3.2}
            fill={hub ? NODE : "#FFFFFF"}
            stroke={hub ? NODE : NODE_SOFT}
            strokeWidth={1.4}
          />
        );
      })}
    </Svg>
  );
}
