//TESTING FILE: Add your functions to const{(your_functions_here)} = require("./script");
const { JSDOM } = require("jsdom");
const {validateEventSignUp, dataSignUp, eventSignUpTable, deleteSignUp, upcomingEvents} = require("./script");
const { glob } = require("fs");

// //! must update tests with a setup const dom, so I edit it with js.


/*
* Test if the temporary data object has validate data.
*/
test('updates the temporary data object with correct data', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="opening event">
            <input type="text" id="representative-name" value="james">
            <input type="text" id="representative-email" value="james@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );
   
    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //in the validateEventSignUp function and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler.
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);

    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(dataSignUp.event).toBe("opening event");
    expect(dataSignUp.name).toBe("james");
    expect(dataSignUp.email).toBe("james@gmail.com");
    expect(dataSignUp.role).toBe("Sponsor");
});


/*
* Test if event name has an invalid empty string and triggers validation feedback.
*/
test('empty string for event name displays an error message', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="">
            <span id = 'event-nameError' class="error-message"></span>
            <input type="text" id="representative-name" value="james">
            <input type="text" id="representative-email" value="james@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler.
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("event-nameError").innerHTML).toBe("Field is Empty");
});


/*
* Test if representative name is an invalid empty string and triggers validation feedback.
*/
test('empty string for representative name displays an error message', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="Opening">
            <input type="text" id="representative-name" value="">
            <span id = 'representative-nameError' class="error-message"></span>
            <input type="text" id="representative-email" value="james@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler.
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("representative-nameError").innerHTML).toBe("Field is Empty");
});


/*
* Test if representative email is an invalid empty string and triggers validation feedback.
*/
test('empty string for representative email displays an error message', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="Opening">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value=" ">
            <span id = 'representative-emailError' class="error-message"></span>
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler.
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("representative-emailError").innerHTML).toBe("Field is Empty");
});


/*
* Test if representative email is an invalid email pattern and triggers validation feedback.
*/
test('invalid email pattern for representative email displays an error message', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="Opening">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value="gold gold gold">
            <span id = 'representative-emailError' class="error-message"></span>
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler.
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("representative-emailError").innerHTML).toBe("Enter a Valid Email");
});


/*
* Test if invalid selection has been made in the select dropdown menu and triggers validation feedback.
*/
test('if invalid item selected in the dropdown selection menu then display error message', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="Opening">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value="gold@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <span id = 'role-selectionError' class="error-message"></span>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 0 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 0;

    //submit handler
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("role-selectionError").innerHTML).toBe("Select a Valid Item");
});


/*
* Test if event name has a valid string.
*/
test('if event name has a valid string', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="opening event">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value="gold@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("event-name").value).toBe("opening event");
});


/*
* Test if representative-name has a valid string.
*/
test('if representative-name has a valid string', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="opening event">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value="gold@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("representative-name").value).toBe("James");
});

/*
* Test if representative-email has a valid string.
*/
test('if representative-email has a valid string that follows the email pattern', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="opening event">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value="gold@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById("representative-email").value).toBe("gold@gmail.com");
});


/*
* Test if role-selection has a correct option selected which is not the default.
*/
test('if role-selection has a correct option selected', () => {
    const dom = new JSDOM(
            `<!DOCTYPE html>
        <form id="section-3" class="section" action="#" method="post">
            <input type="text" id="event-name" value="opening event">
            <input type="text" id="representative-name" value="James">
            <input type="text" id="representative-email" value="gold@gmail.com">
            <select type="text" id="role-selection">
                <option id="default-role">Select an Item</option>
                <option id="first-role">Sponsor</option>
            </select>
            <button type="submit" id="signUpButton">Submit</button>
        </form>`
    );

    global.document = dom.window.document;

    //select the index value of 1 from select menu since the default index 0 isn't valid
    //and will display an error message.
    global.document.getElementById('role-selection').selectedIndex = 1;

    //submit handler
    const form = dom.window.document.getElementById("section-3");
    form.addEventListener("submit", validateEventSignUp);
 
    //simulate the form submission
    const submitEvent = new dom.window.Event("submit", {
        bubbles: true,
        cancelable: true,
    });

    form.dispatchEvent(submitEvent);

    expect(global.document.getElementById('role-selection').value).toBe("Sponsor");
});

//#####################################################################################
//PART 2 TESTS

//Mock localStorage (I did not write this).
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


test('test that signup table updates correctly after data is added to localStorage', () => {
    document.body.innerHTML =(`
                        <div id="signup-table-container">
                            <table>
                                <tbody id=signUpTableBody></tbody>
                            </table>
                        </div>`);
    
    const fakeLocalStorage = [
        {event:"case opening", name:"ohen", email:"ohen@gmail.com", role:"Organizer"},
    ];

    //set the local storage item.
    localStorage.setItem("signUpLogs", JSON.stringify(fakeLocalStorage));
    //get local storage
    const localStore = JSON.parse(localStorage.getItem("signUpLogs"));

    //create table.
    eventSignUpTable();

    //test if values are in local storage.
    expect(localStore[0]).toEqual({
        event: "case opening",
        name: "ohen",
        email: "ohen@gmail.com",
        role: "Organizer"
    })

    const tableRow = document.querySelectorAll('#signup-table-container table tbody tr')
    const firstRowTableData = tableRow[0].querySelectorAll('td');

    //testing the DOM/table
    expect(firstRowTableData[0].textContent).toBe("case opening");
    expect(firstRowTableData[1].textContent).toBe("ohen");
    expect(firstRowTableData[2].textContent).toBe("ohen@gmail.com");
    expect(firstRowTableData[3].textContent).toBe("Organizer");
});

test('Test that data persisted in localStorage is correctly retrieved and displayed in the table', () => {
    document.body.innerHTML =(`
                        <div id="signup-table-container">
                            <table>
                                <tbody id=signUpTableBody></tbody>
                            </table>
                        </div>`);

    const fakeLocalStorage = [
        {event:"case opening", name:"ohen", email:"ohen@gmail.com", role:"Organizer"},
        {event:"battle", name:"hunter", email:"hunter@gmail.com", role:"Organizer"}
    ];

    //set local storage for testing
    localStorage.setItem("signUpLogs", JSON.stringify(fakeLocalStorage));

    //initialztion the table.
    eventSignUpTable();

    const tableRow = document.querySelectorAll('#signup-table-container table tbody tr')
    const firstRowTableData = tableRow[0].querySelectorAll('td');
    const secondRowTableData = tableRow[1].querySelectorAll('td');

    expect(firstRowTableData[0].textContent).toBe("case opening");
    expect(firstRowTableData[1].textContent).toBe("ohen");
    expect(firstRowTableData[2].textContent).toBe("ohen@gmail.com");
    expect(firstRowTableData[3].textContent).toBe("Organizer");

    expect(secondRowTableData[0].textContent).toBe("battle");
    expect(secondRowTableData[1].textContent).toBe("hunter");
    expect(secondRowTableData[2].textContent).toBe("hunter@gmail.com");
    expect(secondRowTableData[3].textContent).toBe("Organizer");

});

test('Test that deleting a record updates the localStorage and table correctly.', () => {
    document.body.innerHTML =(`
                        <div id="signup-table-container">
                            <table>
                                <tbody id=signUpTableBody></tbody>
                            </table>
                        </div>`);
    
    const fakeLocalStorage = [
        {event:"case opening", name:"ohen", email:"ohen@gmail.com", role:"Organizer"},
        {event:"battle", name:"hunter", email:"hunter@gmail.com", role:"Organizer"}
    ];

    localStorage.setItem("signUpLogs", JSON.stringify(fakeLocalStorage));

    //initialization of the table.
    eventSignUpTable();
    //delete the first row.
    deleteSignUp(0);
    //set local storage for testing
    const localStore = JSON.parse(localStorage.getItem("signUpLogs"));

    //testing the localStorage, making sure the other object got deleted.
    expect(localStore.length).toBe(1);
    expect(localStore[0]).toEqual({
        event: "battle",
        name: "hunter",
        email: "hunter@gmail.com",
        role: "Organizer"
    })
    
    const tableRow = document.querySelectorAll('#signup-table-container table tbody tr')
    const firstRowTableData = tableRow[0].querySelectorAll('td');

    //test that we still have the correct data.
    //test the DOM.
    expect(firstRowTableData[0].textContent).toBe("battle");
    expect(firstRowTableData[1].textContent).toBe("hunter");
    expect(firstRowTableData[2].textContent).toBe("hunter@gmail.com");
    expect(firstRowTableData[3].textContent).toBe("Organizer");

});

test('test the upcomingEvents function for generating the upcoming events', () => {
    document.body.innerHTML =(`
                        <div id="signup-table-container"></div>`);
    
    const fakeLocalStorage = [
        {event:"case opening", name:"ohen", email:"ohen@gmail.com", role:"Organizer"}
    ];

    //set local storage for testing
    localStorage.setItem("signUpLogs", JSON.stringify(fakeLocalStorage));

    //call function.
    upcomingEvents();

    const tableRow = document.querySelectorAll("#upcoming-events-table tbody tr");
    const tableData = tableRow[0].querySelectorAll('td');

    //test if the table data is event and role.
    expect(tableData[0].textContent).toBe("case opening");
    expect(tableData[1].textContent).toBe("Organizer");

});

test('test that upcomingEvents deletes for rows for upcoming events', () => {
    document.body.innerHTML =(`
                        <div id="signup-table-container"></div>`);
    
    const fakeLocalStorage = [
        {event:"esport", role:"Organizer", extra:"test"},
        {event:"battle", role:"Organizer", extra:"test"}

    ];

    //set local storage for testing
    localStorage.setItem("signUpLogs", JSON.stringify(fakeLocalStorage));

    //initiation the table.
    upcomingEvents();
    //delete the first row.
    deleteSignUp(0);

    //parse to json to check if the object was deleted.
    const localStore = JSON.parse(localStorage.getItem("signUpLogs"));
    
    //testing the localStorage, making sure the other object got deleted.
    expect(localStore.length).toBe(1);
    expect(localStore[0]).toEqual({
        event: "battle",
        role: "Organizer",
        extra: "test"
    })

    const tableRow = document.querySelectorAll("#upcoming-events-table tbody tr");
    const tableData = tableRow[0].querySelectorAll('td');

    //test if the table data is event and role.
    expect(tableData[0].textContent).toBe("battle");
    expect(tableData[1].textContent).toBe("Organizer");
});