"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: "יש לנו למעלה ממיליון חלקי חילוף במלאי. בוא נמצא את החלק שאתה צריך.\n\nמה מספר הרכב שעבורו נדרש החלק?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState("WAITING_PLATE"); // WAITING_PLATE, WAITING_PART, WAITING_PHONE, COMPLETE
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleObject, setVehicleObject] = useState(null);
  const [partRequested, setPartRequested] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playNotificationSound = () => {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Create oscillator for a pleasant notification sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set frequency for a pleasant "ding" sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    // Set volume envelope (fade in and out)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const sendTelegramMessage = async (vehicleInfo, part, phone, plateNumber) => {
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
          plateNumber,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to send Telegram:", data.error);
      }
      // Sound removed from customer side - plays only on dashboard

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

        return { vehicle, info: formatVehicleInfo(vehicle) };
      } else {
        return {
          vehicle: null,
          info: `❌ Sorry, no vehicle found with plate number: ${plateNumber}\n\nPlease check the number and try again.`,
        };
      }
    } catch (error) {
      console.error("API Error:", error);
      return {
        vehicle: null,
        info: `⚠️ Error fetching vehicle data: ${error.message}\n\nPlease try again later.`,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const formatVehicleInfo = (vehicle) => {
    console.log("Vehicle data:", vehicle);
    console.log("All vehicle fields:", Object.keys(vehicle));

    let info = `מידע על הרכב:\n\n`;

    if (vehicle.mispar_rechev)
      info += `📋 Plate Number: ${vehicle.mispar_rechev}\n`;
    if (vehicle.tozeret_nm) info += `🏭 Manufacturer: ${vehicle.tozeret_nm}\n`;
    if (vehicle.kinuy_mishari) info += `🚙 Model: ${vehicle.kinuy_mishari}\n`;
    if (vehicle.shnat_yitzur) info += `📅 Year: ${vehicle.shnat_yitzur}\n`;
    if (vehicle.degem_nm) info += `🔧 Version: ${vehicle.degem_nm}\n`;
    if (vehicle.sug_delek_nm) info += `⛽ Fuel Type: ${vehicle.sug_delek_nm}\n`;

    return info.trim();
  };

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const userInput = inputValue.trim();
    setInputValue("");

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userInput,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    // Handle based on conversation state
    if (conversationState === "WAITING_PLATE") {
      // Show loading message
      const loadingMessage = {
        id: Date.now() + 1,
        text: "🔍 מחפש מידע על הרכב...",
        sender: "bot",
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Fetch vehicle data
      const result = await fetchVehicleData(userInput);

      // Store plate number and vehicle data
      setPlateNumber(userInput);
      setVehicleData(result.info);
      setVehicleObject(result.vehicle);

      // Replace loading message with actual data
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            text: result.info,
            sender: "bot",
          },
        ];
      });

      // Ask for the part needed
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 3,
            text: "איזה חלק אנחנו מחפשים? (מוט הגה, בלמים או משהו אחר?)",
            sender: "bot",
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
            text: "טלפון ליצירת קשר?",
            sender: "bot",
          },
        ]);
        setConversationState("WAITING_PHONE");
      }, 500);
    } else if (conversationState === "WAITING_PHONE") {
      // Send Telegram message to salesperson
      const sent = await sendTelegramMessage(
        vehicleData,
        partRequested,
        userInput,
        plateNumber
      );

      // Confirm the order
      setTimeout(() => {
        const manufacturer = vehicleObject?.tozeret_nm || "";
        const model = vehicleObject?.kinuy_mishari || "";
        const year = vehicleObject?.shnat_yitzur || "";

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: `מצויין!\nאנחנו מחפשים ${partRequested} עבור ${manufacturer}, ${model}, ${year}\n\nההזמנה נשלחה לחנות, ניצור איתך קשר בעשרים דקות הקרובות`,
            sender: "bot",
          },
        ]);
        setConversationState("COMPLETE");
      }, 500);
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
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={conversationState === "COMPLETE"}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={
              inputValue.trim() === "" ||
              isLoading ||
              conversationState === "COMPLETE"
            }
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
