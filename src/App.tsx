import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import mapData from './japan-map-data.json';
import { memories } from './memory-data';

// --- Cinematic Elements ---

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <motion.div
      className="hidden md:flex fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full pointer-events-none z-[9999] mix-blend-difference items-center justify-center"
      animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <div className="w-1 h-1 bg-white rounded-full" />
    </motion.div>
  );
};

const FilmGrain = () => (
  <div className="pointer-events-none fixed inset-0 z-[100] h-full w-full opacity-[0.05]"
       style={{ 
         backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
       }}>
  </div>
);

const Letterbox = () => (
  <>
    <div className="fixed top-0 left-0 w-full h-[8vh] bg-black z-[90] pointer-events-none"></div>
    <div className="fixed bottom-0 left-0 w-full h-[8vh] bg-black z-[90] pointer-events-none"></div>
  </>
);

const Loader = ({ onStart }: { onStart: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = memories.length;

    if (totalAssets === 0) {
      setIsReady(true);
      return;
    }

    const loadAsset = (memory: typeof memories[0]) => {
      return new Promise<void>((resolve) => {
        if (memory.type === 'image') {
          const img = new Image();
          img.src = memory.url;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve anyway to prevent hanging
        } else {
          const vid = document.createElement('video');
          vid.src = memory.url;
          vid.onloadeddata = () => resolve();
          vid.onerror = () => resolve();
          vid.load();
        }
      }).then(() => {
        loadedCount++;
        setProgress(Math.round((loadedCount / totalAssets) * 100));
      });
    };

    Promise.all(memories.map(loadAsset)).then(() => {
      setTimeout(() => {
        setIsReady(true);
      }, 500);
    });
  }, []);

  const handleStart = () => {
    setIsFadingOut(true);
    setTimeout(onStart, 1500);
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center flex-col px-6"
      animate={{ opacity: isFadingOut ? 0 : 1, pointerEvents: isFadingOut ? 'none' : 'auto' }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <div className="text-center max-w-md flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 mb-16"
        >
          <p className="text-white/50 text-[10px] md:text-xs tracking-[0.5em] uppercase font-light">
            For the best experience
          </p>
          <p className="text-white/80 text-sm md:text-base tracking-[0.3em] uppercase font-serif italic">
            Please go hands-free & turn your volume up
          </p>
        </motion.div>
        
        {!isReady ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase mb-4 font-sans">
              Loading Memories... {progress}%
            </p>
            <div className="w-32 h-[1px] bg-white/10 mx-auto overflow-hidden">
              <motion.div 
                className="h-full bg-white/50"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            onClick={handleStart}
            className="mt-8 px-10 py-4 border border-white/20 text-white/70 text-[10px] tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-700 backdrop-blur-sm"
          >
            Begin
          </motion.button>
        )}
      </div>
    </motion.div>
  )
};

// --- Content Data ---

// --- Scene Components ---

const IntroSequence = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div ref={ref} className="h-screen relative bg-black flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        style={{ opacity, y }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 2.5 }}
        className="text-center px-4 z-10"
      >
        <p className="text-xs tracking-[0.5em] text-gray-400 uppercase mb-8 font-sans">Operation: Eat Everything</p>
        <h1 className="text-4xl md:text-7xl font-serif font-light text-white tracking-widest uppercase">
          JAPAN <span className="italic">BOUND</span>
        </h1>
        <p className="text-sm md:text-lg font-serif italic text-gray-300 mt-6 tracking-wide">Razor's Special Edition</p>
        <div className="mt-16 w-[1px] h-16 bg-white/30 mx-auto animate-pulse"></div>
        <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mt-8 font-sans">Scroll to explore</p>
      </motion.div>
    </div>
  )
};

const MemoryStream = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const swipeNext = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 250; // Multiplied by 4 in exit animation = 1000px
    setExitX(Math.cos(angle) * distance);
    setExitY(Math.sin(angle) * distance);
    setCurrentIndex((prev) => (prev + 1) % memories.length);
  }, []);

  const topMemory = memories[currentIndex % memories.length];
  const isTopVideo = topMemory.type === 'video';

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (isTopVideo) return; // Video handles its own swiping
    
    const timer = setTimeout(() => {
      swipeNext();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, isTopVideo, currentIndex, swipeNext]);

  const handleDragEnd = (info: any) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      setExitX(info.offset.x);
      setExitY(info.offset.y);
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }
  };

  const renderedCards = [];
  for (let i = 3; i >= 0; i--) {
    const memIndex = (currentIndex + i) % memories.length;
    renderedCards.push({ ...memories[memIndex], memIndex, stackIndex: i });
  }

  return (
    <div className="bg-black py-20 md:py-32 relative z-10 overflow-hidden flex flex-col items-center">
      <div className="text-center mb-12 px-6">
        <p className="text-xs tracking-[0.5em] text-gray-400 uppercase mb-6 font-sans">A Look Back</p>
        <h2 className="text-2xl md:text-5xl font-serif font-light text-white tracking-widest uppercase leading-snug">
          That's all I have with me <br/>
          <span className="italic text-gray-300 text-xl md:text-4xl mt-2 block">to very beginning to ending</span>
        </h2>
      </div>

      <div 
        className="relative w-full h-[65vh] md:h-[75vh] flex items-center justify-center"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        onTouchStart={() => setIsAutoPlaying(false)}
        onTouchEnd={() => {
          setTimeout(() => setIsAutoPlaying(true), 2000);
        }}
      >
        <AnimatePresence mode="popLayout">
          {renderedCards.map((card) => {
            const isTop = card.stackIndex === 0;
            return (
              <MemoryCard
                key={card.memIndex}
                card={card}
                isTop={isTop}
                handleDragEnd={handleDragEnd}
                exitX={exitX}
                exitY={exitY}
                onVideoReadyToSwipe={swipeNext}
                isAutoPlaying={isAutoPlaying}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-3 mt-12 text-gray-500 text-[10px] md:text-xs font-mono uppercase tracking-widest animate-pulse">
        <span>Swipe any direction</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </div>
    </div>
  );
};

const MemoryCard = ({ card, isTop, handleDragEnd, exitX, exitY, onVideoReadyToSwipe, isAutoPlaying }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTriggeredSwipe = useRef(false);

  useEffect(() => {
    if (!isTop) {
      hasTriggeredSwipe.current = false;
    }
  }, [isTop]);

  useEffect(() => {
    if (isTop && isAutoPlaying && card.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      if (video.duration && video.currentTime / video.duration >= 0.85) {
        if (!hasTriggeredSwipe.current) {
          hasTriggeredSwipe.current = true;
          onVideoReadyToSwipe();
        }
      }
    }
  }, [isTop, isAutoPlaying, card.type, onVideoReadyToSwipe]);

  const handleTimeUpdate = (e: any) => {
    if (!isTop || !isAutoPlaying) return;
    const video = e.target;
    if (video.duration && video.currentTime / video.duration >= 0.85) {
      if (!hasTriggeredSwipe.current) {
        hasTriggeredSwipe.current = true;
        onVideoReadyToSwipe();
      }
    }
  };

  return (
    <motion.div
      className="absolute w-[80vw] md:w-[35vw] h-[60vh] md:h-[70vh] rounded-2xl origin-bottom cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate: isTop ? rotate : 0 }}
      initial={{ scale: 0.8, y: 50, opacity: 0 }}
      animate={{
        scale: 1 - card.stackIndex * 0.05,
        y: card.stackIndex * 25,
        zIndex: 10 - card.stackIndex,
        opacity: 1 - card.stackIndex * 0.2
      }}
      exit={{
        x: exitX * 4,
        y: exitY * 4,
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? (e, info) => handleDragEnd(info) : undefined}
    >
      <div className="w-full h-full p-2 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl pointer-events-none">
        <div className="relative w-full h-full overflow-hidden rounded-xl bg-zinc-900">
          {card.type === 'video' ? (
            <video
              ref={videoRef}
              src={card.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            <img
              src={card.url}
              alt={`Memory ${card.memIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          <div className="absolute bottom-6 left-6 text-white/70 text-[10px] md:text-xs font-mono uppercase tracking-[0.3em]">
            No. {String(card.memIndex + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Apology = () => {
  return (
    <div className="bg-black py-32 px-6 relative z-10 flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div 
        className="max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true, margin: "-20%" }}
      >
        <div className="w-12 h-[1px] bg-white/20 mx-auto mb-12" />
        <h3 className="text-2xl md:text-4xl font-serif italic text-white mb-8 leading-relaxed">
          "I am so deeply sorry for everything I did in the past."
        </h3>
        <p className="text-sm md:text-base text-gray-400 font-light leading-loose tracking-wide mb-12">
          I know I made mistakes, and I know I hurt you. Looking back at all these memories, I realize how precious what we had was. I wish I could go back and change things, but all I can do now is own my mistakes and tell you how truly sorry I am. You didn't deserve any of it.
        </p>
        <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-sans">
          Please forgive me
        </p>
        <div className="w-12 h-[1px] bg-white/20 mx-auto mt-12" />
      </motion.div>
    </div>
  );
};

const landmarks = [
  { id: 'sapporo', name: 'Sapporo', cx: mapData.sapporo[0], cy: mapData.sapporo[1], message: "Eat your weight in crab and try not to freeze! 🦀❄️" },
  { id: 'tokyo', name: 'Tokyo', cx: mapData.tokyo[0], cy: mapData.tokyo[1], message: "Get ready to be lost in Shinjuku station for 3 hours! 🗼🍜" },
  { id: 'fuji', name: 'Mount Fuji', cx: mapData.fuji[0], cy: mapData.fuji[1], message: "It's just a big triangle, but it's OUR big triangle! 🗻✨" },
  { id: 'kyoto', name: 'Kyoto', cx: mapData.kyoto[0], cy: mapData.kyoto[1], message: "Look at all these temples! (You will get temple fatigue by day 2) 🌸🍵" },
  { id: 'nara', name: 'Nara', cx: mapData.nara[0], cy: mapData.nara[1], message: "Watch out, the deer WILL mug you for crackers. 🦌🍘" },
  { id: 'osaka', name: 'Osaka', cx: mapData.osaka[0], cy: mapData.osaka[1], message: "Eat until you literally explode. That's an order. 🐙💥" },
  { id: 'hiroshima', name: 'Hiroshima', cx: mapData.hiroshima[0], cy: mapData.hiroshima[1], message: "Beautiful shrines and the best okonomiyaki you'll ever have! ⛩️🍳" },
];

const JourneyMap = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={ref} className="h-screen relative bg-[#050505] overflow-hidden flex flex-col items-center justify-center border-y border-white/5">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '4vw 4vw' }} />
      
      <div className="absolute top-24 md:top-32 text-center z-10">
        <p className="text-xs tracking-[0.5em] text-gray-500 uppercase mb-4 font-sans">The Route</p>
        <h2 className="text-3xl md:text-5xl font-serif font-light text-white tracking-widest uppercase">
          Your <span className="italic">Journey</span>
        </h2>
      </div>

      <motion.div style={{ y }} className="relative w-full max-w-5xl px-4 mt-12">
        <svg viewBox="0 -100 1000 900" className="w-[240%] -ml-[95%] lg:w-full lg:ml-0 h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {/* Japan Map Path */}
          <path 
            d={mapData.path}
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* Connection Line */}
          <motion.path 
            d={`M ${mapData.sapporo[0]} ${mapData.sapporo[1]} Q ${(mapData.sapporo[0] + mapData.tokyo[0])/2 + 40} ${(mapData.sapporo[1] + mapData.tokyo[1])/2} ${mapData.tokyo[0]} ${mapData.tokyo[1]} Q ${(mapData.tokyo[0] + mapData.fuji[0])/2} ${(mapData.tokyo[1] + mapData.fuji[1])/2 - 20} ${mapData.fuji[0]} ${mapData.fuji[1]} Q ${(mapData.fuji[0] + mapData.kyoto[0])/2} ${(mapData.fuji[1] + mapData.kyoto[1])/2 - 20} ${mapData.kyoto[0]} ${mapData.kyoto[1]} Q ${(mapData.kyoto[0] + mapData.nara[0])/2} ${(mapData.kyoto[1] + mapData.nara[1])/2 - 5} ${mapData.nara[0]} ${mapData.nara[1]} Q ${(mapData.nara[0] + mapData.osaka[0])/2} ${(mapData.nara[1] + mapData.osaka[1])/2 - 10} ${mapData.osaka[0]} ${mapData.osaka[1]} Q ${(mapData.osaka[0] + mapData.hiroshima[0])/2} ${(mapData.osaka[1] + mapData.hiroshima[1])/2 - 20} ${mapData.hiroshima[0]} ${mapData.hiroshima[1]}`} 
            fill="none" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2" 
            strokeDasharray="6,6" 
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            viewport={{ once: true, margin: "-20%" }}
          />
          
          {landmarks.map((lm) => (
            <g key={lm.id} className="group cursor-pointer" tabIndex={0} style={{ outline: 'none' }}>
              {/* Invisible larger hover target */}
              <circle cx={lm.cx} cy={lm.cy} r="40" fill="transparent" />
              
              {/* Pulsing ring */}
              <circle cx={lm.cx} cy={lm.cy} r="12" fill="rgba(255,255,255,0.1)" className="animate-pulse-ring origin-center" style={{ transformOrigin: `${lm.cx}px ${lm.cy}px` }} />
              <circle cx={lm.cx} cy={lm.cy} r="20" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1" className="animate-pulse-ring origin-center" style={{ transformOrigin: `${lm.cx}px ${lm.cy}px`, animationDelay: '1s' }} />
              
              {/* Core dot */}
              <circle cx={lm.cx} cy={lm.cy} r="4" fill="#fff" className="group-hover:fill-orange-400 group-focus:fill-orange-400 group-hover:scale-150 group-focus:scale-150 transition-all duration-300 origin-center" style={{ transformOrigin: `${lm.cx}px ${lm.cy}px` }} />
              
              {/* Tooltip */}
              <foreignObject 
                x={lm.cx > 700 ? lm.cx - 220 : lm.cx < 550 ? lm.cx - 50 : lm.cx - 125} 
                y={lm.cy - 140} 
                width="250" 
                height="120" 
                className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none"
              >
                <div className="flex flex-col items-center justify-end h-full pb-4">
                  <div className="bg-black/90 backdrop-blur-md border border-white/10 text-white p-4 rounded-xl w-full text-center shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <p className="font-serif italic text-gray-300 mb-2 text-sm group-hover:text-orange-300 group-hover:animate-float inline-block transition-colors">{lm.name}</p>
                    <p className="font-sans font-light text-xs text-gray-400 leading-relaxed">{lm.message}</p>
                  </div>
                  <div className="w-px h-4 bg-gradient-to-b from-white/50 to-transparent mt-1" />
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
};

const FinaleParticles = () => {
  const [particles, setParticles] = useState<any[]>([]);
  
  useEffect(() => {
    setParticles([...Array(40)].map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      startX: Math.random() * 100,
      startY: Math.random() * 40 + 60,
      xOffset: (Math.random() - 0.5) * 10,
      yOffset: Math.random() * 30 + 20,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 2 + 1.5,
      maxOpacity: Math.random() * 0.6 + 0.2
    })));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white rounded-full"
          style={{ 
            width: p.size, 
            height: p.size, 
            left: `${p.startX}%`, 
            top: `${p.startY}%`,
            boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.8)`
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          whileInView={{ 
            opacity: [0, p.maxOpacity, 0], 
            y: `-${p.yOffset}vh`,
            x: `${p.xOffset}vw`
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay, 
            ease: "easeInOut" 
          }}
          viewport={{ once: true }}
        />
      ))}
    </div>
  );
};

const Finale = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  return (
    <div ref={ref} className="h-screen relative bg-black overflow-hidden">
       <motion.div
        className="absolute inset-0 w-full h-[120%] -top-[20%] origin-center"
        style={{ y }}
      >
        <img src="/images/finale.jpg" alt="Finale" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
      </motion.div>

      <FinaleParticles />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
        <motion.div
          initial={{ scale: 1 }}
          whileInView={{ scale: 0.9 }}
          transition={{ duration: 15, delay: 2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-10 w-full flex justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-10%" }}
            className="text-center flex flex-col items-center"
          >
            <p className="text-xs md:text-sm tracking-[0.5em] uppercase mb-8 text-gray-400 font-sans">
              No crying allowed
            </p>
            
            <motion.h1 
              className="text-5xl md:text-[8rem] font-serif font-light tracking-tighter mb-8 text-center text-white drop-shadow-2xl leading-none flex flex-col items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
              }}
            >
              <div className="flex overflow-hidden">
                {"GOOD BYE".split('').map((char, i) => (
                  <motion.span 
                    key={i} 
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: 'blur(10px)', scale: 1.2 },
                      visible: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
                    }} 
                    className={char === ' ' ? 'w-4 md:w-8' : 'inline-block'}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="flex overflow-hidden italic font-normal text-gray-300 mt-2">
                {"SHAKUNI".split('').map((char, i) => (
                  <motion.span 
                    key={i} 
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: 'blur(10px)', scale: 1.2 },
                      visible: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
                    }} 
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-3xl font-light max-w-2xl text-center text-gray-300 font-serif italic drop-shadow-xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 2, delay: 1.5 }}
              viewport={{ once: true }}
            >
              Go eat your weight in sushi! And seriously, don't forget our souvenirs. 🍣✨
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
};

const lyricsData = [
  { time: 146.73, text: "So you can keep me" },
  { time: 149.73, text: "Inside the pocket of your ripped jeans" },
  { time: 152.73, text: "Holding me closer 'til our eyes meet" },
  { time: 156.73, text: "You won't ever be alone" },
  { time: 159.73, text: "And if you hurt me" },
  { time: 163.73, text: "Well, that's okay baby, only words bleed" },
  { time: 166.73, text: "Inside these pages you just hold me" },
  { time: 169.73, text: "And I won't ever let you go" },
  { time: 173.73, text: "Wait for me to come home" },
  { time: 180.73, text: "Wait for me to come home" },
  { time: 186.73, text: "Wait for me to come home" },
  { time: 193.73, text: "Wait for me to come home" },
  { time: 200.73, text: "Oh, you can fit me" },
  { time: 203.73, text: "Inside the necklace you got when you were sixteen" },
  { time: 206.73, text: "Next to your heartbeat where I should be" },
  { time: 210.73, text: "Keep it deep within your soul" },
  { time: 213.73, text: "And if you hurt me" },
  { time: 216.73, text: "Well, that's okay baby, only words bleed" },
  { time: 220.73, text: "Inside these pages you just hold me" },
  { time: 223.73, text: "And I won't ever let you go" },
  { time: 226.73, text: "When I'm away, I will remember how you kissed me" },
  { time: 231.73, text: "Under the lamppost back on Sixth street" },
  { time: 234.73, text: "Hearing you whisper through the phone" },
  { time: 239.73, text: "Wait for me to come home" },
  { time: 258.73, text: "" }
];

const LyricsOverlay = ({ currentTime }: { currentTime: number }) => {
  const currentLyric = [...lyricsData].reverse().find(l => currentTime >= l.time)?.text || "";

  return (
    <div className="fixed top-8 right-8 z-[100] pointer-events-none max-w-[250px] md:max-w-xs text-right">
      <AnimatePresence mode="wait">
        {currentLyric && (
          <motion.p
            key={currentLyric}
            initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="text-white/70 text-xs md:text-sm font-serif italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            {currentLyric}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStart = () => {
    setIsLoaded(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 130.5; // Skip to "So you can keep me"
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  return (
    <div className={`bg-black min-h-screen text-white selection:bg-white/30 ${!isLoaded ? 'h-screen overflow-hidden' : ''}`}>
      <audio 
        ref={audioRef} 
        src="https://archive.org/download/PhotographEdSheeranInstrumentalMadeByZainMerchant/Photograph%20-%20Ed%20Sheeran%20%28Instrumental%20made%20by%20Zain%20Merchant%29.mp4" 
        loop 
        onTimeUpdate={handleTimeUpdate}
      />
      {!isLoaded && <Loader onStart={handleStart} />}
      {isLoaded && <LyricsOverlay currentTime={currentTime} />}
      <CustomCursor />
      <FilmGrain />
      <Letterbox />
      
      <IntroSequence />

      <MemoryStream />
      
      <Apology />

      <JourneyMap />
      
      <Finale />
    </div>
  );
}
