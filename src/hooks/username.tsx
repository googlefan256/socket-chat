import { useEffect, useState } from "react";

export function useUsername() {
    const [username, setUsername] = useState<string>("");
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            const defaultUsername = `匿名${Math.floor(Math.random() * 1000)}`;
            setUsername(defaultUsername);
            localStorage.setItem("username", defaultUsername);
        }
    }, []);
    const updateUsername = (newUsername: string) => {
        setUsername(newUsername);
        localStorage.setItem("username", newUsername);
    };
    return [username, updateUsername] as const;
}
