import React, { useState } from "react";
import { Modal, Button, ProgressBar } from "react-bootstrap";
import axios from "axios";

export default function ImageUploadComponent() {
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.match("image.*")) {
        setError("Please select an image file (JPEG, PNG, GIF)");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadProgress(0);
      setSuccess("");
      
      const response = await axios.post("http://localhost:8080/api/images/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Image uploaded successfully!");
      console.log("Upload response:", response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
      console.error("Upload error:", err);
    }
  };

  const closeModal = () => {
    setFile(null);
    setPreview("");
    setUploadProgress(0);
    setError("");
    setSuccess("");
    setShow(false);
  };

  return (
    <div className="my-2">
      <Button variant="primary" onClick={() => setShow(true)}>
        <i className="fa fa-upload"></i> Upload Image
      </Button>

      <Modal show={show} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
            />
            {error && <div className="text-danger mt-2">{error}</div>}
            {success && <div className="text-success mt-2">{success}</div>}
          </div>

          {preview && (
            <div className="mb-3">
              <h6>Preview:</h6>
              <img
                src={preview}
                alt="Preview"
                className="img-thumbnail"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}

          {uploadProgress > 0 && (
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress}%`}
              className="mt-3"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}