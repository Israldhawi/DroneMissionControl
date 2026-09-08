# Drone Mission Control - Test Cases

## Authentication

### TC-01 -- Successful admin login
Given: A valid admin email and password.
When: The user submits the login form.
Then: The user is authenticated and redirected to the dashboard.

### TC-02 -- Invalid login
Given: An incorrect email or password.
When: The user submits the login form.
Then: Login fails and an error message is displayed.

### TC-03 -- Logout
Given: An authenticated user.
When: The user clicks Logout.
Then: The authentication token and user session are removed.

## Missions

### TC-04 -- Create valid mission
Given: Valid mission details and an active pilot.
When: The user creates the mission.
Then: The mission is created successfully.

### TC-05 -- Required mission fields
Given: One or more required mission fields are empty.
When: The user submits the form.
Then: Field validation errors are displayed.

### TC-06 -- Invalid mission duration
Given: A duration below 1, above 120, or not a whole number.
When: The mission is submitted.
Then: The mission is rejected with a duration validation error.

### TC-07 -- Invalid battery values
Given: Battery values outside 0-100 or batteryEnd greater than or equal to batteryStart.
When: The mission is submitted.
Then: The mission is rejected with a battery validation error.

### TC-08 -- Edit mission
Given: An editable mission.
When: The user changes valid mission information and saves.
Then: The mission is updated successfully.

### TC-09 -- Completed mission cannot be edited
Given: A completed mission.
When: The user attempts to edit it.
Then: Editing is not allowed.

### TC-10 -- Aborted mission cannot be edited
Given: An aborted mission.
When: The user attempts to edit it.
Then: Editing is not allowed.

## Mission Search, Filters and Pagination

### TC-11 -- Search missions
Given: Existing missions with searchable titles or locations.
When: The user enters a search term.
Then: Matching missions are displayed.

### TC-12 -- Filter by status
Given: Missions with different statuses.
When: The user selects a status filter.
Then: Only missions with that status are displayed.

### TC-13 -- Filter by pilot
Given: Missions belonging to different pilots.
When: The user selects a pilot.
Then: Only that pilot's missions are displayed.

### TC-14 -- Filter by date range
Given: Missions on different dates.
When: The user selects a date-from and date-to range.
Then: Only missions within the selected range are displayed.

### TC-15 -- Sort missions by date
Given: Multiple missions with different scheduled dates.
When: The user changes the date sort order.
Then: Missions are displayed in the selected order.

### TC-16 -- Sort missions by duration
Given: Multiple missions with different durations.
When: The user changes the duration sort order.
Then: Missions are displayed in the selected order.

### TC-17 -- Server-side pagination
Given: More than 10 missions.
When: The user changes the page.
Then: The correct page of missions is loaded with 10 missions per page.

### TC-18 -- Pagination survives refresh
Given: The user is viewing a page other than page 1.
When: The browser is refreshed.
Then: The same page number remains selected.

## Mission Details and Status

### TC-19 -- View mission details
Given: An existing mission.
When: The user opens the mission.
Then: Mission information, battery usage and timeline information are displayed.

### TC-20 -- Unknown mission
Given: A mission ID that does not exist.
When: The user opens that mission URL.
Then: A not-found error is displayed.

### TC-21 -- Start planned mission
Given: A mission with status planned.
When: The user starts the mission.
Then: Its status changes to in_progress.

### TC-22 -- Complete in-progress mission
Given: An in-progress mission whose scheduled time has arrived.
When: The user completes the mission.
Then: Its status changes to completed.

### TC-23 -- Abort mission with valid reason
Given: A planned or in-progress mission.
When: The user aborts it with a reason of at least 10 characters.
Then: The mission changes to aborted.

### TC-24 -- Reject invalid abort reason
Given: A planned or in-progress mission.
When: The user attempts to abort it with fewer than 10 characters.
Then: The abort request is rejected.

### TC-25 -- Reject future mission completion
Given: A mission scheduled in the future.
When: The user attempts to mark it completed.
Then: The request is rejected.

### TC-26 -- Reject invalid status transition
Given: A mission with a status that does not allow the requested next status.
When: The user attempts the invalid transition.
Then: The request is rejected.

## Pilots

### TC-27 -- View pilots
Given: An authenticated user.
When: The user opens the Pilots page.
Then: Registered pilots and their mission counts are displayed.

### TC-28 -- Add pilot
Given: An admin and valid pilot information.
When: The admin creates a pilot.
Then: The pilot is created successfully.

### TC-29 -- Edit pilot
Given: An existing pilot.
When: An admin edits the pilot information.
Then: The pilot information is updated.

### TC-30 -- Deactivate pilot
Given: An active pilot.
When: An admin deactivates the pilot.
Then: The pilot becomes inactive.

### TC-31 -- Activate pilot
Given: An inactive pilot.
When: An admin activates the pilot.
Then: The pilot becomes active.

### TC-32 -- Duplicate pilot email
Given: An email already belonging to a pilot.
When: An admin creates another pilot with that email.
Then: The request is rejected with a duplicate email error.

### TC-33 -- Duplicate pilot license
Given: A license number already belonging to a pilot.
When: An admin creates another pilot with that license.
Then: The request is rejected with a duplicate license error.

### TC-34 -- Reject inactive pilot assignment
Given: An inactive pilot.
When: A new mission is assigned to that pilot.
Then: The mission is rejected.

### TC-35 -- Reject overlapping missions
Given: A pilot already has a mission scheduled during a specific time period.
When: Another mission for the same pilot overlaps that period.
Then: The new mission is rejected.

## Dashboard

### TC-36 -- Dashboard mission totals
Given: Existing mission data.
When: The user opens the dashboard.
Then: Total missions and status counts are displayed.

### TC-37 -- Dashboard flight time and battery
Given: Missions with duration and battery data.
When: The user opens the dashboard.
Then: Total flight time and average battery used are displayed.

### TC-38 -- Dashboard top pilots
Given: Missions assigned to multiple pilots.
When: The user opens the dashboard.
Then: The top three pilots by mission count are displayed.

### TC-39 -- Dashboard status chart
Given: Missions with different statuses.
When: The user opens the dashboard.
Then: A chart visualizes the mission status counts.

## Theme and Error Handling

### TC-40 -- Theme persistence
Given: The user changes the application theme.
When: The page is refreshed.
Then: The selected theme remains active.

### TC-41 -- API error and retry
Given: The application cannot retrieve requested data.
When: The request fails.
Then: An error message and retry option are displayed without an endless loading state.
