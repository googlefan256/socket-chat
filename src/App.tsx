import { useRef, useState } from "react";
import { useUsername } from "./hooks/username";
import { useWebsocket, type ConnectionState } from "./hooks/websocket";

const connectionStateMap: Record<ConnectionState, [string, string]> = {
    connecting: ["接続中", "bg-yellow-500"],
    open: ["接続済み", "bg-green-500"],
    closed: ["未接続", "bg-red-500"],
};

function App() {
    const [username, setUsername] = useUsername();
    const [submitMessage, error, connectionState, messages] = useWebsocket();
    const [messageInput, setMessageInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    function getUserColor(username: string) {
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-teal-500",
            "bg-orange-500",
            "bg-red-500",
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
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white shadow-sm border-b p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        リアルタイムチャット
                    </h1>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                connectionStateMap[connectionState][1]
                            }`}
                        />
                        <span
                            className={`text-sm font-medium ${connectionStateMap[connectionState][1]}`}
                        >
                            {connectionStateMap[connectionState][0]}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
                <div className="flex-1 p-4 overflow-hidden max-h-[calc(100vh-280px)]">
                    <div className="bg-white rounded-lg shadow-sm border h-full p-4 flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
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
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {message.username}
                                                    </span>
                                                </div>
                                                <div className="flex">
                                                    <div
                                                        className={`${userColor} text-white px-4 py-2 rounded-lg rounded-tl-sm max-w-md shadow-sm`}
                                                    >
                                                        {message.message}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            id="username"
                            placeholder="ユーザー名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                        />
                        <input
                            type="text"
                            id="messageInput"
                            placeholder="メッセージを入力..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            ref={inputRef}
                        />
                        <button
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors *:duration-200 disabled:opacity-50"
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
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-auto max-w-4xl w-full">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
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
