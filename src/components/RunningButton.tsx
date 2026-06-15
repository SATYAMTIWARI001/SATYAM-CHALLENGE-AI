import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { sound } from './SoundEngine';

interface RunningButtonProps {
  idText: string;
  text: string;
  funnyMessages: string[];
  className?: string;
  onEscape?: (clickedMsg: string) => void;
}

export default function RunningButton({
  idText,
  text,
  funnyMessages,
  className = '',
  onEscape,
}: RunningButtonProps) {
  const [currentText, setCurrentText] = useState(text);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const controls = useAnimation();

  // Escape function: calculates a random position on the screen
  const escape = () => {
    // Play funny escape sound
    sound.playEscape();

    // Trigger page shake animation via dispatching custom event
    const shakeEvent = new CustomEvent('satyam-shake-page');
    window.dispatchEvent(shakeEvent);

    const padding = 60;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Pick random coordinates within safe screen area
    const newX = Math.random() * (screenWidth - 200) - (screenWidth / 2 - 100);
    const newY = Math.random() * (screenHeight - 120) - (screenHeight / 2 - 60);

    // Randomize scale between 0.65 and 1.35
    const newScale = Math.random() * 0.7 + 0.65;

    // Randomize rotation between -360 and 360 degrees
    const newRotation = (Math.random() - 0.5) * 720;

    // Cycle to a random funny message
    const msg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    setCurrentText(msg);

    setPosition({ x: newX, y: newY });
    setScale(newScale);
    setRotation(newRotation);

    if (onEscape) {
      onEscape(msg);
    }
  };

  // Safe reset when entering new levels
  useEffect(() => {
    setCurrentText(text);
    setPosition({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
  }, [text]);

  const handlePointerEnter = () => {
    escape();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // prevent click behavior on mobile
    escape();
  };

  return (
    <motion.button
      id={idText}
      ref={buttonRef}
      onPointerEnter={handlePointerEnter}
      onTouchStart={handleTouchStart}
      onClick={escape}
      animate={{
        x: position.x,
        y: position.y,
        scale: scale,
        rotate: rotation,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 15,
      }}
      whileTap={{ scale: 0.8 }}
      className={`relative px-6 py-3 font-semibold rounded-xl select-none shadow-[0_0_20px_rgba(239,68,68,0.25)] border border-red-500/20 active:outline-none focus:outline-none transition-colors cursor-pointer ${className}`}
    >
      <span className="relative z-10">{currentText}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-xl blur-[2px] -z-0 opacity-40" />
    </motion.button>
  );
}
