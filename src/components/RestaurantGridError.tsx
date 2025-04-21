
const RestaurantGridError = () => {
  return (
    <div className="text-center py-12 px-4 rounded-2xl border border-border bg-card/80 backdrop-blur-lg">
      <h3 className="text-xl font-medium mb-2 text-card-foreground">Error loading restaurants</h3>
      <p className="text-muted-foreground">Please try again later.</p>
    </div>
  );
};

export default RestaurantGridError;
