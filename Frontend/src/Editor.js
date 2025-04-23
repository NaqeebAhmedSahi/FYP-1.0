import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_HOST } from "./api_utils";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import geditorConfig from "./api_utils/geditor_config";
import PageSection from "./components/PageSection";

const Editor = () => {
  const [editor, setEditor] = useState(null);
  const [assets, setAssets] = useState([]);
  const { pageId } = useParams(); // Get pageId from URL

  const { pageStore } = useSelector((state) => state);
  const { pages } = pageStore;

  useEffect(() => {
    async function getAllAssets() {
      try {
        const response = await axios.get(`${API_HOST}assets/`);
        // console.log("Assests ",response.data);
        setAssets(response.data);
      } catch (error) {
        setAssets(error.message);
      }
    }

    getAllAssets();
  }, []);

  useEffect(() => {
    console.log("Initializing editor with pageId:", pageId);
    const initializeEditor = async () => {
      const editorInstance = await geditorConfig(assets, pageId);
      console.log("Editor", editorInstance);
      setEditor(editorInstance);
    };
    initializeEditor();
  }, [pageId, assets]);

  const logEditorData = async () => {
    if (editor) {
      const editorData = {
        "mycustom-html": editor.getHtml(),
        "mycustom-components": JSON.stringify(editor.getComponents()),
        "mycustom-assets": JSON.stringify(editor.AssetManager.getAll()),
        "mycustom-css": editor.getCss(),
        "mycustom-styles": JSON.stringify(editor.getStyle())
      };

      try {
        console.log("Saving content for pageId:", pageId);
        const response = await axios.put(
          `http://localhost:8080/api/home/save/${pageId}`,
          {
            content: editorData
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Content saved successfully:", response.data);
        alert('Page content saved successfully!');
      } catch (error) {
        console.error("Error saving content:", error);
        alert(`Error saving content: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log("Editor not initialized yet");
    }
  };

  return (
    <div className="App">
      <div
        id="navbar"
        className="sidenav d-flex flex-column overflow-scroll position-fixed"
      >
        <nav className="navbar navbar-light">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h3 logo">GrapeJS Editor:</span>
          </div>
        </nav>
        <PageSection pages={pages} />
        <Sidebar />
      </div>
      <div
        className="main-content position-relative w-85 start-15"
        id="main-content"
      >
        <TopNav />
        <div id="editor"></div>
        
        <button 
          onClick={logEditorData}
          disabled={!editor}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 15px',
            backgroundColor: editor ? '#007bff' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: editor ? 'pointer' : 'not-allowed',
            zIndex: 1000
          }}
        >
          Save Page Content
        </button>
      </div>
    </div>
  );
};

export default Editor;