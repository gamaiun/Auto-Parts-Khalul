"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import AccordionSection from "./components/AccordionSection";

export default function Home() {
  // Accordion data matching the image
  const accordionItems = [
    {
      id: 1,
      title: "אודות",
      content:
        "ברוכים הבאים לשירות חלקי החילוף שלנו. אנו מציעים מגוון רחב של חלקים למכוניות מכל הסוגים והדגמים.",
      image: "/about-image.jpg", // Add your image path
    },
    {
      id: 2,
      title: "משלוחים מעכשיו לעכשיו",
      content:
        "אנו מתמחים בספק חלפים איכותיים, שירות מהיר ואמין, ומחירים תחרותיים. הצוות המקצועי שלנו זמין לסייע בכל שאלה.",
      image: "/delivery-image.jpg", // Add your image path
    },
    {
      id: 3,
      title: "בקרו אותנו",
      content:
        "השתמש במערכת שלנו כדי לחפש חלקים לפי מספר רכב, לקבל ייעוץ מקצועי, ולהזמין חלפים במהירות ובנוחות.",
      image: "/contact-image.jpg", // Add your image path
    },
  ];

  const [messages, setMessages] = useState([
    {
      id: 0,
      text: "עם למעלה ממיליון חלקי חילוף במלאי, רוב הסיכויים, שיש לנו את מה שאתה מחפש.\n\nמה מספר הרכב החולה?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation helper functions
  const validatePlateNumber = (plate) => {
    const cleaned = plate.replace(/[^0-9]/g, "");
    return cleaned.length >= 7 && cleaned.length <= 8;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    return cleaned.length === 10 && cleaned.startsWith("0");
  };

  const getPlaceholder = () => {
    switch (conversationState) {
      case "WAITING_PLATE":
        return "הקלד מספר רכב (7-8 ספרות)";
      case "WAITING_PART":
        return "איזה חלק אתה מחפש?";
      case "WAITING_PHONE":
        return "הקלד מספר טלפון (05X-XXXXXXX)";
      default:
        return "הקלד הודעה";
    }
  };
  const [conversationState, setConversationState] = useState("WAITING_PLATE"); // WAITING_PLATE, WAITING_PART, WAITING_PHONE, COMPLETE
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleObject, setVehicleObject] = useState(null);
  const [partRequested, setPartRequested] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showCountdown && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (showCountdown && timeLeft === 0) {
      // Show message when countdown reaches 0
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "אנחנו עובדים על זה, ניצור קשר בהקדם",
          sender: "bot",
        },
      ]);
      setShowCountdown(false);
    }
  }, [showCountdown, timeLeft]);

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
          info: `מספר הרכב לא נמצא במאגר משרד הרישוי. נסה שוב:`,
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

    let info = ``;

    if (vehicle.mispar_rechev)
      info += `Plate Number: ${vehicle.mispar_rechev}\n`;
    if (vehicle.tozeret_nm) info += `Manufacturer: ${vehicle.tozeret_nm}\n`;
    if (vehicle.kinuy_mishari) info += `Model: ${vehicle.kinuy_mishari}\n`;
    if (vehicle.shnat_yitzur) info += `Year: ${vehicle.shnat_yitzur}\n`;
    if (vehicle.degem_nm) info += `Version: ${vehicle.degem_nm}\n`;
    if (vehicle.sug_delek_nm) info += `Fuel Type: ${vehicle.sug_delek_nm}\n`;

    return info.trim();
  };

  const handleQuickButton = (partName) => {
    // Simulate user input with the part name
    const userMessage = {
      id: Date.now(),
      text: partName,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setPartRequested(partName);

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
      // Validate plate number
      if (!validatePlateNumber(userInput)) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "מספר רכב לא תקין. אנא הזן 7-8 ספרות.",
            sender: "bot",
          },
        ]);
        return;
      }

      // Show loading indicator
      setIsLoading(true);

      // Fetch vehicle data
      const result = await fetchVehicleData(userInput);

      // Hide loading
      setIsLoading(false);

      // Store plate number and vehicle data
      setPlateNumber(userInput);
      setVehicleData(result.info);
      setVehicleObject(result.vehicle);

      // Show vehicle data
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: result.info,
          sender: "bot",
          isVehicleInfo: result.vehicle ? true : false,
        },
      ]);

      // Ask for the part needed only if vehicle was found
      if (result.vehicle) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 3,
              text: "איזה חלק אנחנו מחפשים?",
              sender: "bot",
              showQuickButtons: true,
            },
          ]);
          setConversationState("WAITING_PART");
        }, 500);
      }
      // If vehicle not found, stay in WAITING_PLATE state so user can try again
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
      // Validate phone number
      if (!validatePhoneNumber(userInput)) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "מספר טלפון לא תקין. אנא הזן מספר תקין (לדוגמה: 052-1234567)",
            sender: "bot",
          },
        ]);
        return;
      }

      // Check if offices are open (Israel time)
      const isOfficeOpen = () => {
        const israelTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Jerusalem",
        });
        const now = new Date(israelTime);
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours + minutes / 60;

        // Closed on Saturday (6)
        if (day === 6) return false;

        // Friday: 8:00-12:00
        if (day === 5) {
          return currentTime >= 8 && currentTime < 12;
        }

        // Sunday-Thursday: 8:00-16:00
        return currentTime >= 8 && currentTime < 16;
      };

      const officeOpen = isOfficeOpen();

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

        if (officeOpen) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: `מצויין!\nברגע זה ממש המחסנאים שלנו הלכו לחפש ${partRequested} עבור ${manufacturer}, ${model}, ${year}.\n\nניצור איתך קשר טלפוני תוך עשרים דקות`,
              sender: "bot",
            },
          ]);
          setShowCountdown(true);
          setTimeLeft(20 * 60); // Reset to 20 minutes
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: `משרדנו סגורים כעת. ההודעה שלך נשלחה לשרות הלקוחות.`,
              sender: "bot",
            },
          ]);
        }
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
    <>
      <div className={styles.container}>
        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage
              }`}
            >
              <div className={styles.messageContent}>
                <p
                  className={styles.messageText}
                  style={{
                    whiteSpace: "pre-line",
                    direction: message.isVehicleInfo ? "ltr" : "rtl",
                    textAlign: message.isVehicleInfo ? "left" : "right",
                  }}
                >
                  {message.text}
                </p>
                {message.showQuickButtons &&
                  conversationState === "WAITING_PART" && (
                    <div className={styles.quickButtons}>
                      <button
                        onClick={() => handleQuickButton("פילטר אוויר")}
                        className={styles.quickButton}
                      >
                        פילטר אוויר
                      </button>
                      <button
                        onClick={() => handleQuickButton("פילטר שמן")}
                        className={styles.quickButton}
                      >
                        פילטר שמן
                      </button>
                      <button
                        onClick={() => handleQuickButton("דיסקיות בלם")}
                        className={styles.quickButton}
                      >
                        דיסקיות בלם
                      </button>
                      <button
                        onClick={() => handleQuickButton("צלחות בלם")}
                        className={styles.quickButton}
                      >
                        צלחות בלם
                      </button>
                      <button
                        onClick={() => handleQuickButton("שמן מנוע")}
                        className={styles.quickButton}
                      >
                        שמן מנוע
                      </button>
                      <button
                        onClick={() => handleQuickButton("חיישן אוויר")}
                        className={styles.quickButton}
                      >
                        חיישן אוויר
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          {showCountdown && (
            <div className={styles.countdownContainer}>
              <div className={styles.countdown}>
                {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.input}
              placeholder={getPlaceholder()}
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

      {/* Accordion Section */}
      <AccordionSection items={accordionItems} />
    </>
  );
}
