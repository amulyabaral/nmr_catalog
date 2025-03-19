// Tag filtering
document.addEventListener('DOMContentLoaded', function() {
    // Filter functionality
    setupFilters();
    
    // View button functionality
    setupViewButtons();
});

function setupFilters() {
    // Country filters
    const countryButtons = document.querySelectorAll('.country-btn');
    countryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            countryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected country
            const selectedCountry = this.getAttribute('data-country');
            
            // Filter table rows
            filterTableRows('country', selectedCountry);
        });
    });
    
    // Data type filters
    const dataTypeButtons = document.querySelectorAll('.data-type-btn');
    dataTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            dataTypeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected data type
            const selectedType = this.getAttribute('data-type');
            
            // Filter table rows
            filterTableRows('category', selectedType);
        });
    });
    
    // Tag filters
    const tagButtons = document.querySelectorAll('.tag-btn');
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle active class
            this.classList.toggle('active');
            
            // Get all active tags
            const activeTags = Array.from(document.querySelectorAll('.tag-btn.active'))
                .map(btn => btn.getAttribute('data-tag'));
            
            // Filter table rows by tags
            filterTableRowsByTags(activeTags);
        });
    });
}

function filterTableRows(attribute, value) {
    const tableRows = document.querySelectorAll('#data-table-body tr');
    
    tableRows.forEach(row => {
        if (value === 'all' || row.getAttribute(`data-${attribute}`).includes(value)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterTableRowsByTags(activeTags) {
    // If no tags are active, show all rows
    if (activeTags.length === 0) {
        document.querySelectorAll('#data-table-body tr').forEach(row => {
            row.style.display = '';
        });
        return;
    }
    
    // Filter rows based on active tags
    const tableRows = document.querySelectorAll('#data-table-body tr');
    tableRows.forEach(row => {
        const rowTags = row.getAttribute('data-tags').split(',').map(tag => tag.trim());
        
        // Check if any of the active tags match this row's tags
        const hasMatchingTag = activeTags.some(tag => rowTags.includes(tag));
        
        if (hasMatchingTag) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function setupViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dataId = this.getAttribute('data-id');
            // Implement view functionality (e.g., modal with details)
            alert(`View details for data point ${dataId}`);
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 