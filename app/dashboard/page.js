"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [buttonVisible, setButtonVisible] = useState(true);
  const checkedOrdersRef = useRef(new Set());
  const soundEnabledRef = useRef(false);
  const audioRef = useRef(null);

  const enableSound = async () => {
    // Enable sound by playing a short silent audio (user interaction)
    if (audioRef.current) {
      try {
        // Just load and prepare the audio
        audioRef.current.load();
        soundEnabledRef.current = true;
        setButtonVisible(false);
        console.log("✅ Sound enabled! Audio will play on next order.");
      } catch (error) {
        console.error("Error enabling sound:", error);
      }
    }
  };

  const handleCheckIn = (orderTimestamp) => {
    console.log("✅ Checking in order:", orderTimestamp);
    checkedOrdersRef.current.add(orderTimestamp);
    console.log(
      "📋 Updated checked orders:",
      Array.from(checkedOrdersRef.current)
    );
    // Force re-render to update UI
    setOrders([...orders]);
  };

  const playNotificationSound = () => {
    // Play the custom alert sound
    console.log(
      "🔊 Attempting to play sound. Enabled:",
      soundEnabledRef.current
    );
    if (audioRef.current && soundEnabledRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    } else {
      console.log("❌ Sound not enabled or audio ref missing");
    }
  };

  const checkForNewOrders = async () => {
    try {
      const response = await fetch("/api/get-orders");
      const data = await response.json();

      if (data.success && data.orders) {
        // Check if there are new orders since last check that haven't been checked in
        const newOrders = data.orders.filter(
          (order) =>
            new Date(order.timestamp).getTime() > lastCheckTime &&
            !checkedOrdersRef.current.has(order.timestamp)
        );

        if (newOrders.length > 0) {
          console.log(
            "🔔 New orders detected! Playing sound...",
            newOrders.length,
            "Checked orders:",
            Array.from(checkedOrdersRef.current)
          );
          playNotificationSound();
          // Show browser notification if permitted
          if (Notification.permission === "granted") {
            new Notification("New Auto Parts Order!", {
              body: `${newOrders.length} new order(s) received`,
              icon: "/favicon.ico",
            });
          }

          // Update last check time only when we find new orders
          setLastCheckTime(Date.now());
        }

        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error checking orders:", error);
    }
  };

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Initial check
    checkForNewOrders();

    // Check for new orders every 5 seconds
    const interval = setInterval(checkForNewOrders, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />

      <div className={styles.header}>
        <h1>📊 Sales Dashboard</h1>
        <div className={styles.headerRight}>
          {buttonVisible && (
            <button onClick={enableSound} className={styles.soundButton}>
              🔊 Enable Sound
            </button>
          )}
          <div className={styles.status}>
            <span className={styles.statusDot}></span>
            Live monitoring
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{orders.length}</div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {
              orders.filter(
                (o) => new Date(o.timestamp).getTime() > Date.now() - 3600000
              ).length
            }
          </div>
          <div className={styles.statLabel}>Last Hour</div>
        </div>
      </div>

      <div className={styles.ordersSection}>
        <h2>Recent Orders</h2>
        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No orders yet. Waiting for customers...</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order, index) => (
              <div
                key={index}
                className={`${styles.orderCard} ${
                  checkedOrdersRef.current.has(order.timestamp)
                    ? styles.checkedIn
                    : ""
                }`}
              >
                <div className={styles.orderHeader}>
                  <span className={styles.orderTime}>
                    {formatDate(order.timestamp)}
                  </span>
                  <div className={styles.orderActions}>
                    {checkedOrdersRef.current.has(order.timestamp) ? (
                      <span className={styles.checkedBadge}>
                        ✓ Acknowledged
                      </span>
                    ) : (
                      <>
                        <span className={styles.orderBadge}>New</span>
                        <button
                          onClick={() => handleCheckIn(order.timestamp)}
                          className={styles.checkInButton}
                        >
                          ✓ Check In
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.orderDetails}>
                  <div className={styles.orderRow}>
                    <span className={styles.orderLabel}>📋 Part:</span>
                    <span className={styles.orderValue}>{order.part}</span>
                  </div>
                  <div className={styles.orderRow}>
                    <span className={styles.orderLabel}>📞 Phone:</span>
                    <span className={styles.orderValue}>{order.phone}</span>
                  </div>
                  <div className={styles.orderRow}>
                    <span className={styles.orderLabel}>🚗 Vehicle:</span>
                    <span className={styles.orderValue}>
                      {order.plateNumber}
                    </span>
                  </div>
                </div>
                {order.vehicleInfo && (
                  <details className={styles.vehicleDetails}>
                    <summary>View Vehicle Details</summary>
                    <pre className={styles.vehicleInfo}>
                      {order.vehicleInfo}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
