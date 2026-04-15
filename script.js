//Remember to run browserify script.js -o bundle.js when you are done writing your script.js!

//___________________
// Volunteer Hours Tracker.
//___________________

// Temporary Storage Object
let volunteerData = {};

// Validation Function
function validateVolunteerForm(fields) {
    const errors = [];

    // Charity Name
    if (!fields.charityName || fields.charityName.trim() === "") {
        errors.push({ field: "charityName", message: "Charity Name is required." });
    }

    // Hours volunteered
    const hours = Number(fields.hoursVolunteered);
    if (isNaN(hours) || hours <= 0) {
        errors.push({ field: "hoursVolunteered", message: "Hours Volunteered must be a positive number." });
    }

    // Date
    if (!fields.volunteerDate) {
        errors.push({ field: "volunteerDate", message: "Date is required." });
    }

    // Experience rating
    const rating = Number(fields.experienceRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        errors.push({
            field: "experienceRating",
            message: "Experience Rating must be between 1 and 5."
        });
    }

    return errors;
}

// Data Processing Function
function processVolunteerData(fields) {
    return {
        id: crypto.randomUUID(),
        charityName: fields.charityName.trim(),
        hoursVolunteered: Number(fields.hoursVolunteered),
        volunteerDate: fields.volunteerDate,
        experienceRating: Number(fields.experienceRating)
    };
}

// Save entry to localStorage
function saveVolunteerDataToStorage(data) {
    const stored = JSON.parse(localStorage.getItem("volunteerLogs")) || [];
    stored.push(data);
    localStorage.setItem("volunteerLogs", JSON.stringify(stored));
}

// Add a row with delete button
function addVolunteerRow(entry) {
    const tbody = document.getElementById("volunteerTableBody");

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${entry.charityName}</td>
        <td>${entry.hoursVolunteered}</td>
        <td>${entry.volunteerDate}</td>
        <td>${entry.experienceRating}</td>
        <td>
            <button type="button" class="delete-volunteer" data-id="${entry.id}">Delete</button>
        </td>
    `;

    tbody.appendChild(row);
}

// Load saved data on startup
function loadVolunteerDataFromStorage() {
    let stored = JSON.parse(localStorage.getItem("volunteerLogs")) || [];

    // Ensure all entries have IDs
    let updated = false;
    stored = stored.map(entry => {
        if (!entry.id) {   // older entries missing ID
            entry.id = crypto.randomUUID();
            updated = true;
        }
        return entry;
    });

    // Save entries back if changed
    if (updated) {
        localStorage.setItem("volunteerLogs", JSON.stringify(stored));
    }

    // Render table rows
    stored.forEach(entry => addVolunteerRow(entry));
}

// Calculate total hours
function calculateTotalHours() {
    const stored = JSON.parse(localStorage.getItem("volunteerLogs")) || [];
    return stored.reduce((sum, entry) => sum + Number(entry.hoursVolunteered), 0);
}

// Update summary text
function updateTotalHours() {
    document.getElementById("totalVolunteerHours").textContent = calculateTotalHours();
}

// Delete a single entry
function deleteVolunteerEntry(id) {
    let stored = JSON.parse(localStorage.getItem("volunteerLogs")) || [];

    // Remove object from stored data
    stored = stored.filter(entry => entry.id !== id);
    localStorage.setItem("volunteerLogs", JSON.stringify(stored));

    // Remove row from table
    const deleteBtn = document.querySelector(`button[data-id="${id}"]`);
    if (deleteBtn) {
        deleteBtn.closest("tr").remove();
    }

    updateTotalHours();
}

// Listen for delete button clicks
if (typeof window !== "undefined") {
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-volunteer")) {
            deleteVolunteerEntry(event.target.dataset.id);
        }
    });
}

// Volunteer submission handler
function handleVolunteerFormSubmit(event) {
    event.preventDefault();

    // Collect values from DOM
    const fields = {
        charityName: document.getElementById("charityName-vol").value,
        hoursVolunteered: document.getElementById("hoursVolunteered-vol").value,
        volunteerDate: document.getElementById("volunteerDate-vol").value,
        experienceRating: document.getElementById("experienceRating-vol").value
    };

    // Clear previous error messages
    document.querySelectorAll(".error-msg").forEach(span => span.textContent = "");

    // Validate form fields
    const errors = validateVolunteerForm(fields);

    if (errors.length > 0) {
        // Place each error into its respective <span>
        errors.forEach(err => {
            const errorSpan = document.getElementById(`error-${err.field}-vol`);
            if (errorSpan) {
                errorSpan.textContent = err.message;
            }
        });
        return; // Does not continue if invalid
    }

    const processed = processVolunteerData(fields);

    saveVolunteerDataToStorage(processed);
    addVolunteerRow(processed);
    updateTotalHours();

    alert("Volunteer hours submitted!");
    document.getElementById("section-2").reset();
}

// Event listener
if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("section-2");
        if (form) {
            form.addEventListener("submit", handleVolunteerFormSubmit);
        }

        loadVolunteerDataFromStorage();
        updateTotalHours();
    });
}

//___________________
// Feedback Tracker
//___________________

// Helper functions
function showInputErrorFeedback(inputElement, message) {
    const fieldset = inputElement.closest("fieldset");
    const errorSpan = fieldset.querySelector(".error");

    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.setAttribute("role", "alert");
    }
}

function showGroupErrorFeedback(errorId, message) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.setAttribute("role", "alert");
    }
}

function clearErrorsFeedback() {
    document.querySelectorAll(".error").forEach(span => {
        span.textContent = "";
        span.removeAttribute("role");
    });
}

// Feedback Form Validation
function validateFeedbackForm() {
    let isFormValid = true;
    clearErrorsFeedback();

    // Name Validation
    const nameInput = document.getElementById("userName");

    if (nameInput.value.trim() === "") {
        showInputErrorFeedback(nameInput, "Please enter a name.");
        isFormValid = false;
    }

    // Rating Radio button Validation
    const selectedRating = document.querySelector('input[name="rating"]:checked');

    if (!selectedRating) {
        showGroupErrorFeedback("ratingError", "Please select a rating between 1 and 5.");
        isFormValid = false;
    }

    // Recommend Radio Button Validation
    const selectedRecommend = document.querySelector('input[name="recommend"]:checked');

    if (!selectedRecommend) {
        showGroupErrorFeedback("recommendError", "Please select Yes or No.");
        isFormValid = false;
    }

    // Left out comment section validation as it should be optional.

    return isFormValid;
}

// Temporary Feedback Data object
function handleValidFeedbackSubmission() {
    const feedbackEntry = {
        id: crypto.randomUUID(),
        userName: document.getElementById("userName").value.trim(),
        rating: document.querySelector('input[name="rating"]:checked').value,
        comments: document.getElementById("comments").value.trim(),
        recommend: document.querySelector('input[name="recommend"]:checked').value
    };

    // Save to temporary data object
    window.tempFeedbackData = feedbackEntry;

    // Save to localStorage
    saveFeedbackToStorage(feedbackEntry);

    // Add row to feedback table

    addFeedbackRow(feedbackEntry);

    // Update feedback summary
    updateFeedbackSummary();

    console.log("Temporary Feedback Data:", window.tempFeedbackData);
    console.log("Feedback submitted!");

    // Resets form
    document.getElementById("section-4").reset();
}

// Feedback Submission Logic
function handleFormFeedbackSubmit(event) {
    event.preventDefault();
    clearErrorsFeedback();

    if (validateFeedbackForm()) {
        handleValidFeedbackSubmission();
    } else {
        console.log("Form has errors.");
    }
}

function onPageLoadHandlerFeedback(){
    loadFeedbackFromStorage();

    const formFeedback = document.getElementById("section-4");

    // Attaches submit button event listener if theres "section 4" (feedback form)
    if(formFeedback){
       formFeedback.addEventListener("submit", handleFormFeedbackSubmit);
    }
}

// Save feedback data to localStorage
function saveFeedbackToStorage(feedbackData) {
    const list = JSON.parse(localStorage.getItem("feedback")) || [];
    list.push(feedbackData);
    localStorage.setItem("feedback", JSON.stringify(list));
}

// Creates table rows
function addFeedbackRow(feedbackData) {
    const feedbackTableBody = document.getElementById("feedbackTableBody");
    if (!feedbackTableBody) return;

    const feedbackRow = document.createElement("tr");
    feedbackRow.dataset.id = feedbackData.id;

    feedbackRow.innerHTML = `
        <td>${feedbackData.userName}</td>
        <td>${feedbackData.rating}</td>
        <td>${feedbackData.comments}</td>
        <td>${feedbackData.recommend}</td>
        <td><button class="delete-feedback" data-id="${feedbackData.id}">Delete</button></td>
    `;

    feedbackTableBody.appendChild(feedbackRow);
}

// Updates feedback summary section
function updateFeedbackSummary() {
    const list = JSON.parse(localStorage.getItem("feedback")) || [];

    const total = list.length;

    const totalRating = list.reduce((sum, feedbackData) => sum + Number(feedbackData.rating), 0);

    let avgRating = 0;

    if (total > 0) {
        avgRating = (totalRating / total).toFixed(2);
    }

    const recommendYes = list.filter(feedbackData => feedbackData.recommend === "Yes").length;
    const recommendNo = list.filter(feedbackData => feedbackData.recommend === "No").length;

    document.getElementById("feedbackTotalSubmissions").textContent = total;
    document.getElementById("feedbackAvgRating").textContent = avgRating;
    document.getElementById("feedbackRecommendYes").textContent = recommendYes;
    document.getElementById("feedbackRecommendNo").textContent = recommendNo;
}

// Load feedback data from localStorage
function loadFeedbackFromStorage() {
    const list = JSON.parse(localStorage.getItem("feedback")) || [];
    list.forEach(feedbackData => addFeedbackRow(feedbackData));

    updateFeedbackSummary();
}

// Deletes feedback entry
function deleteFeedbackEntry(feedbackID) {
    let list = JSON.parse(localStorage.getItem("feedback")) || [];

    // Remove item with matching id
    list = list.filter(feedbackData => feedbackData.id !== feedbackID);
    localStorage.setItem("feedback", JSON.stringify(list));

    // Remove from table
    const feedbackRow = document.querySelector(`tr[data-id="${feedbackID}"]`);
    if (feedbackRow) feedbackRow.remove();

    updateFeedbackSummary();
}

if (typeof window !== "undefined") {

    // Temporary feedback data object
    window.tempFeedbackData = {};


    // Handle delete button clicks
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-feedback")) {
            deleteFeedbackEntry(event.target.dataset.id);
        }
    });

    // Run feedback setup when page loads
    window.addEventListener("DOMContentLoaded", onPageLoadHandlerFeedback);
}

//___________________
// Event Sign Up
//___________________

let validSignUpForm = true;

//temporary signup data
let dataSignUp = {
    event: String,
    name: String,
    email: String,
    role: String,
}

/*
* Handles the page load
*/
function onPageLoadHandler() {
	const signUpform = document.getElementById("section-3");

    //check if we have saved data in local storage, if we do
    //then we want to reload the tables with those saved data.
    const validLocalStorage = localStorage.getItem('signUpLogs')
    if(validLocalStorage !== null){
        eventSignUpTable();
    }
   
	if (signUpform) {
		signUpform.addEventListener("submit", validateEventSignUp);
	}
}

/*
* Validates user entered data for each event sign up field.
* If data passes validation then it saves the data in the temporary data
* object called dataSignUp. If data fails validation then doesn't save it.
* @param {event}: button clicked.
*/
function validateEventSignUp(event) {
    //prevent default.
    event.preventDefault();

    //clear errors.
    clearErrors();

    //get event name.
    const eventName = document.getElementById('event-name');
    //get representative name.
    const representativeName = document.getElementById('representative-name');
    //get representative-email.
    const representativeEmail = document.getElementById('representative-email');
    //get selection drop down menu.
    const selectDropDown = document.getElementById("role-selection");

    //set from to true.
    validSignUpForm = true;

    //check if event name input text field is empty.
    if(eventName.value.trim() === ""){
        errorDisplay('event-name', 'Field is Empty');
        validSignUpForm = false;
    }

    //check if representative name input text field is empty.
    if(representativeName.value.trim() === ""){
        errorDisplay('representative-name', 'Field is Empty');
        validSignUpForm = false;
    }

    //check if representative email input text field is empty.
    if(representativeEmail.value.trim() === ""){
        errorDisplay('representative-email', 'Field is Empty');
        validSignUpForm = false;
    } else {
        //else check if email follows the complex email pattern.
        const complexEmailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        if(!complexEmailPattern.test(representativeEmail.value)){
            errorDisplay('representative-email', 'Enter a Valid Email')
            validSignUpForm = false;
        }
    }

    //check if selection drop down menu is on the 0th index which
    //is the default value.
    if(selectDropDown.selectedIndex === 0){
        errorDisplay('role-selection', 'Select a Valid Item');
        validSignUpForm = false;
    }

    //if the form is valid (all data is valid) then save the data.
    if(validSignUpForm){
        //store current valid data in a temporary object
        dataSignUp.event = eventName.value;
        dataSignUp.name = representativeName.value;
        dataSignUp.email = representativeEmail.value;
        dataSignUp.role = selectDropDown.value;
        
        //save the data into LocalStorage
        saveSignUpDataToLocalStorage();

        //create the table for the valid information.
        eventSignUpTable();
    } else {
        console.log('Please submit again.')
    }
}

/*
* This function creates a table("signup-table") and then Iterates through the localStorage("signUpLogs") objects
* to display the data as a row within the table. This function also creates a delete button that has a onclick
* attribute linking to the deleteSignUp function.
*/
function eventSignUpTable(){
    const signUpContainer = document.getElementById('signup-table-container');
    let signUpTable = signUpContainer.querySelector("table");
    
    if(signUpTable == null){
        //creating sign up table.
        signUpTable = document.createElement('table');
        signUpTable.id = "signup-table";
        //creating table headers.
        const header = `<thead>
                            <tr>
                                <th>Event</th>
                                <th>Person</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody></tbody>`;
        signUpTable.innerHTML = header;
        signUpContainer.appendChild(signUpTable);
    }

    //tbody for the signUpTable, to append table rows to.
    const tbody = signUpTable.querySelector("tbody");
    //clear so we don't duplicate old rows.
    tbody.innerHTML = "";

    //get the sign up data from local storage.
    const localStoredSignUpData = localStorage.getItem("signUpLogs");

    //parse the sign up data so we can access a single key and value from the JSON.
    //using || [] to create an empty array instead of returning null if if there is no data,
    //since the validation will fail if the localStorage doesn't have a length.
    let signUpData = JSON.parse(localStoredSignUpData) || [];

    //if there is no objects/data to display, then remove the table and the div section for upcoming events.
    //this will clear the UI.
    if (signUpData.length === 0){
        const table = document.getElementById("signup-table");
        if(table){
            table.remove();
        }

        const section = document.getElementById("upcoming-events-section");
        if(section){
            section.remove();
        }
        return;
    }

    //iterate through the localStorage objects.
    for(i = 0; i < signUpData.length; i++){
        let row =  `<tr>
                        <td>${signUpData[i].event}</td>
                        <td>${signUpData[i].name}</td>
                        <td>${signUpData[i].email}</td>
                        <td>${signUpData[i].role}</td>
                        <td>
                        <button type="button" id="delete-signup" onclick="deleteSignUp(${i})">Delete</button>
                        </td>
                    </tr>`;
        tbody.innerHTML += row;
    }

    //upcoming events
    upcomingEvents();
}

/*
* Save the temporary data object(dataSignUp) to the localStorage.
*/
function saveSignUpDataToLocalStorage(){
    //turn the string values into key value pair so we can use it.
    let jsonOfSignUpData = JSON.parse(localStorage.getItem("signUpLogs"));
    //if there is nothing in localStorage then lets create an array.
    if (jsonOfSignUpData == null){
        jsonOfSignUpData = [];
    }

    //append the data from the temporary data object (dataSingUp) to the 
    //localStorage Array (similar to mongoDB's command).
    jsonOfSignUpData.push(dataSignUp);
    //convert back to string so we can save it as localStorage.
    localStorage.setItem("signUpLogs", JSON.stringify(jsonOfSignUpData));
}

/*
* Delete an object within the localStorage, which removes it from the displayed table. 
* This function uses the delete button's index to figure out which row to remove.
* It updates the stored array by using splice(row, 1) which determines the object to remove.
* @param {row}: the index of the delete button.
*/
function deleteSignUp(row){
    //using || [] to create an empty array instead of returning null if if there is no data.
    //It's more efficient than using a if statement like I did before.
    const signUpData = JSON.parse(localStorage.getItem("signUpLogs")) || [];
    //Splice the array by indexing by the row value and then deleting that object.
    signUpData.splice(row, 1);
    
    //remove the key so we don't have an empty array.
    if(signUpData.length === 0){
        localStorage.removeItem("signUpLogs");
    } else{
        localStorage.setItem('signUpLogs', JSON.stringify(signUpData));
    }

    //call this to recreate table without deleted rows.
    eventSignUpTable();
}

/*
* Creates a table for upcoming events to displays the name of upcoming event and supported roles.
* Upcoming events are chosen by iterating through localStorage and only taking
* the values for event and role from each object.
*/
function upcomingEvents(){
    const signUpContainer = document.getElementById("signup-table-container");

    //using || [] to create an empty array instead of returning null if if there is no data,
    //since the validation will fail if the localStorage doesn't have a length.
    let signUpData = JSON.parse(localStorage.getItem("signUpLogs")) || [];

    //if there is no objects/data to display, then remove the div section for upcoming events.
    //this will clear the UI.
    if (signUpData.length === 0){
        const section = document.getElementById("upcoming-events-section");
        if(section){
            section.remove();
        }
        return;
    }

    let upComingEventsTable = document.getElementById("upcoming-events-table");

    //creating upcoming events table if it does not exit.
    if(upComingEventsTable == null){
        //creating div section.
        const section = document.createElement('div');
        section.id = "upcoming-events-section";
        section.innerHTML = '<h3>Upcoming Events!</h3>';

        upComingEventsTable = document.createElement('table');
        upComingEventsTable.id = "upcoming-events-table";
        //creating table headers.
        upComingEventsTable.innerHTML = `
                                    <thead>
                                        <tr>
                                            <th>Events</th>
                                            <th>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>`;
        //upComingEventsTable.innerHTML = header;
        section.append(upComingEventsTable);
        signUpContainer.appendChild(section);
    }

    const tbody = upComingEventsTable.querySelector("tbody");
    tbody.innerHTML ="";

    //iterate though localStorage objects.
    for (let i = 0; i < signUpData.length; i++){
        const signUpEvents = (signUpData[i].event).trim();
        const signUpRole = (signUpData[i].role).trim();

        tbody.innerHTML += `
                        <tr>
                            <td>${signUpEvents}</td>
                            <td>${signUpRole}</td>
                        </tr>`;
    }
}

/*
* Display error message, by updating the content of error message span.
* @param {fieldName}: The HTML field.
* @param {errorMessage}: The error message for that field.
*/
const errorDisplay = (fieldName, errorMessage) =>{
    const errorFieldId = `${fieldName}Error`;
    const errorField = document.getElementById(errorFieldId);

    if (!errorField) {
        console.error(`Error field with ID '${errorFieldId}' not found.`);
        return;
}

    errorField.textContent = errorMessage;
    errorField.classList.add("error-visible");
}

/*
*Clear error messages, by iterating over the error-message and resetting
*the content and removing the error-visible.
*/
const clearErrors = () => {
    const errorMessages = document.querySelectorAll("#section-3 .error-message");
    errorMessages.forEach((errorField) => {
        errorField.textContent = "";
        errorField.classList.remove("error-visible");
    });
};

//run the handler if in a browser environment
if (typeof window !== "undefined") {
    window.deleteSignUp = deleteSignUp;
	window.addEventListener("DOMContentLoaded", onPageLoadHandler);
}

//___________________
// Donation Tracker
//___________________
let donations = [];

function loadDonationsFromStorage() {
    donations.length = 0;
    const stored = JSON.parse(localStorage.getItem("donationLogs")) || [];
    stored.forEach(donation => donations.push(donation))
}

function saveDonationsToStorage() {
    localStorage.setItem("donationLogs", JSON.stringify(donations));
}

function validateDonationForm() {
    const charityName = document.getElementById("charityName-donation").value.trim();
    const donationAmount = document.getElementById("donationAmount").value;
    const donationDate = document.getElementById("donationDate").value;
    
    clearErrorsDonation();
    
    let isValid = true;
    
    // Validate charity name
    if (charityName === "") {
        errorDisplayDonation("charityNameDonation", "Charity name is required");
        isValid = false;
    }
    
    // Validate donation amount
    if (donationAmount === "" || parseFloat(donationAmount) <= 0) {
        errorDisplayDonation("donationAmount", "Please enter a valid donation amount (greater than 0)");
        isValid = false;
    }
    
    // Validate donation date
    if (donationDate === "") {
        errorDisplayDonation("donationDate", "Donation date is required");
        isValid = false;
    }
    
    return isValid;
}

const errorDisplayDonation = (fieldName, errorMessage) => {
    const errorFieldId = `${fieldName}Error`;
    const errorField = document.getElementById(errorFieldId);

    if (!errorField) {
        console.error(`Error field with ID '${errorFieldId}' not found.`);
        return;
    }

    errorField.textContent = errorMessage;
    errorField.classList.add("error-visible");
}

const clearErrorsDonation = () => {
    /*
    *Clear error messages, by iterating over the error-message and resetting
    *the content and removing the error-visible.
    */
    const errorMessages = document.querySelectorAll("#section-1 .error-message");
    errorMessages.forEach((errorField) => {
        errorField.textContent = "";
        errorField.classList.remove("error-visible");
    });
};

function addDonationRow(donation) {
    const donationTableBody = document.getElementById("donationTableBody");
    const row = document.createElement("tr");
    row.setAttribute("data-id", donation.id);
    const formattedDate = new Date(donation.donationDate).toLocaleDateString();
    const formattedAmount = `$${donation.donationAmount.toFixed(2)}`;

    row.innerHTML = `
        <td>${donation.charityName}</td>
        <td class="amount-cell">${formattedAmount}</td>
        <td>${formattedDate}</td>
        <td>${donation.donorMessage || "—"}</td>
        <td>
            <button type="button" class="delete-donation" data-id="${donation.id}" 
                    aria-label="Delete donation to ${donation.charityName}">
                Delete
            </button>
        </td>
    `

    donationTableBody.appendChild(row);
}

function deleteDonationEntry(id) {
    const donationIndex = donations.findIndex(donation => donation.id === id);

    // Checks if donation exists
    if (donationIndex === -1) {
        console.error("Donation not found:", id);
        return;
    }

    // Remove entry from array
    donations.splice(donationIndex, 1);

    saveDonationsToStorage();

    // Remove row from table
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.remove();
    }

    updateDonationList();
    updateTotalDonations();
}

function loadDonationOnPageLoad() {
    const donationTableBody = document.getElementById("donationTableBody");
    donationTableBody.innerHTML = "";

    donations.forEach(donation => addDonationRow(donation));
}

/**
 * Handles form submission
 * @param {Event} event - The form submission event
 */
function handleDonationSubmit(event) {
    event.preventDefault();
    
    if (!validateDonationForm()) {
        return;
    }
    
    // Collect form data
    const charityName = document.getElementById("charityName-donation").value.trim();
    const donationAmount = parseFloat(document.getElementById("donationAmount").value);
    const donationDate = document.getElementById("donationDate").value;
    const donorMessage = document.getElementById("donorMessage").value.trim();
    
    // Create donation object
    const donation = {
        id: crypto.randomUUID(),
        charityName,
        donationAmount,
        donationDate,
        donorMessage,
    };
    
    // Add to donations array
    donations.push(donation);

    // Save to localStorage
    saveDonationsToStorage();

    // Add row to table
    addDonationRow(donation);
    
    // Update UI
    updateDonationList();
    updateTotalDonations();
    
    // Reset form
    document.getElementById("section-1").reset();

    // Set default date again after reset
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("donationDate").value = today;
}

function updateDonationList() {
    const donationList = document.getElementById("donationList");
    
    if (donations.length === 0) {
        donationList.innerHTML = "<p>No donations recorded yet.</p>";
        return;
    }
    
    const mostRecentDonation = donations[donations.length - 1];
    donationList.innerHTML = "<h3>Latest Donation:</h3>";
    const donationItem = document.createElement("div");
    donationItem.className = "donation-item";
    const formattedDate = new Date(mostRecentDonation.donationDate).toLocaleDateString();
    const formattedAmount = mostRecentDonation.donationAmount.toFixed(2);

    donationItem.innerHTML = `
        <h3>${mostRecentDonation.charityName}</h3>
        <p><strong>Amount:</strong> $${formattedAmount}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        ${mostRecentDonation.donorMessage ? `<p><strong>Message:</strong> ${mostRecentDonation.donorMessage}</p>` : ""}
    `;

    donationList.appendChild(donationItem);
}

function updateTotalDonations() {
    const totalDonations = document.getElementById("totalDonations");
    const total = donations.reduce((sum, donation) => sum + donation.donationAmount, 0);
    
    totalDonations.innerHTML = `
        <h3>Total Donations: $${total.toFixed(2)}</h3>
        <p>Number of donations: ${donations.length}</p>
    `;
    
}

function onPageLoadHandlerDonation() {
    const donationForm = document.getElementById("section-1");
    
    if (donationForm) {
        loadDonationsFromStorage();
        loadDonationOnPageLoad();
        donationForm.addEventListener("submit", handleDonationSubmit);
        
        // Set default date to today
        const today = new Date().toISOString().split("T")[0];
        document.getElementById("donationDate").value = today;
        
        // Initialize UI
        updateDonationList();
        updateTotalDonations();

        // Delete button listener
        document.addEventListener("click", function(event) {
            if (event.target.classList.contains("delete-donation")) {
                deleteDonationEntry(event.target.dataset.id);
            }
        });
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", onPageLoadHandlerDonation);
}

module.exports = {
    // Volunteer
    validateVolunteerForm,
    processVolunteerData,
    saveVolunteerDataToStorage,
    loadVolunteerDataFromStorage,
    calculateTotalHours,
    updateTotalHours,
    deleteVolunteerEntry,
    addVolunteerRow,
    volunteerData,

    // Feedback
    validateFeedbackForm,
    handleFormFeedbackSubmit,
    handleValidFeedbackSubmission,
    showInputErrorFeedback,
    showGroupErrorFeedback,
    clearErrorsFeedback,
    onPageLoadHandlerFeedback,
    saveFeedbackToStorage,
    addFeedbackRow,
    updateFeedbackSummary,
    loadFeedbackFromStorage,
    deleteFeedbackEntry,


    // Event Signup
    validateEventSignUp,
    dataSignUp,
    onPageLoadHandler,
    saveSignUpDataToLocalStorage,
    eventSignUpTable,
    deleteSignUp,
    upcomingEvents,


    // Donation Tracker
    validateDonationForm,
    handleDonationSubmit,
    updateDonationList,
    updateTotalDonations,
    donations,
    errorDisplayDonation,
    clearErrorsDonation,
    loadDonationsFromStorage,
    saveDonationsToStorage,
    addDonationRow,
    deleteDonationEntry,
    loadDonationOnPageLoad,
    onPageLoadHandlerDonation
};
