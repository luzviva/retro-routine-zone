import { useEffect, useState } from "react";

interface FeedbackModalProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ message, isVisible, onClose }: FeedbackModalProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-300 z-50">
      <div className="text-center text-white p-8 rounded-lg">
        <p 
          className="text-5xl font-bold text-yellow-300" 
          style={{ textShadow: '3px 3px 0px #000' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};