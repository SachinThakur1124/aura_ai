import { assets } from "@/assets/assets";
import useAppContext from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;
    try {
      e.preventDefault();
      if (!user) return toast.error("Please login to continue");
      if (isLoading)
        return toast.error("Please wait for the current response to finish");
      setIsLoading(true);
      setPrompt("");
      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };
      // saving user prompt to chat array
      setChats((prev) =>
        prev.map((chat) =>
          chat?._id === selectedChat?._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      // saving user prompt to selected chat
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));

      // saving user prompt to mongoDB
      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat?._id,
        prompt,
      });

      if (data.success) {
        setChats((prev) =>
          prev.map((chat) =>
            chat?._id === selectedChat?._id
              ? {
                  ...chat,
                  messages: [...chat.messages, data.data],
                }
              : chat
          )
        );
        // saving response to selected chat
        const message = data.data.content;
        const messagesToken = message.split(" ");
        let assistantMessage = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));
        for (let i = 0; i < messagesToken.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messagesToken.slice(0, i + 1).join(" ");
            setSelectedChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 100);
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages?.length > 0 ? "max-w-3xl" : "max-w-2xl"
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Message AuraAI..."
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
        required
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.deepthink_icon} alt="" className="h-5" />
            AuraThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.search_icon} alt="" className="h-5" />
            Search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Image src={assets.pin_icon} alt="" className="w-4 cursor-pointer" />
          <button
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
              className="w-3.5 aspect-square"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
