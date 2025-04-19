
const RestaurantGridError = () => {
  return (
    <div className="text-center py-12 px-4 rounded-lg border border-neutral/10 bg-white/50 backdrop-blur-sm">
      <h3 className="text-xl font-medium mb-2">Error loading restaurants</h3>
      <p className="text-neutral">Please try again later.</p>
    </div>
  );
};

export default RestaurantGridError;
