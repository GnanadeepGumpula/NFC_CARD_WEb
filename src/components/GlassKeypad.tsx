import { motion } from "framer-motion";
import { Delete } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
};

export function GlassKeypad({ value, onChange, maxLength = 4 }: Props) {
  const press = (k: string) => {
    if (k === "del") return onChange(value.slice(0, -1));
    if (value.length < maxLength) onChange(value + k);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* dots */}
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length: maxLength }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i < value.length ? 1.15 : 1,
              backgroundColor:
                i < value.length
                  ? "oklch(0.85 0.2 200)"
                  : "oklch(1 0 0 / 0.18)",
              boxShadow:
                i < value.length
                  ? "0 0 16px oklch(0.85 0.2 200 / 0.8)"
                  : "none",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="h-3.5 w-3.5 rounded-full"
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {keys.map((k, i) => {
          if (k === "")
            return <div key={i} aria-hidden className="" />;
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => press(k)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="glass focus-ring-tv aspect-square rounded-2xl font-display font-medium text-2xl sm:text-3xl text-foreground/95 hover:bg-white/15 transition-colors flex items-center justify-center"
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              }}
            >
              {k === "del" ? <Delete className="w-6 h-6" /> : k}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
