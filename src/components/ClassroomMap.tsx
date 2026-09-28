import { Html, Lightformer, OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import { ROOM_SCHEDULES, isFree, type DayName } from "@/lib/rooms";

type ClassroomMapProps = {
  day: DayName;
  start: number;
  end: number;
  activeFloor: number | "all";
  selectedRoom: string | null;
  onSelectRoom: (room: string) => void;
};

type SceneColors = {
  background: string;
  surface: string;
  border: string;
  free: string;
  busy: string;
  selected: string;
  muted: string;
};

const FALLBACK_COLORS: SceneColors = {
  background: "#0d0b12",
  surface: "#27212f",
  border: "#594c66",
  free: "#50d68a",
  busy: "#ec5964",
  selected: "#b264ff",
  muted: "#38313f",
};

function readSceneColors(): SceneColors {
  if (typeof document === "undefined") return FALLBACK_COLORS;
  const rootStyles = getComputedStyle(document.documentElement);
  const resolve = (token: string, fallback: string) => {
    const probe = document.createElement("span");
    probe.style.color = rootStyles.getPropertyValue(token).trim() || fallback;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color || fallback;
  };
  return {
    background: resolve("--background", FALLBACK_COLORS.background),
    surface: resolve("--map-surface", FALLBACK_COLORS.surface),
    border: resolve("--map-border", FALLBACK_COLORS.border),
    free: resolve("--success", FALLBACK_COLORS.free),
    busy: resolve("--destructive", FALLBACK_COLORS.busy),
    selected: resolve("--primary", FALLBACK_COLORS.selected),
    muted: resolve("--muted", FALLBACK_COLORS.muted),
  };
}

function Building({ day, start, end, activeFloor, selectedRoom, onSelectRoom, colors }: ClassroomMapProps & { colors: SceneColors }) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const floors = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    document.body.style.cursor = hoveredRoom ? "pointer" : "default";
    return () => { document.body.style.cursor = "default"; };
  }, [hoveredRoom]);

  return (
    <group position={[0, -4.5, 0]} rotation-y={-0.12}>
      {floors.map((floorNumber) => {
        const rooms = ROOM_SCHEDULES.filter((room) => room.floor === floorNumber);
        const focused = activeFloor === "all" || activeFloor === floorNumber;
        const floorY = floorNumber * 1.25;
        return (
          <group key={floorNumber} position={[focused ? 0 : -0.45, floorY, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[8.8, 0.18, 4.8]} />
              <meshStandardMaterial color={focused ? colors.surface : colors.muted} roughness={0.72} metalness={0.12} transparent opacity={focused ? 1 : 0.46} />
            </mesh>
            <mesh position={[-4.55, 0.28, 0]}>
              <boxGeometry args={[0.12, 0.72, 4.8]} />
              <meshStandardMaterial color={colors.border} transparent opacity={focused ? 0.8 : 0.25} />
            </mesh>
            {rooms.map((room, index) => {
              const available = isFree(room.schedule[day] ?? [], start, end);
              const selected = room.room === selectedRoom;
              const x = -2.75 + (index % 3) * 2.75;
              const z = index < 3 ? 0.25 : -1.45;
              const color = selected ? colors.selected : available ? colors.free : colors.busy;
              return (
                <group key={room.room} position={[x, 0.56, z]}>
                  <mesh
                    castShadow
                    onClick={(event) => { event.stopPropagation(); onSelectRoom(room.room); }}
                    onPointerOver={(event) => { event.stopPropagation(); setHoveredRoom(room.room); }}
                    onPointerOut={() => setHoveredRoom(null)}
                    scale={selected || hoveredRoom === room.room ? 1.08 : 1}
                  >
                    <boxGeometry args={[2.2, 0.8, 1.35]} />
                    <meshStandardMaterial color={color} roughness={0.42} metalness={0.2} emissive={color} emissiveIntensity={selected ? 0.32 : 0.09} transparent opacity={focused ? 1 : 0.18} />
                  </mesh>
                  {(selected || hoveredRoom === room.room) && focused && (
                    <Html position={[0, 0.85, 0]} center distanceFactor={10}>
                      <div className="map-room-label">{room.room}</div>
                    </Html>
                  )}
                </group>
              );
            })}
            <Html position={[5.2, 0.2, 0]} center distanceFactor={12}>
              <div className={`map-floor-label ${focused ? "is-active" : ""}`}>F{floorNumber}</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export default function ClassroomMap(props: ClassroomMapProps) {
  const colors = useMemo(readSceneColors, []);
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [12, 8.5, 14], fov: 38 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={[colors.background]} />
      <fog attach="fog" args={[colors.background, 18, 34]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[7, 14, 8]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Building {...props} colors={colors} />
      <Environment>
        <Lightformer intensity={2.2} position={[0, 12, 3]} scale={[14, 8, 1]} />
        <Lightformer intensity={1.1} color={colors.selected} position={[-9, 4, -3]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} />
      </Environment>
      <OrbitControls makeDefault enablePan={false} minDistance={13} maxDistance={28} minPolarAngle={0.7} maxPolarAngle={1.42} target={[0, 3.8, 0]} />
    </Canvas>
  );
}