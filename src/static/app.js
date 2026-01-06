// Wait for the DOM (HTML document) to be fully loaded before running our code
// This ensures all HTML elements are available before we try to access them
document.addEventListener("DOMContentLoaded", () => {
  // Get references to important HTML elements we'll need to manipulate
  const activitiesList = document.getElementById("activities-list"); // Container for activity cards
  const activitySelect = document.getElementById("activity"); // Dropdown menu for selecting activities
  const signupForm = document.getElementById("signup-form"); // The signup form
  const messageDiv = document.getElementById("message"); // Area to display success/error messages

  // Function to fetch activities from API
  // This async function retrieves all activities from the backend and displays them
  async function fetchActivities() {
    try {
      // Make an HTTP GET request to the /activities endpoint
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      // Remove the initial "Loading activities..." text
      activitiesList.innerHTML = "";

      // Populate activities list
      // Loop through each activity and create a card to display it
      Object.entries(activities).forEach(([name, details]) => {
        // Create a new div element for each activity card
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        // Calculate how many spots are still available
        // Subtract current participants from maximum capacity
        const spotsLeft = details.max_participants - details.participants.length;

        // Build the HTML content for the activity card
        // Uses template literals (backticks) to insert dynamic values
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Add the activity card to the page
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        // Create an option element for the signup form dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      // Handle any errors that occur during the fetch
      // Display a user-friendly error message and log technical details to console
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  // Add an event listener to intercept the form submission
  signupForm.addEventListener("submit", async (event) => {
    // Prevent the default form submission behavior (which would reload the page)
    event.preventDefault();

    // Get the values entered by the user
    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      // Make a POST request to sign up the student
      // encodeURIComponent ensures special characters are properly encoded in the URL
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      // Parse the JSON response from the server
      const result = await response.json();

      if (response.ok) {
        // If signup was successful (HTTP 200-299 status code)
        messageDiv.textContent = result.message;
        messageDiv.className = "success"; // Apply success styling (green)
        signupForm.reset(); // Clear the form fields
      } else {
        // If there was an error (HTTP 400+ status code)
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error"; // Apply error styling (red)
      }

      // Show the message (remove the 'hidden' class)
      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      // Automatically remove the message to keep the UI clean
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      // Handle network errors or other unexpected issues
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  // Start the application by loading all activities from the server
  fetchActivities();
});
