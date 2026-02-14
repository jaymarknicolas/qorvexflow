"use client";

import { useMemo } from "react";
import { useAmbient } from "@/lib/contexts/ambient-context";
import { useAppSettings } from "@/lib/contexts/app-settings-context";

function RainEffect() {
  const drops = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${0.5 + Math.random() * 1}s`,
        animationDelay: `${Math.random() * 2}s`,
        opacity: 0.3 + Math.random() * 0.4,
        height: `${10 + Math.random() * 10}px`,
      })),
    []
  );

  return (
    <>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="weather-rain-drop"
          style={{
            left: drop.left,
            animationDuration: drop.animationDuration,
            animationDelay: drop.animationDelay,
            opacity: drop.opacity,
            height: drop.height,
          }}
        />
      ))}
    </>
  );
}

function SnowEffect() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${3 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 3}s`,
        opacity: 0.4 + Math.random() * 0.4,
        size: `${3 + Math.random() * 5}px`,
      })),
    []
  );

  return (
    <>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="weather-snowflake"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            animationDelay: flake.animationDelay,
            opacity: flake.opacity,
            width: flake.size,
            height: flake.size,
          }}
        />
      ))}
    </>
  );
}

function SunRaysEffect() {
  return (
    <>
      <div
        className="weather-sun-ray"
        style={{
          top: "-20%",
          right: "-10%",
          width: "60%",
          height: "60%",
        }}
      />
      <div
        className="weather-sun-ray"
        style={{
          top: "-10%",
          right: "10%",
          width: "40%",
          height: "40%",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="weather-sun-ray"
        style={{
          top: "0%",
          left: "-5%",
          width: "35%",
          height: "35%",
          animationDelay: "3s",
        }}
      />
    </>
  );
}

function CloudyEffect() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: `${5 + Math.random() * 30}%`,
        animationDuration: `${20 + Math.random() * 15}s`,
        animationDelay: `${Math.random() * 10}s`,
        opacity: 0.03 + Math.random() * 0.05,
        width: `${200 + Math.random() * 200}px`,
        height: `${80 + Math.random() * 60}px`,
      })),
    []
  );

  return (
    <>
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="weather-cloud"
          style={{
            top: cloud.top,
            animationDuration: cloud.animationDuration,
            animationDelay: cloud.animationDelay,
            opacity: cloud.opacity,
            width: cloud.width,
            height: cloud.height,
          }}
        />
      ))}
    </>
  );
}

export default function WeatherParticles() {
  const { currentWeather, ambientSettings } = useAmbient();
  const { settings } = useAppSettings();

  // Don't render if weather mode is disabled or lightweight mode
  if (
    !ambientSettings.weatherAmbientEnabled ||
    !currentWeather ||
    settings.performanceMode === "lightweight" ||
    settings.reducedMotion
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      aria-hidden="true"
    >
      {currentWeather === "rain" && <RainEffect />}
      {currentWeather === "snow" && <SnowEffect />}
      {currentWeather === "sunny" && <SunRaysEffect />}
      {currentWeather === "cloudy" && <CloudyEffect />}
    </div>
  );
}
