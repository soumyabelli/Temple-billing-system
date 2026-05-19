import { useEffect, useMemo, useState } from "react";
import banner1 from "../assets/login-banners/banner-1.jpg";
import banner2 from "../assets/login-banners/banner-2.png";
import banner3 from "../assets/login-banners/banner-3.jpeg";


const banners = [banner1, banner2, banner3];

const flowerTypes = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g fill='%23ffffff'><ellipse cx='32' cy='14' rx='8' ry='14'/><ellipse cx='46' cy='22' rx='8' ry='14' transform='rotate(45 46 22)'/><ellipse cx='50' cy='36' rx='8' ry='14' transform='rotate(90 50 36)'/><ellipse cx='32' cy='50' rx='8' ry='14'/><ellipse cx='14' cy='36' rx='8' ry='14' transform='rotate(90 14 36)'/><ellipse cx='18' cy='22' rx='8' ry='14' transform='rotate(45 18 22)'/><circle cx='32' cy='32' r='6' fill='%23f2d27a'/></g></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g fill='%23fffdf9'><path d='M32 38c8-10 16-9 20 0-8 2-13 4-20 12-7-8-12-10-20-12 4-9 12-10 20 0z'/><path d='M32 34c6-10 10-13 14-13-1 7-2 11-14 18-12-7-13-11-14-18 4 0 8 3 14 13z'/><ellipse cx='32' cy='39' rx='5' ry='4' fill='%23f3d06e'/></g></svg>",
];

const SLIDE_MS = 1600;
const HOLD_MS = 4200;

const Background = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isSliding, setIsSliding] = useState(false);

  const flowers = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 5,
        size: 14 + Math.random() * 12,
        type: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
      })),
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((activeIndex + 1) % banners.length);
      setIsSliding(true);
    }, HOLD_MS);

    return () => clearInterval(timer);
  }, [activeIndex]);

  useEffect(() => {
    if (!isSliding) return;
    const doneTimer = setTimeout(() => setIsSliding(false), SLIDE_MS);
    return () => clearTimeout(doneTimer);
  }, [isSliding]);

  const getSlideClass = (index) => {
    if (index === activeIndex) return "translate-x-0 opacity-100 z-20";
    if (isSliding && index === prevIndex) return "translate-x-full opacity-100 z-10";
    return "-translate-x-full opacity-0 z-0";
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {banners.map((image, index) => (
        <img
          key={image}
          src={image}
          alt="Temple banner"
          className={`absolute inset-0 w-full h-full object-cover object-center ${getSlideClass(index)}`}
          style={{
            transitionProperty: "transform, opacity",
            transitionDuration: `${SLIDE_MS}ms`,
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {flowers.map((flower) => (
        <div
          key={flower.id}
          className="absolute top-[-60px] animate-flowerFall z-30"
          style={{
            left: `${flower.left}%`,
            animationDelay: `${flower.delay}s`,
            animationDuration: `${flower.duration}s`,
          }}
        >
          <img
            src={flower.type}
            alt="Flower"
            className="object-contain opacity-95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]"
            style={{ width: `${flower.size}px`, height: `${flower.size}px` }}
          />
        </div>
      ))}
    </div>
  );
};

export default Background;
