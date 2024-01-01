"use client";

import { useState } from "react";
import { useSocket } from "./context/socketProvider";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-[#fff] text-center">
          All Messages will Appear Here
        </h1>
        <div>
          {messages.map((msg) => (
            <h3 className="text-2xl font-bold text-[#fff]" key={msg}>{msg}</h3>
          ))}
        </div>
      </div>
      <form className="w-[100vw] fixed bottom-10 flex justify-center items-center gap-[1rem]">
        <input
          className="border-[2px] border-[#fff] rounded-[15px] p-[0.5rem] bg-[#000] text-[#fff]"
          type="text"
          placeholder="Enter a Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            sendMessage(message);
            setMessage("");
          }}
          className="text-[#fff] border-[2px] p-[0.5rem] rounded-[15px]"
          type="submit"
        >
          Send
        </button>
      </form>
    </>
  );
}
