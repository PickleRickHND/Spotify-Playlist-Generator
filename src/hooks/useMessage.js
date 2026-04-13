import { useCallback, useEffect, useRef, useState } from "react";

export default function useMessage() {
  const [message, setMessage] = useState({ text: "", type: "" });
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showMessage = useCallback((text, type) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage({ text, type });
    timeoutRef.current = setTimeout(() => {
      setMessage({ text: "", type: "" });
      timeoutRef.current = null;
    }, 4000);
  }, []);

  return { message, showMessage };
}
