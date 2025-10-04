import React, { useState, useEffect } from "react";

interface VerifiedFieldProps {
  label: string;
  value: any;
  onChange: (newValue: any) => void;
  widget: React.ReactNode;
}

const VerifiedField: React.FC<VerifiedFieldProps> = ({ label, value, onChange, widget }) => {
  const [status, setStatus] = useState<"unconfirmed" | "confirmed" | "nochange">("unconfirmed");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Reset status if field value changes
    setStatus("unconfirmed");
    setTouched(false);
  }, [value]);

  const handleConfirm = () => {
    setStatus("confirmed");
    setTouched(true);
  };

  const handleNoChanges = () => {
    setStatus("nochange");
    setTouched(true);
  };

  const buttonLabel =
    status === "unconfirmed" ? "Confirm" : status === "nochange" ? "No Changes" : "Confirmed";

  const buttonStyle =
    status === "confirmed"
      ? "bg-green-500 text-white"
      : status === "nochange"
        ? "bg-gray-400 text-white"
        : "bg-blue-500 text-white";

  return (
    <div className="mb-6 relative border rounded-md p-3">
      {/* Floating gray label */}
      <div className="absolute -top-2 left-3 bg-gray-100 px-2 text-sm font-semibold">{label}</div>

      {/* Action button */}
      <button
        type="button"
        onClick={status === "unconfirmed" ? handleConfirm : handleNoChanges}
        className={`absolute top-1 right-2 px-3 py-1 text-sm rounded ${buttonStyle}`}
      >
        {buttonLabel}
      </button>

      {/* CMS widget inside */}
      <div className="pt-6">{widget}</div>

      {/* Inline alert */}
      {status === "unconfirmed" && touched && (
        <p className="text-red-500 text-sm mt-2">Please confirm or mark as no changes.</p>
      )}
    </div>
  );
};

export default VerifiedField;
