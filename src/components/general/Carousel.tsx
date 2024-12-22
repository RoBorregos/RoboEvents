import React, { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

type Direction = -1 | 1;

const AUTOSCROLL_INTERVAL = 10 * 1000;

export const Carousel = ({ events }: { events: ReactNode[] }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<Direction>(1);
  const lastModification = useRef<number>(Date.now());

  const navigationEnabled = events.length > 1;

  const handleNext = () => {
    lastModification.current = Date.now();
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const handlePrev = () => {
    lastModification.current = Date.now();
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (
        navigationEnabled &&
        Date.now() - lastModification.current > AUTOSCROLL_INTERVAL
      ) {
        handleNext();
      } else {
        console.log(Date.now() - lastModification.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  const variants = {
    enter: (dir: Direction) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        opacity: { delay: 0.5, duration: 0.5 },
        x: { duration: 0.5 },
      },
    },
    exit: (dir: Direction) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <>
      <div className="mx-auto flex flex-row items-center justify-center gap-4">
        {navigationEnabled && (
          <MdNavigateBefore
            className="z-50 text-4xl text-white"
            onClick={handlePrev}
          />
        )}
        <AnimatePresence custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="absolute mx-auto flex h-full w-[90%] items-center justify-center rounded-lg"
          >
            {events[currentIndex]}
          </motion.div>
        </AnimatePresence>

        {navigationEnabled && (
          <MdNavigateNext
            className="z-50 text-4xl text-white"
            onClick={handleNext}
          />
        )}
      </div>
    </>
  );
};
