export function GymSwordLogo({
  className = "",
  showText = true,
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/images/GymSwordlogo.png"
        alt="GymSword"
        className="h-8 w-auto object-contain"
      />

      {showText && (
        <span className="font-display text-xl font-bold tracking-luxury">
          GYMSWORD
        </span>
      )}
    </div>
  );
}

export function GymSwordLogoLarge({
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <img
        src="/images/GymSwordlogo.png"
        alt="GymSword"
        className="h-24 w-auto object-contain"
      />

      <span className="font-display text-3xl font-bold tracking-luxury text-white">
        GYMSWORD
      </span>

      <span className="text-overline text-white/70">
        Forge Your Strength
      </span>
    </div>
  );
}