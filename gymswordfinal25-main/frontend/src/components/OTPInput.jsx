import { useRef, useState, useEffect } from "react";

export default function OTPInput({ length = 6, value, onChange, onComplete, disabled }) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value === "") setDigits(Array(length).fill(""));
  }, [value, length]);

  const focusInput = (index) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  };

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newDigits = [...digits];
    // Handle paste or multi-char input
    const chars = val.split("").slice(0, length - index);
    chars.forEach((ch, i) => {
      if (index + i < length) newDigits[index + i] = ch;
    });
    setDigits(newDigits);

    const fullOTP = newDigits.join("");
    onChange(fullOTP);

    // Focus next empty or last
    const nextIndex = Math.min(index + chars.length, length - 1);
    focusInput(nextIndex);

    if (fullOTP.length === length) {
      onComplete?.(fullOTP);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        setDigits(newDigits);
        onChange(newDigits.join(""));
      } else if (index > 0) {
        newDigits[index - 1] = "";
        setDigits(newDigits);
        onChange(newDigits.join(""));
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const newDigits = Array(length).fill("");
    pasted.split("").forEach((ch, i) => { newDigits[i] = ch; });
    setDigits(newDigits);
    onChange(pasted);

    const nextIndex = Math.min(pasted.length, length - 1);
    focusInput(nextIndex);

    if (pasted.length === length) {
      onComplete?.(pasted);
    }
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-14 text-center text-xl font-bold border-[1.5px] transition-all duration-200 focus:outline-none ${
            digit
              ? "border-black bg-black text-white"
              : "border-black/20 bg-white text-black focus:border-black"
          } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-text"}`}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
