import "./Toast.css";

export default function Toast({ message }) {
  return (
    <div
      className="MessageRegion"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message.text ? (
        <div className={`Toast Toast--${message.type}`} role="alert">
          {message.text}
        </div>
      ) : null}
    </div>
  );
}
