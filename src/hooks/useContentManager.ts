"use client";

import { useState, useEffect, useCallback } from "react";

interface UseContentManagerOptions<T> {
  apiPath: string;
  onLoad?: (data: T) => void;
  onSave?: (data: T) => void;
  disabled?: boolean;
  initialData?: T;
}

export function useContentManager<T>({
  apiPath,
  onLoad,
  onSave,
  disabled,
  initialData: providedInitialData,
}: UseContentManagerOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const hasChanges =
    data && initialData ? JSON.stringify(data) !== JSON.stringify(initialData) : false;

  const loadData = useCallback(() => {
    setLoading(true);
    if (disabled || !apiPath) {
      if (providedInitialData) {
        setData(providedInitialData);
        setInitialData(JSON.parse(JSON.stringify(providedInitialData)));
      }
      setLoading(false);
      return;
    }
    fetch(apiPath, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to fetch: ${r.status} ${r.statusText}`);
        }
        // Handle cases where the response might be empty (e.g. 204 No Content)
        return r.text().then((text) => (text ? JSON.parse(text) : {}));
      })
      .then((fetchedData) => {
        console.log("useContentManager: apiPath", apiPath, "fetchedData:", fetchedData);
        if (fetchedData.error) {
          setMsg(`❌ Failed to load content: ${fetchedData.error}`);
        } else {
          // Check if the data is wrapped in a 'json' property, otherwise use the data directly
          const jsonData = fetchedData.json !== undefined ? fetchedData.json : fetchedData;
          setData(jsonData);
          setSha(fetchedData.sha);
          setInitialData(JSON.parse(JSON.stringify(jsonData)));
          if (onLoad) {
            onLoad(jsonData);
          }
        }
      })
      .catch((e) => {
        console.error(e);
        setMsg("❌ Failed to load content.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiPath, onLoad, disabled, providedInitialData]);

  useEffect(() => {
    if (disabled && providedInitialData) {
      setData(providedInitialData);
      setInitialData(JSON.parse(JSON.stringify(providedInitialData)));
    } else if (!disabled && apiPath) {
      loadData();
    }
  }, [loadData, disabled]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(apiPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: data, sha }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("✅ Saved successfully!");
      setInitialData(JSON.parse(JSON.stringify(data))); // Update initial state to new saved state
      if (onSave) {
        onSave(data);
      }
    } catch (e) {
      console.error(e);
      setMsg(`❌ Save failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setData(initialData);
  };

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  return {
    data,
    setData,
    loading,
    saving,
    setSaving,
    msg,
    setMsg,
    hasChanges,
    save,
    handleDiscard,
  };
}
