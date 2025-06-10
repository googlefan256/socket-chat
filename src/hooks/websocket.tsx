import { useEffect, useState } from "react";
import {
    ClientMessageSchema,
    ServerMessageSchema,
    safeParse,
    safeSerialize,
    type ServerMessage,
} from "../proto";
import useWebSocket, { ReadyState } from "react-use-websocket";

function currentURL() {
    if (import.meta.env.DEV) {
        return "ws://localhost:3000/ws";
    }
    return `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.host
    }/ws`;
}

export type ConnectionState = "connecting" | "open" | "closed";

export function useWebsocket() {
    const [messages, setMessages] = useState<ServerMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { sendMessage, lastMessage, readyState } = useWebSocket(currentURL());
    const connectionState: ConnectionState =
        readyState === ReadyState.CONNECTING
            ? "connecting"
            : readyState === ReadyState.OPEN
              ? "open"
              : "closed";
    useEffect(() => {
        if (lastMessage !== null) {
            console.log("Received message");
            const newMessage = safeParse(
                ServerMessageSchema,
                JSON.parse(lastMessage.data.toString()),
            );
            if (!newMessage) {
                console.error("Received invalid message:", lastMessage.data);
                return;
            }
            setMessages((prev) => [...prev, newMessage]);
        }
    }, [lastMessage]);

    function submitMessage(username: string, message: string) {
        if (readyState !== ReadyState.OPEN) {
            setError("WebSocket is not connected");
            return;
        }
        if (message.trim() === "") {
            setError("Message cannot be empty");
            return;
        }
        sendMessage(
            safeSerialize(ClientMessageSchema, {
                username,
                message,
                type: "chat",
            }),
        );
        return;
    }
    return [submitMessage, error, connectionState, messages] as const;
}
