"use client";

import { useMemo, useState, useEffect } from "react";
import { useAmbient } from "@/lib/contexts/ambient-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";
import type { TimePeriod } from "@/lib/hooks/useTimePeriod";
import type { WeatherMode } from "@/lib/hooks/useWeather";

/* =============================================
   REALTIME CELESTIAL POSITION HOOK
   Calculates sun/moon position based on current time
   Sun visible: ~5:00 to ~20:00
   Moon visible: ~19:00 to ~6:00
   ============================================= */
function useCelestialPosition() {
  const [position, setPosition] = useState(() => calculatePosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(calculatePosition());
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return position;
}

function calculatePosition() {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;

  // Sun arc: rises at 6:00, peaks at 12:00, sets at 18:00
  const sunRise = 6;
  const sunSet = 18;
  const sunDuration = sunSet - sunRise; // 12 hours
  const sunProgress = Math.max(0, Math.min(1, (hours - sunRise) / sunDuration));
  const sunVisible = hours >= sunRise && hours <= sunSet;

  // Sun follows a parabolic arc
  // x: 10% -> 90% (left to right)
  // y: starts at 85% (horizon), peaks at 8% (top), back to 85%
  const sunX = 10 + sunProgress * 80;
  const sunY = sunVisible
    ? 85 - 77 * Math.sin(sunProgress * Math.PI)
    : 100;

  // Moon arc: rises at 18:00, peaks at ~0:00, sets at 6:00
  // Handle the midnight wrap-around
  const moonRise = 18;
  const moonSet = 6;
  const moonDuration = 12; // 18:00 to 06:00 = 12 hours
  let moonHours = -1;
  if (hours >= moonRise) {
    moonHours = hours - moonRise;
  } else if (hours <= moonSet) {
    moonHours = hours + (24 - moonRise);
  }
  const moonProgress = moonHours >= 0 ? Math.max(0, Math.min(1, moonHours / moonDuration)) : -1;
  const moonVisible = moonProgress >= 0 && moonProgress <= 1;

  const moonX = moonVisible ? 85 - moonProgress * 75 : -20; // right to left
  const moonY = moonVisible
    ? 80 - 70 * Math.sin(moonProgress * Math.PI)
    : 100;

  return {
    sunX,
    sunY,
    sunVisible,
    sunProgress,
    moonX,
    moonY,
    moonVisible,
    moonProgress,
    hours,
  };
}

/* =============================================
   FLYING BIRDS - Shared across time scenes
   ============================================= */
function FlyingBirds({ count = 6, color = "rgba(0,0,0,0.4)" }: { count?: number; color?: string }) {
  const birds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: `${8 + Math.random() * 30}%`,
        animationDuration: `${12 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 15}s`,
        scale: 0.5 + Math.random() * 0.6,
        yOffset: -15 + Math.random() * 30,
      })),
    [count]
  );

  return (
    <>
      {birds.map((bird) => (
        <div
          key={bird.id}
          className="absolute scene-bird-fly-across"
          style={{
            top: bird.top,
            animationDuration: bird.animationDuration,
            animationDelay: bird.animationDelay,
            transform: `scale(${bird.scale})`,
            // @ts-expect-error CSS custom property for vertical wobble
            "--bird-y-offset": `${bird.yOffset}px`,
          }}
        >
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <path
              d="M0 6 Q4 1 8 5 Q10 3 12 6 Q14 3 16 5 Q20 1 24 6"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
              className="scene-bird-wing-flap"
            />
          </svg>
        </div>
      ))}
    </>
  );
}

/* =============================================
   DAWN SCENE - Sunrise with rising sun,
   warm horizon, birds, morning mist
   ============================================= */
function DawnScene() {
  const { sunX, sunY } = useCelestialPosition();

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient - warm sunrise */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#e94560] via-[60%] to-[#f5af19]" />

      {/* Horizon glow - follows sun X */}
      <div
        className="absolute bottom-[25%] w-[150%] h-[40%] bg-gradient-to-t from-[#f5af19]/60 via-[#f5af19]/20 to-transparent rounded-[50%] blur-xl transition-all duration-[30000ms]"
        style={{ left: `${sunX - 75}%` }}
      />

      {/* Realtime sun position */}
      <div
        className="absolute transition-all duration-[30000ms] ease-linear"
        style={{ left: `${sunX}%`, bottom: `${100 - sunY}%`, transform: "translate(-50%, 50%)" }}
      >
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-b from-[#fff7ae] to-[#f5af19] shadow-[0_0_80px_rgba(245,175,25,0.6),0_0_160px_rgba(245,175,25,0.3)]" />
      </div>

      {/* Sun rays around sun */}
      <div
        className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] scene-sun-rays transition-all duration-[30000ms] ease-linear"
        style={{ left: `${sunX}%`, bottom: `${100 - sunY}%`, transform: "translate(-50%, 50%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5af19]/20 via-transparent to-transparent rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5af19]/10 to-transparent rounded-full" />
      </div>

      {/* Clouds */}
      <div className="absolute top-[12%] scene-cloud-drift" style={{ animationDuration: "35s" }}>
        <div className="w-40 h-12 bg-[#f8cdda]/20 rounded-full blur-md" />
      </div>
      <div className="absolute top-[18%] scene-cloud-drift" style={{ animationDuration: "45s", animationDelay: "10s" }}>
        <div className="w-56 h-14 bg-[#f8cdda]/15 rounded-full blur-lg" />
      </div>
      <div className="absolute top-[8%] scene-cloud-drift" style={{ animationDuration: "50s", animationDelay: "20s" }}>
        <div className="w-48 h-10 bg-white/10 rounded-full blur-md" />
      </div>

      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(10,10,30,0.7)" d="M0,320 L0,200 Q180,80 360,180 Q480,100 600,160 Q720,60 900,140 Q1050,40 1200,120 Q1320,80 1440,160 L1440,320 Z" />
          <path fill="rgba(10,10,30,0.5)" d="M0,320 L0,240 Q200,160 400,220 Q550,140 720,200 Q900,120 1080,190 Q1250,130 1440,200 L1440,320 Z" />
        </svg>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-[#0a0a1e] to-transparent" />

      {/* Morning mist */}
      <div className="absolute bottom-[10%] left-0 right-0 h-[15%] bg-gradient-to-t from-white/5 via-white/3 to-transparent blur-sm" />

      {/* Birds flying */}
      <FlyingBirds count={7} color="rgba(0,0,0,0.5)" />
    </div>
  );
}

/* =============================================
   DAY SCENE - Bright blue sky, fluffy clouds,
   sun high, green landscape, butterflies + birds
   ============================================= */
function DayScene() {
  const { sunX, sunY } = useCelestialPosition();

  const butterflies = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        left: `${20 + Math.random() * 60}%`,
        top: `${40 + Math.random() * 30}%`,
        animationDuration: `${6 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 3}s`,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient - bright blue */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f] via-[#2980b9] to-[#87ceeb]" />

      {/* Realtime sun position */}
      <div
        className="absolute transition-all duration-[30000ms] ease-linear"
        style={{ left: `${sunX}%`, top: `${sunY}%`, transform: "translate(-50%, -50%)" }}
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-[#fff9c4] to-[#ffd54f] shadow-[0_0_60px_rgba(255,213,79,0.5),0_0_120px_rgba(255,213,79,0.2)] scene-sun-pulse" />
      </div>

      {/* Sun haze - follows sun */}
      <div
        className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-[#ffd54f]/15 to-transparent blur-2xl scene-sun-pulse transition-all duration-[30000ms] ease-linear"
        style={{ left: `${sunX}%`, top: `${sunY}%`, transform: "translate(-50%, -50%)" }}
      />

      {/* Fluffy clouds */}
      <div className="absolute top-[15%] scene-cloud-drift" style={{ animationDuration: "40s" }}>
        <div className="relative">
          <div className="w-32 h-10 bg-white/30 rounded-full blur-sm" />
          <div className="absolute -top-3 left-6 w-20 h-10 bg-white/25 rounded-full blur-sm" />
          <div className="absolute -top-1 left-16 w-16 h-8 bg-white/20 rounded-full blur-sm" />
        </div>
      </div>
      <div className="absolute top-[25%] scene-cloud-drift" style={{ animationDuration: "55s", animationDelay: "15s" }}>
        <div className="relative">
          <div className="w-40 h-12 bg-white/25 rounded-full blur-sm" />
          <div className="absolute -top-4 left-8 w-24 h-12 bg-white/20 rounded-full blur-sm" />
        </div>
      </div>
      <div className="absolute top-[10%] scene-cloud-drift" style={{ animationDuration: "60s", animationDelay: "30s" }}>
        <div className="w-28 h-8 bg-white/20 rounded-full blur-sm" />
      </div>

      {/* Rolling hills */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(34,139,34,0.4)" d="M0,320 L0,220 Q200,140 400,200 Q600,120 800,180 Q1000,100 1200,170 Q1350,140 1440,180 L1440,320 Z" />
          <path fill="rgba(34,139,34,0.6)" d="M0,320 L0,250 Q180,180 360,230 Q540,160 720,220 Q900,160 1100,210 Q1300,170 1440,220 L1440,320 Z" />
          <path fill="rgba(25,100,25,0.7)" d="M0,320 L0,270 Q240,220 480,260 Q720,210 960,250 Q1200,220 1440,260 L1440,320 Z" />
        </svg>
      </div>

      {/* Trees on hillside */}
      <div className="absolute bottom-[18%] left-[10%] w-6 h-12 scene-tree">
        <div className="w-6 h-8 bg-[#1a6b1a]/60 rounded-full" />
        <div className="w-1.5 h-4 bg-[#3d2b1f]/40 mx-auto" />
      </div>
      <div className="absolute bottom-[20%] left-[25%] w-8 h-14 scene-tree">
        <div className="w-8 h-10 bg-[#1a6b1a]/50 rounded-full" />
        <div className="w-1.5 h-4 bg-[#3d2b1f]/40 mx-auto" />
      </div>
      <div className="absolute bottom-[16%] right-[20%] w-7 h-12 scene-tree">
        <div className="w-7 h-9 bg-[#1a6b1a]/55 rounded-full" />
        <div className="w-1.5 h-3 bg-[#3d2b1f]/40 mx-auto" />
      </div>

      {/* Butterflies */}
      {butterflies.map((b) => (
        <div
          key={b.id}
          className="absolute scene-butterfly"
          style={{
            left: b.left,
            top: b.top,
            animationDuration: b.animationDuration,
            animationDelay: b.animationDelay,
          }}
        >
          <div className="w-3 h-3 bg-[#ffd54f]/40 rounded-full blur-[1px]" />
        </div>
      ))}

      {/* Birds flying across */}
      <FlyingBirds count={5} color="rgba(0,0,0,0.35)" />
    </div>
  );
}

/* =============================================
   DUSK SCENE - Warm sunset, purple-orange sky,
   setting sun, silhouette landscape
   ============================================= */
function DuskScene() {
  const { sunX, sunY } = useCelestialPosition();

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient - warm sunset */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b69] via-[#c84b31] via-[55%] to-[#f3722c]" />

      {/* Realtime setting sun */}
      <div
        className="absolute transition-all duration-[30000ms] ease-linear"
        style={{ left: `${sunX}%`, bottom: `${100 - sunY}%`, transform: "translate(-50%, 50%)" }}
      >
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-b from-[#ff6b6b] to-[#ee5a24] shadow-[0_0_100px_rgba(238,90,36,0.6),0_0_200px_rgba(238,90,36,0.3)]" />
      </div>

      {/* Sun reflection on horizon */}
      <div
        className="absolute w-[300px] h-[60px] bg-gradient-to-t from-[#ff6b6b]/30 to-transparent rounded-full blur-xl transition-all duration-[30000ms] ease-linear"
        style={{ left: `${sunX - 10}%`, bottom: "15%" }}
      />

      {/* Wispy clouds lit by sunset */}
      <div className="absolute top-[20%] scene-cloud-drift" style={{ animationDuration: "50s" }}>
        <div className="w-48 h-6 bg-gradient-to-r from-[#ff6b6b]/20 via-[#c84b31]/15 to-transparent rounded-full blur-sm" />
      </div>
      <div className="absolute top-[30%] scene-cloud-drift" style={{ animationDuration: "60s", animationDelay: "8s" }}>
        <div className="w-64 h-8 bg-gradient-to-r from-[#f3722c]/15 via-[#ff6b6b]/10 to-transparent rounded-full blur-md" />
      </div>
      <div className="absolute top-[15%] scene-cloud-drift" style={{ animationDuration: "55s", animationDelay: "20s" }}>
        <div className="w-36 h-5 bg-[#c84b31]/15 rounded-full blur-sm" />
      </div>

      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(20,10,40,0.8)" d="M0,320 L0,180 Q150,80 350,150 Q500,40 700,120 Q850,30 1050,100 Q1200,50 1440,140 L1440,320 Z" />
          <path fill="rgba(20,10,40,0.9)" d="M0,320 L0,230 Q200,150 400,210 Q600,130 800,190 Q1000,120 1200,180 Q1350,150 1440,200 L1440,320 Z" />
        </svg>
      </div>

      {/* Foreground silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-[#140a28]" />

      {/* Birds flying home - silhouette */}
      <FlyingBirds count={8} color="rgba(10,5,20,0.6)" />
    </div>
  );
}

/* =============================================
   NIGHT SCENE - Starry sky, moon, fireflies,
   silhouette trees, calm dark landscape
   ============================================= */
function NightScene() {
  const { moonX, moonY, moonVisible } = useCelestialPosition();

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 55}%`,
        size: `${1 + Math.random() * 2}px`,
        animationDelay: `${Math.random() * 4}s`,
        opacity: 0.3 + Math.random() * 0.7,
      })),
    []
  );

  const fireflies = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${10 + Math.random() * 80}%`,
        top: `${50 + Math.random() * 30}%`,
        animationDuration: `${3 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 3}s`,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient - deep night */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a23] via-[#141432] to-[#1a1a3e]" />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white scene-star-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.animationDelay,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Realtime moon position */}
      {moonVisible && (
        <>
          <div
            className="absolute transition-all duration-[30000ms] ease-linear"
            style={{ left: `${moonX}%`, top: `${moonY}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-[#f5f5dc] to-[#e8e8c8] shadow-[0_0_40px_rgba(245,245,220,0.3),0_0_80px_rgba(245,245,220,0.15)]" />
            {/* Moon craters */}
            <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-[#d4d4a8]/30" />
            <div className="absolute top-7 right-4 w-2 h-2 rounded-full bg-[#d4d4a8]/20" />
            <div className="absolute bottom-4 left-6 w-2.5 h-2.5 rounded-full bg-[#d4d4a8]/25" />
          </div>

          {/* Moon glow */}
          <div
            className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-b from-[#f5f5dc]/10 to-transparent blur-2xl transition-all duration-[30000ms] ease-linear"
            style={{ left: `${moonX}%`, top: `${moonY}%`, transform: "translate(-50%, -50%)" }}
          />
        </>
      )}

      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(10,10,20,0.6)" d="M0,320 L0,200 Q180,100 360,170 Q540,60 720,140 Q900,50 1100,120 Q1280,70 1440,150 L1440,320 Z" />
          <path fill="rgba(10,10,20,0.8)" d="M0,320 L0,240 Q200,160 400,220 Q600,140 800,200 Q1000,140 1200,190 Q1350,160 1440,210 L1440,320 Z" />
        </svg>
      </div>

      {/* Tree silhouettes */}
      <div className="absolute bottom-[12%] left-[5%]">
        <svg width="30" height="50" viewBox="0 0 30 50" fill="rgba(5,5,15,0.9)">
          <path d="M15,0 L25,20 L20,18 L28,35 L22,32 L15,50 L8,32 L2,35 L10,18 L5,20 Z" />
        </svg>
      </div>
      <div className="absolute bottom-[14%] left-[12%]">
        <svg width="24" height="40" viewBox="0 0 30 50" fill="rgba(5,5,15,0.85)">
          <path d="M15,0 L25,20 L20,18 L28,35 L22,32 L15,50 L8,32 L2,35 L10,18 L5,20 Z" />
        </svg>
      </div>
      <div className="absolute bottom-[10%] right-[8%]">
        <svg width="28" height="45" viewBox="0 0 30 50" fill="rgba(5,5,15,0.88)">
          <path d="M15,0 L25,20 L20,18 L28,35 L22,32 L15,50 L8,32 L2,35 L10,18 L5,20 Z" />
        </svg>
      </div>
      <div className="absolute bottom-[13%] right-[15%]">
        <svg width="22" height="38" viewBox="0 0 30 50" fill="rgba(5,5,15,0.82)">
          <path d="M15,0 L25,20 L20,18 L28,35 L22,32 L15,50 L8,32 L2,35 L10,18 L5,20 Z" />
        </svg>
      </div>

      {/* Foreground */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-t from-[#050510] to-transparent" />

      {/* Fireflies */}
      {fireflies.map((fly) => (
        <div
          key={fly.id}
          className="absolute scene-firefly"
          style={{
            left: fly.left,
            top: fly.top,
            animationDuration: fly.animationDuration,
            animationDelay: fly.animationDelay,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#f5f5a0] shadow-[0_0_6px_rgba(245,245,160,0.8)]" />
        </div>
      ))}
    </div>
  );
}

/* =============================================
   WEATHER SCENES
   ============================================= */

function RainScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Overcast sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#2c3e50] to-[#34495e]" />

      {/* Heavy clouds */}
      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-[#1a2332] via-[#2c3e50]/80 to-transparent" />
      <div className="absolute top-[5%] scene-cloud-drift" style={{ animationDuration: "30s" }}>
        <div className="w-64 h-16 bg-[#34495e]/50 rounded-full blur-lg" />
      </div>
      <div className="absolute top-[10%] scene-cloud-drift" style={{ animationDuration: "38s", animationDelay: "5s" }}>
        <div className="w-48 h-14 bg-[#2c3e50]/40 rounded-full blur-lg" />
      </div>

      {/* Distant landscape - muted */}
      <div className="absolute bottom-0 left-0 right-0 h-[25%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(20,40,30,0.5)" d="M0,320 L0,230 Q300,170 600,220 Q900,150 1200,200 Q1380,180 1440,210 L1440,320 Z" />
          <path fill="rgba(15,30,25,0.7)" d="M0,320 L0,260 Q250,210 500,250 Q750,200 1000,240 Q1250,210 1440,250 L1440,320 Z" />
        </svg>
      </div>

      {/* Puddle reflections */}
      <div className="absolute bottom-[3%] left-[20%] w-32 h-4 bg-[#4a6fa5]/15 rounded-full blur-sm" />
      <div className="absolute bottom-[5%] right-[25%] w-24 h-3 bg-[#4a6fa5]/10 rounded-full blur-sm" />

      <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-gradient-to-t from-[#141e28] to-transparent" />
    </div>
  );
}

function SunnyScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Bright warm sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3050] via-[#2980b9] to-[#87ceeb]" />

      {/* Brilliant sun */}
      <div className="absolute top-[6%] right-[18%]">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-white to-[#ffd54f] shadow-[0_0_80px_rgba(255,213,79,0.6),0_0_160px_rgba(255,213,79,0.3),0_0_240px_rgba(255,213,79,0.1)] scene-sun-pulse" />
      </div>

      {/* Sun haze */}
      <div className="absolute top-[2%] right-[12%] w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-b from-[#ffd54f]/15 to-transparent blur-3xl" />

      {/* Scattered fair-weather clouds */}
      <div className="absolute top-[20%] scene-cloud-drift" style={{ animationDuration: "50s" }}>
        <div className="w-28 h-8 bg-white/20 rounded-full blur-sm" />
      </div>

      {/* Lush green hills */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(46,160,67,0.35)" d="M0,320 L0,210 Q300,130 600,190 Q900,110 1200,170 Q1380,140 1440,180 L1440,320 Z" />
          <path fill="rgba(34,139,34,0.5)" d="M0,320 L0,250 Q250,180 500,230 Q750,170 1000,220 Q1250,190 1440,240 L1440,320 Z" />
          <path fill="rgba(25,110,25,0.6)" d="M0,320 L0,275 Q300,230 600,265 Q900,225 1200,260 Q1380,245 1440,270 L1440,320 Z" />
        </svg>
      </div>

      {/* Flowers on ground */}
      <div className="absolute bottom-[12%] left-[15%] w-2 h-2 rounded-full bg-[#ff6b6b]/30" />
      <div className="absolute bottom-[14%] left-[35%] w-2 h-2 rounded-full bg-[#ffd54f]/30" />
      <div className="absolute bottom-[11%] right-[30%] w-2 h-2 rounded-full bg-[#c084fc]/25" />
      <div className="absolute bottom-[13%] right-[18%] w-1.5 h-1.5 rounded-full bg-[#ff6b6b]/25" />

      <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-gradient-to-t from-[#194e19]/50 to-transparent" />

      {/* Birds */}
      <FlyingBirds count={4} color="rgba(0,0,0,0.3)" />
    </div>
  );
}

function SnowyScene() {
  const snowdrifts = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        left: `${i * 35 + Math.random() * 10}%`,
        width: `${80 + Math.random() * 60}px`,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Winter sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1b2d] via-[#1e3050] to-[#3a5a7c]" />

      {/* Pale winter sun behind clouds */}
      <div className="absolute top-[15%] left-[40%] w-32 h-32 rounded-full bg-gradient-to-b from-white/8 to-transparent blur-2xl" />

      {/* Heavy winter clouds */}
      <div className="absolute top-[5%] scene-cloud-drift" style={{ animationDuration: "40s" }}>
        <div className="w-60 h-16 bg-[#4a6a8a]/30 rounded-full blur-lg" />
      </div>
      <div className="absolute top-[12%] scene-cloud-drift" style={{ animationDuration: "50s", animationDelay: "12s" }}>
        <div className="w-48 h-12 bg-[#3a5a7c]/25 rounded-full blur-lg" />
      </div>

      {/* Snow-covered hills */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(200,210,225,0.3)" d="M0,320 L0,200 Q250,120 500,180 Q750,100 1000,160 Q1250,110 1440,170 L1440,320 Z" />
          <path fill="rgba(210,220,235,0.5)" d="M0,320 L0,240 Q200,170 400,220 Q650,150 900,210 Q1150,160 1440,220 L1440,320 Z" />
          <path fill="rgba(220,230,245,0.6)" d="M0,320 L0,270 Q300,230 600,260 Q900,220 1200,255 Q1380,240 1440,265 L1440,320 Z" />
        </svg>
      </div>

      {/* Snow-covered trees */}
      <div className="absolute bottom-[16%] left-[8%]">
        <svg width="24" height="40" viewBox="0 0 30 50" fill="rgba(200,215,230,0.5)">
          <path d="M15,0 L25,20 L20,18 L28,35 L22,32 L15,50 L8,32 L2,35 L10,18 L5,20 Z" />
        </svg>
      </div>
      <div className="absolute bottom-[18%] right-[12%]">
        <svg width="20" height="35" viewBox="0 0 30 50" fill="rgba(200,215,230,0.45)">
          <path d="M15,0 L25,20 L20,18 L28,35 L22,32 L15,50 L8,32 L2,35 L10,18 L5,20 Z" />
        </svg>
      </div>

      {/* Snow drifts on ground */}
      {snowdrifts.map((drift) => (
        <div
          key={drift.id}
          className="absolute bottom-[3%] h-4 bg-white/15 rounded-full blur-sm"
          style={{ left: drift.left, width: drift.width }}
        />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-[5%] bg-gradient-to-t from-[#c8d6e5]/20 to-transparent" />
    </div>
  );
}

function CloudyScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Overcast sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2530] via-[#2c3a4a] to-[#4a5568]" />

      {/* Layer of clouds */}
      <div className="absolute top-[8%] scene-cloud-drift" style={{ animationDuration: "35s" }}>
        <div className="relative">
          <div className="w-56 h-14 bg-[#4a5568]/40 rounded-full blur-md" />
          <div className="absolute -top-3 left-10 w-32 h-12 bg-[#4a5568]/35 rounded-full blur-md" />
        </div>
      </div>
      <div className="absolute top-[18%] scene-cloud-drift" style={{ animationDuration: "42s", animationDelay: "8s" }}>
        <div className="relative">
          <div className="w-64 h-16 bg-[#4a5568]/35 rounded-full blur-lg" />
          <div className="absolute -top-4 left-14 w-36 h-14 bg-[#4a5568]/30 rounded-full blur-lg" />
        </div>
      </div>
      <div className="absolute top-[28%] scene-cloud-drift" style={{ animationDuration: "55s", animationDelay: "15s" }}>
        <div className="w-44 h-10 bg-[#4a5568]/30 rounded-full blur-md" />
      </div>

      {/* Muted landscape */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%]">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="rgba(30,50,40,0.5)" d="M0,320 L0,230 Q300,160 600,210 Q900,140 1200,190 Q1380,170 1440,200 L1440,320 Z" />
          <path fill="rgba(25,40,35,0.65)" d="M0,320 L0,260 Q250,200 500,245 Q750,190 1000,235 Q1250,200 1440,245 L1440,320 Z" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-gradient-to-t from-[#151f28] to-transparent" />
    </div>
  );
}

/* =============================================
   MAIN COMPONENT
   ============================================= */
function TimeBasedScene({ period }: { period: TimePeriod }) {
  switch (period) {
    case "dawn":
      return <DawnScene />;
    case "day":
      return <DayScene />;
    case "dusk":
      return <DuskScene />;
    case "night":
      return <NightScene />;
  }
}

function WeatherBasedScene({ weather }: { weather: WeatherMode }) {
  switch (weather) {
    case "rain":
      return <RainScene />;
    case "sunny":
      return <SunnyScene />;
    case "snow":
      return <SnowyScene />;
    case "cloudy":
      return <CloudyScene />;
  }
}

export default function AmbientSceneBackground() {
  const {
    currentTimePeriod,
    currentWeather,
    isTimeThemeActive,
    isWeatherThemeActive,
  } = useAmbient();
  const { settings } = useAppSettings();

  // Don't render in lightweight mode or if no ambient theme is active
  if (
    settings.performanceMode === "lightweight" ||
    (!isTimeThemeActive && !isWeatherThemeActive)
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[0] pointer-events-none transition-opacity duration-[3000ms]"
      aria-hidden="true"
    >
      {isTimeThemeActive && <TimeBasedScene period={currentTimePeriod} />}
      {isWeatherThemeActive && currentWeather && (
        <WeatherBasedScene weather={currentWeather} />
      )}
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
