import { useState, useEffect } from "react";
import io from "socket.io-client";

type Choice = "rock" | "paper" | "scissors";

const choices: Choice[] = ["rock", "paper", "scissors"];

const socket = io("http://localhost:4000");

const App: React.FC = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string>("");

  const handleChoice = (choice: Choice) => {
    setPlayerChoice(choice);
    socket.emit("playerChoice", choice);
  };

  useEffect(() => {
    socket.on(
      "gameResult",
      (data: { opponentChoice: Choice; result: string }) => {
        setOpponentChoice(data.opponentChoice);
        setResult(data.result);
      }
    );

    socket.on("waitingForOpponent", () => {
      console.log("Waiting");
    });

    return () => {
      socket.off("gameResult");
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Rock Paper Scissors</h1>
      <div className="mt-4">
        {choices.map((choice) => (
          <button
            key={choice}
            className="m-2 p-2 bg-blue-500 text-white rounded"
            onClick={() => handleChoice(choice)}
          >
            {choice.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {playerChoice && <p>Your choice: {playerChoice.toUpperCase()}</p>}
        {opponentChoice && (
          <p>Opponent's choice: {opponentChoice.toUpperCase()}</p>
        )}
        {result && <p>{result}</p>}
      </div>
    </div>
  );
};

export default App;
