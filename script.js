document.addEventListener('DOMContentLoaded', () => {
    // Initialize the storage if not exists
    function initStorage() {
        if (!localStorage.getItem('budgetEntries')) {
            localStorage.setItem('budgetEntries', JSON.stringify([]));
        }
    }

    initStorage();

    // Save entry to local storage
    function saveEntries(entries) {
        localStorage.setItem('budgetEntries', JSON.stringify(entries));
    }

    // Get entries from local storage
    function getEntries() {
        return JSON.parse(localStorage.getItem('budgetEntries')) || [];
    }

    // Generating unique ID for entries
    function generateUniqueId() {
        return Date.now().toString();
    }

    // Form submission event
    const form = document.querySelector('.entry-form');
    form.addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(e) {
        e.preventDefault(); // Prevent page reload
        console.log('Form submitted successfully');

        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const amount = document.getElementById('amount').value;
        const date = document.getElementById('date').value;

        // Input validation
        if (!validateInput(type, category, amount, date)) {
            alert('Please fill in all the fields correctly.');
            return; // Stop if validation fails
        }

        // Create a new entry object
        const newEntry = {
            id: generateUniqueId(),
            type,
            category,
            amount: parseFloat(amount),
            date,
        };

        // Add the new entry to local storage
        const entries = getEntries();
        entries.push(newEntry);
        saveEntries(entries);

        // Update UI
        alert('Entry added successfully!');
        renderEntries();
        updateTotals();

        // Clear form fields
        e.target.reset();
    }

    // Validate inputs
    function validateInput(type, category, amount, date) {
        if (!type || !category || !amount || !date) {
            return false; // Validation fails if any field is empty
        }
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return false; // Amount must be a positive number
        }
        return true; // Validation passes
    }

    // Create entry DOM item
    function createEntryItem(entry) {
        const entryItem = document.createElement('li');
        entryItem.classList.add('entry-item');
        entryItem.setAttribute('data-id', entry.id);

        // Entry details
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('entry-details');

        const categoryName = document.createElement('strong');
        categoryName.textContent = entry.category;

        const typeSpan = document.createElement('span');
        typeSpan.textContent = `(${entry.type})`;

        const amountDateP = document.createElement('p');
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(entry.amount);
        amountDateP.textContent = `${formattedAmount} - ${entry.date}`;

        detailsDiv.appendChild(categoryName);
        detailsDiv.appendChild(typeSpan);
        detailsDiv.appendChild(amountDateP);

        // Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('entry-actions');

        const editButton = document.createElement('button');
        editButton.textContent = '✏️';
        editButton.addEventListener('click', () => handleEditEntry(entry.id));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => handleDeleteEntry(entry.id));

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);

        entryItem.appendChild(detailsDiv);
        entryItem.appendChild(actionsDiv);

        return entryItem;
    }

    // Render entries to the DOM
    function renderEntries() {
        const entriesList = document.querySelector('.entry-list');
        const entries = getEntries();

        // Clear existing entries
        entriesList.innerHTML = '';

        // If no entries, show a message
        if (entries.length === 0) {
            const noEntriesMessage = document.createElement('li');
            noEntriesMessage.textContent = 'No entries found';
            noEntriesMessage.classList.add('no-entries');
            entriesList.appendChild(noEntriesMessage);
            return;
        }

        // Render each entry
        entries.forEach(entry => {
            const entryItem = createEntryItem(entry); // Corrected function usage
            entriesList.appendChild(entryItem);
        });
    }

    // Edit entry
    function handleEditEntry(entryId) {
        const entries = getEntries();
        const entryToEdit = entries.find(entry => entry.id === entryId);

        if (!entryToEdit) return;

        document.getElementById('type').value = entryToEdit.type;
        document.getElementById('category').value = entryToEdit.category;
        document.getElementById('amount').value = entryToEdit.amount;
        document.getElementById('date').value = entryToEdit.date;

        // Remove the old entry
        const updatedEntries = entries.filter(entry => entry.id !== entryId);
        saveEntries(updatedEntries);

        renderEntries();
        updateTotals();
    }

    // Delete entry
    function handleDeleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        const entries = getEntries();
        const updatedEntries = entries.filter(entry => entry.id !== entryId);
        saveEntries(updatedEntries);

        renderEntries();
        updateTotals();
    }

    // Update totals
    function updateTotals() {
        const entries = getEntries();
        const totalIncome = entries
            .filter(entry => entry.type === 'income')
            .reduce((total, entry) => total + entry.amount, 0);
        const totalExpense = entries
            .filter(entry => entry.type === 'expense')
            .reduce((total, entry) => total + entry.amount, 0);
        const balance = totalIncome - totalExpense;

        updateTotalUI(totalIncome, totalExpense, balance);
    }

    // Update totals in the UI
    function updateTotalUI(income, expenses, balance) {
        const incomeAmount = document.querySelector('.income-amount');
        const expenseAmount = document.querySelector('.expense-amount');
        const balanceAmount = document.querySelector('.balance-amount');

        incomeAmount.textContent = `$${income.toFixed(2)}`;
        expenseAmount.textContent = `$${expenses.toFixed(2)}`;
        balanceAmount.textContent = `$${balance.toFixed(2)}`;
    }

    // Initial render
    renderEntries();
    updateTotals();
});
