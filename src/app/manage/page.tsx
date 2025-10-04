"use client";
import { useState, useEffect } from "react";

export default function ManagePage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/content/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));
  }, []);

  if (!settings) return <p>Loading settings...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Site Settings</h1>
      <p><strong>Business Name:</strong> {settings.businessName}</p>
      <p><strong>Address:</strong> {settings.address}</p>
      <p><strong>Email:</strong> {settings.email}</p>
    </div>
  );
}
