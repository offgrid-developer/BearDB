import { useState } from "react";
import { uploadFile } from "../api/upload";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    try {
      const result = await uploadFile(file, description);
      setMessage(`Upload successful: ${result.filename}`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" style={{ padding: "8px", cursor: "pointer" }}>Upload</button>
      {message && <p>{message}</p>}
    </form>
  );
}
