//TESTING FILE: Add your functions to const{(your_functions_here)} = require("./script");
const { JSDOM } = require("jsdom");

// Simple localStorage mock
class LocalStorageMock {
    constructor() {
        this.store = {};
    }
    clear() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = value.toString();
    }
    removeItem(key) {
        delete this.store[key];
    }
}
global.localStorage = new LocalStorageMock();

let dom;
let document;
let script;

beforeEach(() => {
    // Reset module cache so require("./script") reloads fresh
    jest.resetModules();

    // Create fresh DOM for each test
    dom = new JSDOM(`
        <form id="section-2">
            <input id="charityName-vol" />
            <span id="error-charityName-vol" class="error-msg"></span>

            <input id="hoursVolunteered-vol" />
            <span id="error-hoursVolunteered-vol" class="error-msg"></span>

            <input id="volunteerDate-vol" />
            <span id="error-volunteerDate-vol" class="error-msg"></span>

            <input id="experienceRating-vol" />
            <span id="error-experienceRating-vol" class="error-msg"></span>

            <button type="submit">Submit</button>
        </form>

        <table>
            <tbody id="volunteerTableBody"></tbody>
        </table>

        <div id="totalVolunteerHours"></div>
    `);

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
    global.alert = jest.fn();

    // Require script AFTER DOM is ready
    script = require("./script");

    // Clear volunteerData if it exists
    if (script.volunteerData) {
        Object.keys(script.volunteerData).forEach(key => delete script.volunteerData[key]);
    }

    // Clear localStorage
    global.localStorage.clear();

    // Attach submit listener
    const form = document.getElementById("section-2");
    form.addEventListener("submit", script.handleVolunteerFormSubmit);
});

// Unit tests
test("validateVolunteerForm identifies empty required fields", () => {
    const fields = { charityName: "", hoursVolunteered: "", volunteerDate: "", experienceRating: "" };
    const errors = script.validateVolunteerForm(fields);
    const errorFields = errors.map(e => e.field);
    expect(errorFields).toContain("charityName");
    expect(errorFields).toContain("hoursVolunteered");
    expect(errorFields).toContain("volunteerDate");
    expect(errorFields).toContain("experienceRating");
});

test("validateVolunteerForm flags invalid hours volunteered", () => {
    const fields = { charityName: "Charity", hoursVolunteered: "-2", volunteerDate: "2025-12-01", experienceRating: "3" };
    const errors = script.validateVolunteerForm(fields);
    expect(errors.some(err => err.field === "hoursVolunteered")).toBe(true);
});

test("validateVolunteerForm flags invalid experience rating", () => {
    const fields = { charityName: "Charity", hoursVolunteered: "3", volunteerDate: "2025-12-01", experienceRating: "10" };
    const errors = script.validateVolunteerForm(fields);
    expect(errors.some(err => err.field === "experienceRating")).toBe(true);
});

test("processVolunteerData returns cleaned and converted data", () => {
    const fields = { charityName: "  Helping Hands ", hoursVolunteered: "5", volunteerDate: "2025-12-01", experienceRating: "5" };
    const processed = script.processVolunteerData(fields);
    expect(processed.charityName).toBe("Helping Hands");
    expect(processed.hoursVolunteered).toBe(5);
    expect(processed.volunteerDate).toBe("2025-12-01");
    expect(processed.experienceRating).toBe(5);
    expect(processed.id).toBeDefined();
});

test("calculateTotalHours sums volunteer hours correctly", () => {
    const data = [
        { id: "1", charityName: "A", hoursVolunteered: 2, volunteerDate: "2025-12-01", experienceRating: 4 },
        { id: "2", charityName: "B", hoursVolunteered: 3, volunteerDate: "2025-12-02", experienceRating: 5 }
    ];
    global.localStorage.setItem("volunteerLogs", JSON.stringify(data));
    expect(script.calculateTotalHours()).toBe(5);
});

// Integration tests
test("submitting valid form updates volunteerData, table, and total hours", () => {
    document.getElementById("charityName-vol").value = "Red Cross";
    document.getElementById("hoursVolunteered-vol").value = "4";
    document.getElementById("volunteerDate-vol").value = "2025-12-03";
    document.getElementById("experienceRating-vol").value = "5";

    const form = document.getElementById("section-2");
    const event = new dom.window.Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    // Check localStorage content
    const stored = JSON.parse(global.localStorage.getItem("volunteerLogs"));
    expect(stored).not.toBeNull();
    expect(stored[0].charityName).toBe("Red Cross");
    expect(stored[0].hoursVolunteered).toBe(4);

    // Table row rendered
    const rows = document.querySelectorAll("#volunteerTableBody tr");
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain("Red Cross");

    // Total hours updated
    expect(document.getElementById("totalVolunteerHours").textContent).toBe("4");
});

test("submitting invalid form shows error messages in DOM", () => {
    const form = document.getElementById("section-2");
    const event = new dom.window.Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    expect(document.getElementById("error-charityName-vol").textContent).not.toBe("");
    expect(document.getElementById("error-hoursVolunteered-vol").textContent).not.toBe("");
    expect(document.getElementById("error-volunteerDate-vol").textContent).not.toBe("");
    expect(document.getElementById("error-experienceRating-vol").textContent).not.toBe("");
});

test("deleting a volunteer row updates table, localStorage, and total hours", () => {
    const data = [
        { id: "1", charityName: "Charity A", hoursVolunteered: 2, volunteerDate: "2025-12-01", experienceRating: 4 },
        { id: "2", charityName: "Charity B", hoursVolunteered: 3, volunteerDate: "2025-12-02", experienceRating: 5 }
    ];
    global.localStorage.setItem("volunteerLogs", JSON.stringify(data));
    script.loadVolunteerDataFromStorage();
    script.updateTotalHours();

    script.deleteVolunteerEntry("1");

    const remainingRows = document.querySelectorAll("#volunteerTableBody tr");
    expect(remainingRows.length).toBe(1);
    expect(remainingRows[0].textContent).toContain("Charity B");

    const stored = JSON.parse(global.localStorage.getItem("volunteerLogs"));
    expect(stored.length).toBe(1);
    expect(stored[0].charityName).toBe("Charity B");

    expect(document.getElementById("totalVolunteerHours").textContent).toBe("3");
});

test("loadVolunteerDataFromStorage renders stored data and updates total hours", () => {
    const preExisting = [
        { charityName: "Charity X", hoursVolunteered: 2, volunteerDate: "2025-12-01", experienceRating: 5 },
        { id: "pre-id-2", charityName: "Charity Y", hoursVolunteered: 3, volunteerDate: "2025-12-02", experienceRating: 4 }
    ];
    global.localStorage.setItem("volunteerLogs", JSON.stringify(preExisting));

    script.loadVolunteerDataFromStorage();

    const rows = document.querySelectorAll("#volunteerTableBody tr");
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain("Charity X");
    expect(rows[1].textContent).toContain("Charity Y");

    const stored = JSON.parse(global.localStorage.getItem("volunteerLogs"));
    expect(stored[0].id).toBeDefined();
    expect(stored[1].id).toBe("pre-id-2");

    script.updateTotalHours();
    expect(document.getElementById("totalVolunteerHours").textContent).toBe("5");
});