"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "./Badge";

interface Props {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
}

export function SearchTagsInput({ tags, onTagsChange, placeholder = "Buscar..." }: Props) {
    const [input, setInput] = useState("");

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = input.trim();
            if (val) {
                if (!tags.includes(val)) {
                    onTagsChange([...tags, val]);
                }
                setInput("");
            }
        } else if (e.key === "Backspace" && !input && tags.length > 0) {
            onTagsChange(tags.slice(0, -1));
        }
    }

    function removeTag(tag: string) {
        onTagsChange(tags.filter((t) => t !== tag));
    }

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-500">
            <Search size={16} className="text-gray-400" />

            {tags.map((tag) => (
                <Badge key={tag} onRemove={() => removeTag(tag)}>
                    {tag}
                </Badge>
            ))}

            <input
                className="flex-1 border-none bg-transparent p-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ""}
            />
            {tags.length > 0 && (
                <button
                    onClick={() => onTagsChange([])}
                    className="text-gray-400 hover:text-gray-600"
                    title="Limpiar todo"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
        </div>
    );
}
