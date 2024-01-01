"use client";
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { io } from "socket.io-client";

interface SocketProviderProps {
  children: ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: String) => any;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`State is Undefined`);
  return state;
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const sendMessage: ISocketContext["sendMessage"] = useCallback((msg) => {
    console.log("Send Message", msg);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");

    return () => {
      _socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
