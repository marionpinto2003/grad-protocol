import { useState } from "react";

const PEANUT_CODE = "279004";
const DESCALER_CODE = "308112";

export default function BookerCodeChallenge({ playerId, onComplete }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const isGupta = playerId === "gupta";
  const requiredCode = isGupta ? PEANUT_CODE : DESCALER_CODE;
  const itemName = isGupta ? "Peanuts" : "Descaler";

  const correct = code.trim() === requiredCode;

  const submit = () => {
    if (correct) {
      onComplete();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1200);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-amber-800/60 rounded-lg bg-black/40 p-4">
        <p className="text-amber-400 text-xs uppercase tracking-widest mb-2">
          Booker Challenge
        </p>

        <p className="text-green-300 text-sm leading-relaxed mb-4">
          Find the {itemName}. Enter its Booker product code to unlock your part of the clue.
        </p>

        <label className="block text-green-500 text-xs mb-1">
          {correct ? "✅" : "☐"} {itemName} Code
        </label>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Booker code"
          className="w-full rounded bg-black border border-green-900 px-3 py-2 text-green-300 outline-none focus:border-green-500"
        />

        {error && (
          <p className="text-red-400 text-xs mt-3">
            ❌ Wrong code. Check the Booker product page.
          </p>
        )}

        {correct && (
          <div className="mt-4 border border-green-500 rounded p-3 bg-green-950/30 text-center">
            <p className="text-green-300 font-bold">🔓 Code Accepted</p>
            <p className="text-green-400 text-xs mt-1">
              {itemName} confirmed. Your clue is unlocked.
            </p>
          </div>
        )}

        <button
          onClick={submit}
          className="mt-4 w-full rounded bg-green-700 px-4 py-2 text-black font-bold hover:bg-green-500 transition"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
