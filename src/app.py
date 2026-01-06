"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

# Create a FastAPI application instance with metadata
# This sets up the API with a title and description that will appear in the auto-generated API docs
app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory to serve HTML, CSS, and JavaScript files
# This allows the API to serve the web interface from the /static URL path
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
# This dictionary stores all available extracurricular activities
# Each activity is identified by its name (key) and contains:
# - description: What the activity involves
# - schedule: When the activity takes place
# - max_participants: Maximum number of students allowed
# - participants: List of student email addresses who have signed up
# Note: Data is stored in memory and will be reset when the server restarts
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    }
}


@app.get("/")
def root():
    """
    Root endpoint that redirects to the main web interface.
    When users visit the base URL, they are automatically redirected to the static HTML page.
    """
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    """
    Get all available activities.
    
    Returns a JSON object containing all activities with their details including:
    - Description of the activity
    - Schedule information
    - Maximum participants allowed
    - List of currently registered participants
    
    This endpoint is used by the frontend to display the activity list.
    """
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """
    Sign up a student for an activity.
    
    This endpoint allows students to register for an extracurricular activity.
    
    Args:
        activity_name: The name of the activity to sign up for (from URL path)
        email: Student's email address (from query parameter)
    
    Returns:
        A success message confirming the signup
    
    Raises:
        HTTPException: 404 if the activity doesn't exist
    """
    # Validate activity exists
    # Check if the requested activity is in our database
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    # Retrieve the activity data from the dictionary
    activity = activities[activity_name]

    # Add student to the activity's participant list
    # Append the student's email to track who has signed up
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}
