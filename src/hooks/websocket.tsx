import { useEffect, useState } from "react";
import {
    ClientMessageSchema,
    ServerMessageSchema,
    safeParse,
    safeSerialize,
    type ServerMessage,
} from "../proto";

function currentURL() {
    return `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.host
    }/ws`;
}

export type ConnectionState = "connecting" | "open" | "closed";

export function useWebsocket() {
    const [websocket, setWebsocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<ServerMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [connectionState, setConnectionState] =
        useState<ConnectionState>("connecting");
    useEffect(() => {
        const ws = new WebSocket(currentURL());
        setWebsocket(ws);

        ws.onmessage = (event) => {
            const newMessage = safeParse(
                ServerMessageSchema,
                JSON.parse(event.data.toString()),
            );
            if (!newMessage) {
                console.error("Received invalid message:", event.data);
                return;
            }
            setMessages((prev) => [...prev, newMessage]);
        };
        ws.onopen = () => {
            setConnectionState("open");
            setError(null);
        };
        ws.onerror = (error) => {
            setError(`WebSocket error: ${String(error)}`);
            setConnectionState("closed");
            setWebsocket(null);
        };

        return () => {
            ws.close();
        };
    }, []);

    function submitMessage(username: string, message: string) {
        if (!websocket || websocket.readyState !== WebSocket.OPEN) {
            setError("WebSocket is not connected");
            return;
        }
        if (message.trim() === "") {
            setError("Message cannot be empty");
            return;
        }
        websocket.send(
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
