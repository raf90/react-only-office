import React, { useEffect, useMemo, useRef, useState } from "react";
import { useScript, useEventEmitter } from "./utils/hooks";

export const Context = React.createContext();

const BaseOnlyOffice = ({
  children,
  document,
  documentType,
  editorConfig,
  events,
  height,
  onlyOfficeId,
  scriptUrl,
  token,
  type,
  width,
}) => {
  const config = useMemo(
    () => ({
      document,
      documentType,
      editorConfig,
      events,
      height,
      token,
      type,
      width,
    }),
    [document, documentType, editorConfig, events, height, token, type, width]
  );
  const [ooEditor, setOoEditor] = useState();
  const [loaded] = useScript(scriptUrl);
  const emitDownload = useEventEmitter("onDownloadAs");

  const onDownloadAs = (e) => {
    emitDownload(e.data);
    events.onDownloadAs && events.onDownloadAs(e);
  };
  const getDownloadURL = () => {
    ooEditor.downloadAs();
    return new Promise((resolve) => {
      window.addEventListener("onDownloadAs", (e) => resolve(e.detail), {
        once: true,
      });
    });
  };

  useEffect(() => {
    if (!loaded || !window.DocsAPI) return;
    const newDocument = new window.DocsAPI.DocEditor(onlyOfficeId, {
      ...config,
      events: { ...events, onDownloadAs },
    });
    setOoEditor(newDocument);
    return () => {
      if (newDocument) {
        newDocument.destroyEditor();
      }
    };
  }, [loaded, config, onlyOfficeId]);

  return (
    <Context.Provider value={{ ooEditor, onlyOfficeId, getDownloadURL }}>
      {children}
    </Context.Provider>
  );
};

export default BaseOnlyOffice;
