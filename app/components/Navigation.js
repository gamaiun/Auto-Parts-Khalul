"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const tooltipRef = useRef(null);

  const handleClick = (event) => {
    if (event) {
      event.preventDefault();
    }
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (
      ref.current &&
      !ref.current.contains(event.target) &&
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <Link href="/">
        <div className={styles.logoContainer}>
          <div className={styles.textContainer}>
            <h1 className={styles.subtitleBebas}>KHALUL AUTO-PARTS</h1>
            <p className={styles.taglineBebas}>SINCE 1991</p>
          </div>
        </div>
      </Link>
      <div ref={ref} className={styles.fixedMenu}>
        <button className={styles.menuButton} onClick={handleClick}>
          <Image src="/hamburger.svg" alt="Menu" width={45} height={45} />
        </button>
        <div ref={tooltipRef}>
          <div className={`${styles.tooltip} ${isOpen ? styles.open : ""}`}>
            <Link href="/" className={styles.menuItem}>
              <Image src="/cube.svg" alt="Home" width={23} height={23} />
              דף הבית
            </Link>
            <Link href="/about" className={styles.menuItem}>
              <Image src="/cube.svg" alt="About" width={23} height={23} />
              אודות
            </Link>
            <Link href="/oils" className={styles.menuItem}>
              <Image src="/cube.svg" alt="Oils" width={23} height={23} />
              שמנים
            </Link>
            <Link href="/contact" className={styles.menuItem}>
              <Image src="/cube.svg" alt="Contact" width={23} height={23} />
              צור קשר
            </Link>
            <Link href="/gallery" className={styles.menuItem}>
              <Image src="/cube.svg" alt="Gallery" width={23} height={23} />
              גלריה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
