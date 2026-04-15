//TESTING FILE: Add your funtions to const{(your_funtions_here)} = require("./script");
const { JSDOM } = require("jsdom");
const {
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
    loadDonationOnPageLoad
} = require("./script");

function storageMock() {
    let storage = {};
    return {
        setItem: function(key, value) {
            storage[key] = value || '';
        },
        getItem: function(key) {
            return key in storage ? storage[key] : null;
        },
        removeItem: function(key) {
            delete storage[key];
        },
        clear: function() {
            storage = {};
        },
        get length() {
            return Object.keys(storage).length;
        },
        key: function(i) {
            const keys = Object.keys(storage);
            return keys[i] || null;
        }
    };
}

global.localStorage = storageMock();
global.crypto = {
    randomUUID: jest.fn(() => "test-id")
}

function createDOM() {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
            <body>
                <form id="section-1">
                    <div class="form-group">
                        <label for="charityName-donation">Charity Name:</label>
                        <input type="text" id="charityName-donation" name="charityName-donation">
                        <span id="charityNameDonationError" class="error-message"></span>
                    </div>
                    <div class="form-group">
                        <label for="donationAmount">Donation Amount ($):</label>
                        <input type="number" id="donationAmount" name="donationAmount" min="0" step="0.01">
                        <span id="donationAmountError" class="error-message"></span>
                    </div>
                    <div class="form-group">
                        <label for="donationDate">Date of Donation:</label>
                        <input type="date" id="donationDate" name="donationDate">
                        <span id="donationDateError" class="error-message"></span>
                    </div>
                    <div class="form-group">
                        <label for="donorMessage">Donor Comment/Message:</label>
                        <textarea id="donorMessage" name="donorMessage" rows="3"></textarea>
                    </div>
                    <button type="submit">Add Donation</button>
                </form>
                <div id="donationList"></div>
                <div id="totalDonations"></div>
                <table id="donationTable">
                    <tbody id="donationTableBody"></tbody>
                </table>
            </body>
        </html>
    `);

    global.document = dom.window.document;
    global.window = dom.window;
    global.HTMLElement = dom.window.HTMLElement;
    global.window.localStorage = global.localStorage;
    global.window.crypto = global.crypto;
}

beforeEach(() => {
    // Clear donations array before each test
    donations.length = 0;

    // Clear localStorage mock
    global.localStorage.clear()

    // Reset crypto mock
    global.crypto.randomUUID.mockClear();
    global.crypto.randomUUID.mockReturnValue("test-id");
});

test("donations array should start empty", () => {
    expect(donations).toHaveLength(0);
});

test("should add donation objects to array with correct structure", () => {
    donations.length = 0;
    
    const donation = {
        id: "test-uuid-123",
        charityName: "Test Charity",
        donationAmount: 100,
        donationDate: "2024-01-25",
        donorMessage: "Test message"
    };
    
    donations.push(donation);
    expect(donations).toHaveLength(1);
    expect(donations[0].id).toBe("test-uuid-123")
});

test("should calculate total donations correctly", () => {
    donations.length = 0;
    
    donations.push(
        { donationAmount: 100 },
        { donationAmount: 50.25 },
        { donationAmount: 75.75 }
    );

    const total = donations.reduce((sum, donation) => sum + donation.donationAmount, 0);
    expect(total).toBe(226);
});

test("validateDonationForm should return true for valid form data", () => {
    createDOM();
    document.getElementById("charityName-donation").value = "Red Cross";
    document.getElementById("donationAmount").value = "100";
    document.getElementById("donationDate").value = "2024-01-25";

    const result = validateDonationForm();
    expect(result).toBe(true);
});

test("handleDonationSubmit should process valid donation", () => {
    createDOM();
    donations.length = 0;
    
    const mockEvent = { preventDefault: jest.fn() };
    document.getElementById("charityName-donation").value = "Test Charity";
    document.getElementById("donationAmount").value = "150";
    document.getElementById("donationDate").value = "2024-01-25";
    document.getElementById("donorMessage").value = "Test message";

    handleDonationSubmit(mockEvent);
    expect(donations).toHaveLength(1);
    expect(donations[0].charityName).toBe("Test Charity");
    expect(donations[0].id).toBeDefined();
});

test("updateDonationList should display message when no donations", () => {
    createDOM();
    donations.length = 0;
    
    updateDonationList();
    const donationList = document.getElementById("donationList");
    expect(donationList.innerHTML).toContain("No donations recorded yet");
});

test("updateTotalDonations should display correct total", () => {
    createDOM();
    donations.length = 0;
    donations.push(
        { donationAmount: 100 },
        { donationAmount: 200 }
    );

    updateTotalDonations();
    const totalDonations = document.getElementById("totalDonations");
    expect(totalDonations.innerHTML).toContain("$300.00");
});

test("errorDisplayDonation should show error message", () => {
    createDOM();
    errorDisplayDonation("charityNameDonation", "Test error");
    
    const errorField = document.getElementById("charityNameDonationError");
    expect(errorField.textContent).toBe("Test error");
    expect(errorField.classList.contains("error-visible")).toBe(true);
});

test("clearErrorsDonation should remove all errors", () => {
    createDOM();
    errorDisplayDonation("charityNameDonation", "Error 1");
    errorDisplayDonation("donationAmount", "Error 2");
    
    clearErrorsDonation();
    
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(errorField => {
        expect(errorField.textContent).toBe("");
        expect(errorField.classList.contains("error-visible")).toBe(false);
    });
});

test("loadDonationsFromStorage should load from localStorage", () => {
    createDOM();
    donations.length = 0;
    
    const testData = [{ 
        id: "1",
        charityName: "Test",
        donationAmount: 50,
        donationDate: "2024-01-01",
        donorMessage: ""
    }];

    localStorage.setItem("donationLogs", JSON.stringify(testData));
    donations.length = 0;    
    loadDonationsFromStorage();
    
    expect(donations).toHaveLength(1);
    expect(donations[0].charityName).toBe("Test");
});

test("saveDonationsToStorage should save to localStorage", () => {
    createDOM();
    donations.length = 0;
    
    donations.push({
        id: "1",
        charityName: "Save Test",
        donationAmount: 75,
        donationDate: "2024-01-01",
        donorMessage: ""
    });
    
    saveDonationsToStorage();
    const stored = JSON.parse(localStorage.getItem("donationLogs"));
    expect(stored).toHaveLength(1);
    expect(stored[0].charityName).toBe("Save Test");
});

test("addDonationRow should add row to table", () => {
    createDOM();
    
    const donation = {
        id: "test-id",
        charityName: "Row Test",
        donationAmount: 100,
        donationDate: "2024-01-25",
        donorMessage: ""
    };
    
    addDonationRow(donation);
    const tbody = document.getElementById("donationTableBody");
    const rows = tbody.querySelectorAll("tr");
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain("Row Test");
});

test("deleteDonationEntry should remove donation", () => {
    createDOM();
    donations.length = 0;
    
    donations.push({
        id: "delete-test",
        charityName: "Delete Me",
        donationAmount: 50,
        donationDate: "2024-01-01",
        donorMessage: ""
    });
    
    saveDonationsToStorage();
    const row = document.createElement("tr");
    row.setAttribute("data-id", "delete-test");
    document.getElementById("donationTableBody").appendChild(row);
    
    deleteDonationEntry("delete-test");
    
    expect(donations).toHaveLength(0);
});

test("loadDonationOnPageLoad should fill table", () => {
    createDOM();
    donations.length = 0;
    localStorage.clear();
    
    donations.push(
        {
            id: "1",
            charityName: "Charity A",
            donationAmount: 50,
            donationDate: "2024-01-01",
            donorMessage: ""
        },
        {
            id: "2",
            charityName:
            "Charity B",
            donationAmount: 100,
            donationDate: "2024-01-01",
            donorMessage: ""
        }
    );
    
    saveDonationsToStorage();
    document.getElementById("donationTableBody").innerHTML = "";
    loadDonationsFromStorage();
    loadDonationOnPageLoad();
    
    const tbody = document.getElementById("donationTableBody");
    const rows = tbody.querySelectorAll("tr");
    
    expect(rows).toHaveLength(2);
});

test("updateDonationList should show latest donation", () => {
    createDOM();
    donations.length = 0;
    
    donations.push(
        {
            charityName: "First",
            donationAmount: 50,
            donationDate: "2024-01-01",
            donorMessage: "",
            id: "1"
        },
        {
            charityName: "Latest",
            donationAmount: 100,
            donationDate: "2024-01-25",
            donorMessage: "",
            id: "2"
        }
    );
    
    updateDonationList();
    const donationList = document.getElementById("donationList");
    
    expect(donationList.innerHTML).toContain("Latest Donation:");
    expect(donationList.innerHTML).toContain("Latest");
    expect(donationList.innerHTML).not.toContain("First");
});