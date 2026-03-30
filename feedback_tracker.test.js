//TESTING FILE: Add your funtions to const{(your_funtions_here)} = require("./script");
const { JSDOM } = require("jsdom");

let testScript; 

// Build DOM and load script.js
function setupDOM(html = "") {

    // Reset module for script.js
    jest.resetModules();

    // Build DOM
    const dom = new JSDOM(html);
    global.window = dom.window;
    global.document = dom.window.document;

    // Mock localStorage
    if (!global.localStorage) {
        global.localStorage = {
            store: {},
            getItem(key) { return this.store[key] || null; },
            setItem(key, value) { this.store[key] = String(value); },
            removeItem(key) { delete this.store[key]; },
            clear() { this.store = {}; }
        };
    } else {
        global.localStorage.clear();
    }

    // Reset temporary storage
    window.tempFeedbackData = {};

    // Load script.js after window exists
    testScript = require("./script.js");
}

// HTML test setup
const formTestHTML = `
<form id="section-4">
    <fieldset>
        <input id="userName" />
        <span class="error" id="userNameError"></span>
    </fieldset>

    <fieldset>
        <input type="radio" name="rating" id="rating5" value="5" />
        <span class="error" id="ratingError"></span>
    </fieldset>

    <fieldset>
        <textarea id="comments"></textarea>
        <span class="error" id="commentsError"></span>
    </fieldset>

    <fieldset>
        <input type="radio" name="recommend" id="recommendYes" value="Yes" />
        <span class="error" id="recommendError"></span>
    </fieldset>

    <button type="submit">Submit</button>
</form>

<div id="feedbackSummary">
    <span id="feedbackTotalSubmissions"></span>
    <span id="feedbackAvgRating"></span>
    <span id="feedbackRecommendYes"></span>
    <span id="feedbackRecommendNo"></span>
</div>

<table>
    <tbody id="feedbackTableBody"></tbody>
</table>
`;

// HTML for table and summary testing
const feedbackTableHTML = `
    <table>
        <tbody id="feedbackTableBody"></tbody>
    </table>

    <div id="feedbackSummary">
        <span id="feedbackTotalSubmissions"></span>
        <span id="feedbackAvgRating"></span>
        <span id="feedbackRecommendYes"></span>
        <span id="feedbackRecommendNo"></span>
    </div>
`;

// Integration Tests
beforeEach(() => {
    setupDOM(formTestHTML);
});

test("Submitting valid form updates tempFeedbackData", () => {

    document.getElementById("userName").value = "Derek";
    document.getElementById("rating5").checked = true;
    document.getElementById("comments").value = "Great!";
    document.getElementById("recommendYes").checked = true;

    testScript.handleValidFeedbackSubmission();

    expect(window.tempFeedbackData).toMatchObject({
        userName: "Derek",
        rating: "5",
        comments: "Great!",
        recommend: "Yes"
    });

    expect(window.tempFeedbackData.id).toBeDefined();
});

test("Invalid submit displays validation errors", () => {

    const invalidEvent = { preventDefault: jest.fn() };

    testScript.handleFormFeedbackSubmit(invalidEvent);

    expect(document.getElementById("userNameError").textContent)
        .toBe("Please enter a name.");

    expect(document.getElementById("ratingError").textContent)
        .toBe("Please select a rating between 1 and 5.");

    expect(document.getElementById("recommendError").textContent)
        .toBe("Please select Yes or No.");
});

test("Table updates correctly from localStorage", () => {

    setupDOM(feedbackTableHTML);

    const sampleData = [
        { id: "1", userName: "Derek", rating: "5", comments: "Good", recommend: "Yes" },
        { id: "2", userName: "Tri", rating: "3", comments: "Okay", recommend: "No" }
    ];
    localStorage.setItem("feedback", JSON.stringify(sampleData));

    testScript.loadFeedbackFromStorage();

    const rows = document.querySelectorAll("#feedbackTableBody tr");

    expect(rows.length).toBe(2);
    expect(rows[0].children[0].textContent).toBe("Derek");
    expect(rows[1].children[0].textContent).toBe("Tri");
});

test("Summary updates correctly when loading from storage", () => {

    setupDOM(feedbackTableHTML);

    const sampleData = [
        { id: "1", userName: "Derek", rating: "5", comments: "", recommend: "Yes" },
        { id: "2", userName: "Tri", rating: "1", comments: "", recommend: "No" }
    ];
    localStorage.setItem("feedback", JSON.stringify(sampleData));

    testScript.loadFeedbackFromStorage();

    expect(document.getElementById("feedbackTotalSubmissions").textContent).toBe("2");
    expect(document.getElementById("feedbackAvgRating").textContent).toBe("3.00");
    expect(document.getElementById("feedbackRecommendYes").textContent).toBe("1");
    expect(document.getElementById("feedbackRecommendNo").textContent).toBe("1");
});

// Unit Tests
test("detects empty name field", () => {

    setupDOM(formTestHTML);
    const result = testScript.validateFeedbackForm();

    expect(result).toBe(false);
    expect(document.getElementById("userNameError").textContent)
        .toBe("Please enter a name.");
});

test("detects missing rating", () => {

    setupDOM(formTestHTML);
    document.getElementById("userName").value = "Tri";

    testScript.validateFeedbackForm();

    expect(document.getElementById("ratingError").textContent)
        .toBe("Please select a rating between 1 and 5.");
});

test("detects missing recommend choice", () => {

    setupDOM(formTestHTML);
    document.getElementById("userName").value = "Tri";
    document.getElementById("rating5").checked = true;

    testScript.validateFeedbackForm();

    expect(document.getElementById("recommendError").textContent)
        .toBe("Please select Yes or No.");
});

test("handleValidFeedbackSubmission builds correct temp object", () => {

    setupDOM(formTestHTML);

    document.getElementById("userName").value = "Derek";
    document.getElementById("rating5").checked = true;
    document.getElementById("comments").value = "Works good!";
    document.getElementById("recommendYes").checked = true;

    testScript.handleValidFeedbackSubmission();

    expect(window.tempFeedbackData).toMatchObject({
        userName: "Derek",
        rating: "5",
        comments: "Works good!",
        recommend: "Yes"
    });

    expect(window.tempFeedbackData.id).toBeDefined();
});

test("updateFeedbackSummary correctly calculates values", () => {

    setupDOM(feedbackTableHTML);

    const mock = [
        { id: "1", rating: "5", recommend: "Yes" },
        { id: "2", rating: "3", recommend: "No" }
    ];
    localStorage.setItem("feedback", JSON.stringify(mock));

    testScript.updateFeedbackSummary();

    expect(document.getElementById("feedbackTotalSubmissions").textContent).toBe("2");
    expect(document.getElementById("feedbackAvgRating").textContent).toBe("4.00");
});

test("deleteFeedbackEntry removes row and updates localStorage", () => {

    setupDOM(feedbackTableHTML);

    const sampleData = [
        { id: "1", userName: "Derek", rating: "5", comments: "", recommend: "Yes" },
        { id: "2", userName: "Tri", rating: "3", comments: "", recommend: "No" }
    ];
    localStorage.setItem("feedback", JSON.stringify(sampleData));

    sampleData.forEach(item => testScript.addFeedbackRow(item));

    testScript.deleteFeedbackEntry("1");

    const stored = JSON.parse(localStorage.getItem("feedback"));

    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe("2");

    const rows = document.querySelectorAll("#feedbackTableBody tr");
    expect(rows.length).toBe(1);
});

test("Summary updates after deleting a record", () => {
    setupDOM(feedbackTableHTML);

    const sampleData = [
        { id: "1", rating: "5", recommend: "Yes" },
        { id: "2", rating: "1", recommend: "No" }
    ];
    localStorage.setItem("feedback", JSON.stringify(sampleData));

    testScript.loadFeedbackFromStorage();
    testScript.deleteFeedbackEntry("2");

    expect(document.getElementById("feedbackTotalSubmissions").textContent).toBe("1");
    expect(document.getElementById("feedbackAvgRating").textContent).toBe("5.00");
    expect(document.getElementById("feedbackRecommendYes").textContent).toBe("1");
    expect(document.getElementById("feedbackRecommendNo").textContent).toBe("0");
});
