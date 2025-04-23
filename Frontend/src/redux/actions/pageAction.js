import axios from "axios";
import { API_HOST } from "../../api_utils";

export const TYPES = {
  LIST_PAGE_REQUEST_SEND: "LIST_PAGE_REQUEST_SEND",
  LIST_PAGE_REQUEST_ERROR: "LIST_PAGE_REQUEST_ERROR",
  LIST_PAGE_REQUEST_SUCCESS: "LIST_PAGE_REQUEST_SUCCESS",

  CREATE_PAGE_REQUEST: "CREATE_PAGE_REQUEST",
  CREATE_PAGE_ERROR: "CREATE_PAGE_ERROR",
  CREATE_PAGE_SUCCESS: "CREATE_PAGE_SUCCESS",

  DELETE_PAGE_REQUEST: "DELETE_PAGE_REQUEST",
  DELETE_PAGE_ERROR: "DELETE_PAGE_ERROR",
  DELETE_PAGE_SUCCESS: "DELETE_PAGE_SUCCESS",
};

// Update the pageLoad action

  export const pageLoad = () => async (dispatch) => {
    dispatch({ type: TYPES.LIST_PAGE_REQUEST_SEND });
    try {
      // Retrieve userId, websiteId and prompt from local storage
      const userId = localStorage.getItem('userId');
      const websiteId = localStorage.getItem('selectedWebsiteId');
      const userProject = JSON.parse(localStorage.getItem('userProject')) || {};
      const prompt = userProject.customPrompt;
  
      if (!userId || !websiteId) {
        throw new Error("User ID or Website ID is undefined");
      }
  
      // Fetch pages with userId, websiteId and prompt as query parameters
      const response = await axios.get(`${API_HOST}pages/`, { 
        params: { 
          userId, 
          websiteId,
          prompt 
        } 
      });
      dispatch({ type: TYPES.LIST_PAGE_REQUEST_SUCCESS, data: response.data });
    } catch (error) {
      dispatch({ type: TYPES.LIST_PAGE_REQUEST_ERROR, error: error.message });
      console.error("Error loading pages:", error);
    }
  };




  export const createPage = (pageData) => async (dispatch) => {
    dispatch({ type: TYPES.CREATE_PAGE_REQUEST });
    try {
      const response = await axios.post(`${API_HOST}pages/`, pageData);
      dispatch({ type: TYPES.CREATE_PAGE_SUCCESS, data: response.data });
      dispatch(pageLoad()); // Refresh the list
      return response.data; // Return the created page data
    } catch (error) {
      console.error("Detailed creation error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      dispatch({ 
        type: TYPES.CREATE_PAGE_ERROR, 
        error: error.response?.data?.message || error.message 
      });
      throw error; // Re-throw to handle in component
    }
  };

export const deletePage = (pageId) => async (dispatch) => {
  dispatch({ type: TYPES.DELETE_PAGE_REQUEST });
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error("User ID is undefined");
    }

    // Simple DELETE request with userId as query parameter
    await axios.delete(`${API_HOST}home/deletePage/${pageId}`, {
      params: { userId }
    });

    dispatch({ type: TYPES.DELETE_PAGE_SUCCESS, data: pageId });
    dispatch(pageLoad()); // Refresh the page list
  } catch (error) {
    dispatch({ 
      type: TYPES.DELETE_PAGE_ERROR, 
      error: error.response?.data?.message || error.message 
    });
  }
};