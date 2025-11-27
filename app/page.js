"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: "Enter your plate number",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState("WAITING_PLATE"); // WAITING_PLATE, WAITING_PART, WAITING_PHONE, COMPLETE
  const [vehicleData, setVehicleData] = useState(null);
  const [partRequested, setPartRequested] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendTelegramMessage = async (vehicleInfo, part, phone) => {
    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleInfo,
          part,
          phone,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to send Telegram:", data.error);
      }

      return data.success;
    } catch (error) {
      console.error("Error sending Telegram:", error);
      return false;
    }
  };

  const fetchVehicleData = async (plateNumber) => {
    try {
      setIsLoading(true);

      // Use the full resource with all vehicle details (resource 053cea08)
      const apiUrl = `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&limit=5&q=${encodeURIComponent(
        plateNumber
      )}`;

      console.log("Fetching from:", apiUrl);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (
        data.success &&
        data.result &&
        data.result.records &&
        data.result.records.length > 0
      ) {
        // Find exact match for plate number
        const vehicle =
          data.result.records.find(
            (v) =>
              v.mispar_rechev &&
              v.mispar_rechev.toString() === plateNumber.toString()
          ) || data.result.records[0];

        return formatVehicleInfo(vehicle);
      } else {
        return `❌ Sorry, no vehicle found with plate number: ${plateNumber}\n\nPlease check the number and try again.`;
      }
    } catch (error) {
      console.error("API Error:", error);
      return `⚠️ Error fetching vehicle data: ${error.message}\n\nPlease try again later.`;
    } finally {
      setIsLoading(false);
    }
  };

  const formatVehicleInfo = (vehicle) => {
    console.log("Vehicle data:", vehicle);
    console.log("All vehicle fields:", Object.keys(vehicle));

    let info = `🚗 Vehicle Information:\n\n`;

    if (vehicle.mispar_rechev)
      info += `📋 Plate Number: ${vehicle.mispar_rechev}\n`;
    if (vehicle.tozeret_nm) info += `🏭 Manufacturer: ${vehicle.tozeret_nm}\n`;
    if (vehicle.kinuy_mishari) info += `🚙 Model: ${vehicle.kinuy_mishari}\n`;
    if (vehicle.shnat_yitzur) info += `📅 Year: ${vehicle.shnat_yitzur}\n`;
    if (vehicle.degem_nm) info += `🔧 Version: ${vehicle.degem_nm}\n`;
    if (vehicle.tzeva_rechev) info += `🎨 Color: ${vehicle.tzeva_rechev}\n`;
    if (vehicle.ramat_gimur) info += `⭐ Trim Level: ${vehicle.ramat_gimur}\n`;
    if (vehicle.ramat_eivzur_betihuty)
      info += `🛡️ Safety Rating: ${vehicle.ramat_eivzur_betihuty}\n`;
    if (vehicle.sug_delek_nm) info += `⛽ Fuel Type: ${vehicle.sug_delek_nm}\n`;
    if (vehicle.horaat_rishum)
      info += `📝 Registration: ${vehicle.horaat_rishum}\n`;
    if (vehicle.mivchan_acharon_dt)
      info += `🔍 Last Inspection: ${vehicle.mivchan_acharon_dt}\n`;
    if (vehicle.tokef_dt) info += `📅 Valid Until: ${vehicle.tokef_dt}\n`;

    return info.trim();
  };

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue.trim();
    setInputValue("");

    // Handle based on conversation state
    if (conversationState === "WAITING_PLATE") {
      // Show loading message
      const loadingMessage = {
        id: Date.now() + 1,
        text: "🔍 Searching for vehicle data...",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Fetch vehicle data
      const vehicleInfo = await fetchVehicleData(userInput);

      // Store plate number and vehicle data
      setPlateNumber(userInput);
      setVehicleData(vehicleInfo);

      // Replace loading message with actual data
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            text: vehicleInfo,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });

      // Ask for the part needed
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 3,
            text: "What part do you need?",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setConversationState("WAITING_PART");
      }, 1000);
    } else if (conversationState === "WAITING_PART") {
      // Store the part requested
      setPartRequested(userInput);

      // Ask for phone number
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Please provide your phone number so we can contact you:",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setConversationState("WAITING_PHONE");
      }, 500);
    } else if (conversationState === "WAITING_PHONE") {
      // Send Telegram message to salesperson
      const sent = await sendTelegramMessage(
        vehicleData,
        partRequested,
        userInput
      );

      // Confirm the order
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: sent
              ? `✅ Thank you! We have received your request:\n\n📋 Part: ${partRequested}\n📞 Phone: ${userInput}\n\n✉️ Your request has been sent to our sales team via Telegram!\n\nWe will contact you soon!`
              : `✅ Thank you! We have received your request:\n\n📋 Part: ${partRequested}\n📞 Phone: ${userInput}\n\n📝 Your request has been logged. Please configure Telegram to enable notifications.\n\nWe will contact you soon!`,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setConversationState("COMPLETE");
      }, 500);

      // Reset after a few seconds to allow new inquiry
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            text: "Need another part? Enter your plate number:",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setConversationState("WAITING_PLATE");
        setVehicleData(null);
        setPartRequested("");
      }, 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>
            <div className={styles.avatarIcon}>🤖</div>
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.chatName}>Vehicle Info Bot</h2>
            <span className={styles.status}>Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.sender === "user" ? styles.userMessage : styles.botMessage
            }`}
          >
            <div className={styles.messageContent}>
              <p
                className={styles.messageText}
                style={{ whiteSpace: "pre-line" }}
              >
                {message.text}
              </p>
              <span className={styles.messageTime}>{message.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <button className={styles.emojiButton}>😊</button>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={inputValue.trim() === "" || isLoading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
