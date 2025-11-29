"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./AccordionSection.module.css";

const AccordionSection = ({ items }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleSection = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.accordionContainer}>
      {items.map((item) => {
        const isExpanded = expandedId === item.id;

        return (
          <AccordionItem
            key={item.id}
            item={item}
            isExpanded={isExpanded}
            onClick={() => toggleSection(item.id)}
          />
        );
      })}
    </div>
  );
};

const AccordionItem = ({ item, isExpanded, onClick }) => {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item.content]);

  return (
    <div
      className={`${styles.accordionItem} ${isExpanded ? styles.expanded : ""}`}
      onClick={onClick}
    >
      <div className={styles.accordionHeader}>
        <div className={styles.numberBadge}>{item.id}</div>
        <div className={styles.title}>{item.title}</div>
      </div>

      <div
        className={styles.accordionContent}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0",
        }}
      >
        <div ref={contentRef} className={styles.contentInner}>
          {item.image && (
            <div className={styles.imageWrapper}>
              <Image
                src={item.image}
                alt={item.title}
                width={300}
                height={200}
                className={styles.contentImage}
              />
            </div>
          )}
          {item.content}
        </div>
      </div>
    </div>
  );
};

export default AccordionSection;
