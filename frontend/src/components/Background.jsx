import templeImg from "../assets/temple.jpg.png";

const bellImage = "data:image/jpeg;base64,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";

const flowers = Array.from({ length: 26 });
const flowerTypes = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g fill='%23ffffff'><ellipse cx='32' cy='14' rx='8' ry='14'/><ellipse cx='46' cy='22' rx='8' ry='14' transform='rotate(45 46 22)'/><ellipse cx='50' cy='36' rx='8' ry='14' transform='rotate(90 50 36)'/><ellipse cx='32' cy='50' rx='8' ry='14'/><ellipse cx='14' cy='36' rx='8' ry='14' transform='rotate(90 14 36)'/><ellipse cx='18' cy='22' rx='8' ry='14' transform='rotate(45 18 22)'/><circle cx='32' cy='32' r='6' fill='%23f2d27a'/></g></svg>",
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g fill='%23fffdf9'><path d='M32 38c8-10 16-9 20 0-8 2-13 4-20 12-7-8-12-10-20-12 4-9 12-10 20 0z'/><path d='M32 34c6-10 10-13 14-13-1 7-2 11-14 18-12-7-13-11-14-18 4 0 8 3 14 13z'/><ellipse cx='32' cy='39' rx='5' ry='4' fill='%23f3d06e'/></g></svg>"
];

const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <img
        src={templeImg}
        alt="Temple"
        className="w-full h-full object-cover brightness-105 saturate-110"
      />

      <div className="absolute inset-0 bg-black/35"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 via-transparent to-amber-900/20"></div>

      

      {flowers.map((_, index) => (
        <div
          key={index}
          className="absolute top-[-60px] animate-flowerFall z-30"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        >
          <img
            src={flowerTypes[Math.floor(Math.random() * flowerTypes.length)]}
            alt="White flower"
            className="w-5 h-5 md:w-6 md:h-6 object-contain opacity-95 drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]"
          />
        </div>
      ))}
    </div>
  );
};

export default Background;
