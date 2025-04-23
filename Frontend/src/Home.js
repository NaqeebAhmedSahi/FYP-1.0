import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createPage, pageLoad, deletePage } from "./redux/actions/pageAction";
import Header from "../src/components/User/Header";
import axios from "axios";

const Home = () => {
  const [name, setName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const dispatch = useDispatch();

  const { pageStore } = useSelector((state) => state);
  const { pages } = pageStore;

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    dispatch(pageLoad(userId));
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!name) {
      setIsValid(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const websiteId = localStorage.getItem("selectedWebsiteId");
      const userProject = JSON.parse(localStorage.getItem("userProject") || "{}");
      const customPrompt = userProject.customPrompt;

      if (!userId || !websiteId) {
        console.error("User ID or Website ID is undefined");
        return;
      }

      // Create payload that matches backend expectations
      const payload = {
        name: {
          name,       // The page name
          userId      // User ID inside name object (as your backend expects)
        },
        websiteId,    // Website ID at root level
        customPrompt  // Prompt at root level
      };

      console.log("Sending payload:", payload); // Debug log

      await dispatch(createPage(payload));
      setName("");
      setIsValid(true);
    } catch (error) {
      console.error("Page creation failed:", error);
      // Add user feedback here if needed
    }
  };

  const handleDelete = (pageId) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      dispatch(deletePage(pageId));
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      const userId = localStorage.getItem("userId");
      const websiteId = localStorage.getItem("selectedWebsiteId");
      const userProject = JSON.parse(localStorage.getItem('userProject')) || {};
      const prompt = userProject.customPrompt || '';

      if (!userId || !websiteId) {
        console.error("User ID or Website ID is missing");
        return;
      }

      const response = await axios.get("http://localhost:8080/api/home/download", {
        params: { 
          userId, 
          websiteId,
          prompt // Send the prompt to backend
        },
        responseType: "blob", // Important for file downloads
      });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "website_files.zip");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="row py-5">
          <div className="col-md-6 offset-md-3 mb-4">
            <div className="card shadow-lg">
              <div className="card-header text-center bg-primary text-white">
                <h5>Create New Page</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Page Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${isValid ? "" : "is-invalid"}`}
                      id="name"
                      name="name"
                      placeholder="Enter page name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {!isValid && (
                      <div className="invalid-feedback">
                        Please provide a valid name.
                      </div>
                    )}
                  </div>
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setName("")}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Save Page
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex justify-content-end mb-3">
              <button
                onClick={handleDownloadAll}
                className="btn btn-success"
                disabled={isDownloading || pages.length === 0}
              >
                {isDownloading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Downloading...
                  </>
                ) : (
                  "Download All Files (ZIP)"
                )}
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover w-100">

                <thead className="table-primarys">
                  <tr>
                    <th style={{ width: "40%" }}>Name</th>
                    <th style={{ width: "30%" }}>Slug</th>
                    <th style={{ width: "30%" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {pages.length > 0 ? (
                    pages.map((page) => (
                      <tr key={page._id}>
                        {/* <td>{page._id}</td> */}
                        <td>{page.name}</td>
                        <td>{page.slug}</td>
                        <td>
                          <Link
                            to={`/editor/${page._id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(page._id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No pages available. Start by creating one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;