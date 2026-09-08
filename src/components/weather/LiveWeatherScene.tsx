import React, { useEffect, useRef, useState } from 'react';

export type WeatherAnimationType = 'sunny' | 'rainy' | 'stormy' | 'cloudy' | 'night';

interface LiveWeatherSceneProps {
  weatherCode?: number;
  isDay?: boolean;
  className?: string;
  mode?: 'card' | 'background';
}

export const LiveWeatherScene: React.FC<LiveWeatherSceneProps> = ({
  weatherCode = 0,
  isDay = true,
  className = '',
  mode = 'background',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Automatically determine animation from weather code
  const getAutoType = (): WeatherAnimationType => {
    if (!isDay) return 'night';
    if ([95, 96, 99].includes(weatherCode)) return 'stormy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return 'rainy';
    if ([2, 3, 45, 48].includes(weatherCode)) return 'cloudy';
    return 'sunny';
  };

  const [animType, setAnimType] = useState<WeatherAnimationType>(getAutoType());

  // Update when prop changes
  useEffect(() => {
    setAnimType(getAutoType());
  }, [weatherCode, isDay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle state
    // 1. Raindrops & splashes
    interface RainDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }
    interface Splash {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }
    const rainDrops: RainDrop[] = Array.from({ length: 85 }, () => ({
      x: Math.random() * (width || 400),
      y: Math.random() * (height || 600),
      speed: 10 + Math.random() * 8,
      length: 12 + Math.random() * 10,
      opacity: 0.35 + Math.random() * 0.45,
    }));
    const splashes: Splash[] = [];

    // 2. Stars for night
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
    }
    const stars: Star[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * (width || 400),
      y: Math.random() * ((height || 600) * 0.7),
      radius: 0.8 + Math.random() * 1.6,
      alpha: 0.3 + Math.random() * 0.6,
      speed: 0.01 + Math.random() * 0.02,
    }));

    // 3. Floating clouds
    interface CloudBlob {
      x: number;
      y: number;
      radius: number;
      speed: number;
      alpha: number;
    }
    const clouds: CloudBlob[] = [
      { x: 30, y: 70, radius: 55, speed: 0.28, alpha: 0.55 },
      { x: 150, y: 50, radius: 70, speed: 0.20, alpha: 0.65 },
      { x: 280, y: 80, radius: 60, speed: 0.32, alpha: 0.50 },
      { x: 380, y: 60, radius: 75, speed: 0.22, alpha: 0.60 },
    ];

    let sunAngle = 0;
    let lightningTimer = 0;
    let lightningActive = false;
    let lightningAlpha = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. SUNNY ANIMATION (Light mode tuned)
      if (animType === 'sunny') {
        sunAngle += 0.005;
        const sunX = width * 0.82;
        const sunY = 90;

        // Concentric glowing aura rings
        const auraGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 140);
        auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        auraGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.20)');
        auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
        ctx.fill();

        // Radiating procedural sunbeams
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(sunAngle);
        for (let i = 0; i < 12; i++) {
          ctx.rotate((Math.PI * 2) / 12);
          ctx.beginPath();
          ctx.moveTo(35, 0);
          ctx.lineTo(65, 0);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(251, 191, 36, 0.30)';
          ctx.lineWidth = i % 2 === 0 ? 3 : 1.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.restore();

        // Sun disc
        const sunCoreGrad = ctx.createRadialGradient(sunX - 4, sunY - 4, 3, sunX, sunY, 30);
        sunCoreGrad.addColorStop(0, '#FEF08A');
        sunCoreGrad.addColorStop(0.7, '#FBBF24');
        sunCoreGrad.addColorStop(1, '#F59E0B');
        ctx.fillStyle = sunCoreGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
        ctx.fill();

        // Drifting gentle warm light clouds
        clouds.forEach((c) => {
          c.x += c.speed;
          if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;
          ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.arc(c.x + 40, c.y - 12, c.radius * 0.85, 0, Math.PI * 2);
          ctx.arc(c.x + 80, c.y + 4, c.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. NIGHT ANIMATION
      else if (animType === 'night') {
        // Twinkling stars
        stars.forEach((s) => {
          s.alpha += s.speed;
          if (s.alpha > 0.8 || s.alpha < 0.2) s.speed = -s.speed;
          ctx.fillStyle = `rgba(99, 102, 241, ${Math.abs(s.alpha)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Glowing Moon
        const moonX = width * 0.82;
        const moonY = 85;
        const moonRadius = 26;

        // Moon glow halo
        const moonHalo = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 90);
        moonHalo.addColorStop(0, 'rgba(199, 210, 254, 0.45)');
        moonHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = moonHalo;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
        ctx.fill();

        // Crescent moon
        ctx.save();
        ctx.fillStyle = '#E0E7FF';
        ctx.shadowColor = '#818CF8';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(moonX - 9, moonY - 6, moonRadius * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Soft nocturnal clouds
        clouds.forEach((c) => {
          c.x += c.speed * 0.6;
          if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;
          ctx.fillStyle = `rgba(165, 180, 252, ${c.alpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y + 15, c.radius, 0, Math.PI * 2);
          ctx.arc(c.x + 40, c.y + 5, c.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. RAINY ANIMATION
      else if (animType === 'rainy') {
        // Rain clouds
        clouds.forEach((c) => {
          c.x += c.speed * 0.8;
          if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.beginPath();
          ctx.arc(c.x, c.y - 10, c.radius * 1.2, 0, Math.PI * 2);
          ctx.arc(c.x + 45, c.y - 15, c.radius * 1.05, 0, Math.PI * 2);
          ctx.fill();
        });

        // Falling raindrops with light angle
        rainDrops.forEach((drop) => {
          drop.y += drop.speed;
          drop.x -= drop.speed * 0.18;

          if (drop.y > height - 10) {
            if (Math.random() > 0.4) {
              splashes.push({
                x: drop.x,
                y: height - 8,
                radius: 1,
                maxRadius: 6 + Math.random() * 5,
                opacity: 0.6,
              });
            }
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 50);
          }

          ctx.strokeStyle = `rgba(59, 130, 246, ${drop.opacity * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.speed * 0.18, drop.y + drop.length);
          ctx.stroke();
        });

        // Splash ripples
        for (let i = splashes.length - 1; i >= 0; i--) {
          const sp = splashes[i];
          sp.radius += 0.5;
          sp.opacity -= 0.04;

          if (sp.opacity <= 0) {
            splashes.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(96, 165, 250, ${sp.opacity * 0.7})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 1.8, sp.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 4. STORMY ANIMATION
      else if (animType === 'stormy') {
        lightningTimer++;

        if (lightningTimer > 110 && Math.random() > 0.7) {
          lightningActive = true;
          lightningAlpha = 0.85;
          lightningTimer = 0;
        }

        // Heavy clouds
        clouds.forEach((c) => {
          c.x += c.speed * 1.3;
          if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;
          ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
          ctx.beginPath();
          ctx.arc(c.x, c.y - 15, c.radius * 1.3, 0, Math.PI * 2);
          ctx.arc(c.x + 45, c.y - 10, c.radius * 1.1, 0, Math.PI * 2);
          ctx.fill();
        });

        // Rain
        rainDrops.forEach((drop) => {
          drop.y += drop.speed * 1.3;
          drop.x -= drop.speed * 0.35;

          if (drop.y > height - 10) {
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 100);
          }

          ctx.strokeStyle = `rgba(37, 99, 235, ${drop.opacity * 0.75})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.speed * 0.35, drop.y + drop.length * 1.2);
          ctx.stroke();
        });

        // Lightning flash
        if (lightningActive) {
          ctx.fillStyle = `rgba(224, 242, 254, ${lightningAlpha * 0.5})`;
          ctx.fillRect(0, 0, width, height);

          ctx.save();
          ctx.strokeStyle = `rgba(59, 130, 246, ${lightningAlpha})`;
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 18;
          ctx.lineWidth = 2.5;
          ctx.beginPath();

          let lx = width * 0.5 + (Math.random() * 60 - 30);
          let ly = 10;
          ctx.moveTo(lx, ly);

          while (ly < height * 0.6) {
            lx += (Math.random() - 0.5) * 35;
            ly += Math.random() * 25 + 10;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
          ctx.restore();

          lightningAlpha -= 0.07;
          if (lightningAlpha <= 0) {
            lightningActive = false;
          }
        }
      }

      // 5. CLOUDY ANIMATION
      else {
        clouds.forEach((c, idx) => {
          c.x += c.speed;
          if (c.x - c.radius * 2 > width) c.x = -c.radius * 2;

          ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(226, 232, 240, 0.65)';
          ctx.beginPath();
          ctx.arc(c.x, c.y + 10, c.radius * 1.1, 0, Math.PI * 2);
          ctx.arc(c.x + 35, c.y, c.radius * 0.9, 0, Math.PI * 2);
          ctx.arc(c.x + 75, c.y + 8, c.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Diffused soft sun
        const sunX = width * 0.75;
        const sunY = 90;
        const diffusedGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
        diffusedGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        diffusedGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = diffusedGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [animType]);

  // Soft light-mode background gradient
  const getBackgroundGradient = () => {
    switch (animType) {
      case 'sunny':
        return 'from-[#BAE6FD]/30 via-[#E0F2FE]/40 to-[#F8FAFC]';
      case 'rainy':
        return 'from-[#CBD5E1]/40 via-[#E2E8F0]/50 to-[#F8FAFC]';
      case 'stormy':
        return 'from-[#94A3B8]/35 via-[#CBD5E1]/40 to-[#F8FAFC]';
      case 'night':
        return 'from-[#C7D2FE]/30 via-[#E0E7FF]/40 to-[#F8FAFC]';
      case 'cloudy':
      default:
        return 'from-[#E2E8F0]/40 via-[#F1F5F9]/50 to-[#F8FAFC]';
    }
  };

  if (mode === 'background') {
    return (
      <div className={`absolute inset-0 w-full h-[640px] pointer-events-none overflow-hidden bg-gradient-to-b ${getBackgroundGradient()} transition-colors duration-700 ${className}`}>
        {/* Canvas background particles */}
        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Ambient top light blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F8FAFC] pointer-events-none" />
      </div>
    );
  }

  // Card mode (if needed elsewhere)
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-b ${getBackgroundGradient()} ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
