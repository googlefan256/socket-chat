import { useRef, useState } from "react";
import { useUsername } from "./hooks/username";
import { useWebsocket, type ConnectionState } from "./hooks/websocket";

const connectionStateMap: Record<ConnectionState, [string, string]> = {
    connecting: ["接続中", "status-warning"],
    open: ["接続済み", "status-success"],
    closed: ["未接続", "status-error"],
};

function App() {
    const [username, setUsername] = useUsername();
    const [submitMessage, error, connectionState, messages] = useWebsocket();
    const [messageInput, setMessageInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    function getUserColor(username: string) {
        const colors = [
            "bg-error",
            "bg-warning",
            "bg-success",
            "bg-info",
            "bg-primary",
            "bg-secondary",
            "bg-accent",
            "bg-neutral",
        ];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    const handleSendMessage = () => {
        if (connectionState !== "open" || !username || !messageInput.trim()) {
            return;
        }
        submitMessage(username, messageInput);
        setMessageInput("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="h-screen px-6 py-4">
            <div className="navbar bg-base-100 flex items-center justify-between drop-shadow-sm px-4">
                <span className="text-accent-content text-xl">
                    リアルタイムチャット
                </span>
                <div className="flex items-center space-x-2">
                    <div
                        className={`w-3 h-3 rounded-full ${
                            connectionStateMap[connectionState][1]
                        }`}
                    />
                    <span className="text-accent-content">
                        {connectionStateMap[connectionState][0]}
                    </span>
                </div>
            </div>
            <div className="max-w-4xl mx-auto w-full m-4 card bg-base-200 card-border border-base-300">
                <div className="card-body">
                    <p className="card-title">ユーザー名</p>
                    <input
                        type="text"
                        id="username"
                        placeholder="ユーザー名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input input-primary"
                    />
                </div>
            </div>
            <div className="max-w-4xl max-h-[80vh] mx-auto w-full overflow-hidden card bg-base-200 card-border border-base-300">
                <div className="card-body flex flex-col space-y-4">
                    <div className="flex-1 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p>
                                    メッセージがありません。最初のメッセージを送信しましょう！
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message, index) => {
                                    const supIndex = index * 2;
                                    const userColor = getUserColor(
                                        message.username,
                                    );
                                    return (
                                        <div
                                            key={supIndex}
                                            className="flex flex-col"
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span
                                                    className={`inline-block w-3 h-3 rounded-full ${userColor}`}
                                                />
                                                <span className="text-sm font-semibold">
                                                    {message.username}
                                                </span>
                                            </div>
                                            <div className="chat chat-start">
                                                <div className="chat-bubble">
                                                    {message.message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0">
                        <input
                            type="text"
                            placeholder="メッセージを入力..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            className="input input-primary flex-grow"
                            ref={inputRef}
                        />
                        <button
                            className="btn btn-neutral"
                            type="button"
                            onClick={handleSendMessage}
                            disabled={
                                !username ||
                                !messageInput.trim() ||
                                connectionState !== "open"
                            }
                        >
                            送信
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 mx-auto max-w-4xl w-full alert alert-error">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm">
                                <span className="font-medium">エラー:</span>{" "}
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
