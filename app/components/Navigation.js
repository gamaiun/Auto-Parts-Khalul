"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        // Past 100px - hide navigation
        setIsVisible(false);
      } else {
        // At the top - show navigation
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className={`${styles.wrapper} ${!isVisible ? styles.hidden : ""}`}>
      <Link href="/">
        <div className={styles.logoContainer}>
          <div className={styles.textContainer}>
            <h1 className={styles.subtitleBebas}>KHALUL AUTO-PARTS</h1>
            <p className={styles.taglineBebas}>SINCE 1991</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
