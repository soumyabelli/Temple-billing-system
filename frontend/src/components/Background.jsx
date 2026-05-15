const Background = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <img
        src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da"
        alt="Temple"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/60"></div>
    </div>
  );
};

export default Background;