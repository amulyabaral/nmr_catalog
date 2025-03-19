// Tag filtering
document.addEventListener('DOMContentLoaded', function() {
    // Setup country cards as filters
    setupCountryCards();
    
    // Setup filter buttons
    setupFilters();
    
    // Setup view buttons
    setupViewButtons();
    
    // Setup collapsible sections
    setupCollapsibles();
    
    // Setup reset filters button
    setupResetFilters();
});

function setupCountryCards() {
    const countryCards = document.querySelectorAll('.country-card');
    const countryButtons = document.querySelectorAll('.country-btn');
    
    countryCards.forEach(card => {
        card.addEventListener('click', function() {
            const country = this.getAttribute('data-country');
            
            // Update country filter buttons to match
            countryButtons.forEach(btn => {
                if (btn.getAttribute('data-country') === country) {
                    btn.click(); // Trigger the click on the corresponding filter button
                }
            });
            
            // Scroll to data explorer section
            document.querySelector('.data-browser').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Update active filters display
            updateActiveFilters();
        });
    });
}

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
            
            // Update active filters display
            updateActiveFilters();
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
            
            // Update active filters display
            updateActiveFilters();
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
            
            // Update active filters display
            updateActiveFilters();
        });
    });
}

function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('active-filter-tags');
    activeFiltersContainer.innerHTML = '';
    
    // Get active country
    const activeCountry = document.querySelector('.country-btn.active');
    if (activeCountry && activeCountry.getAttribute('data-country') !== 'all') {
        const countryTag = createFilterTag(activeCountry.textContent, 'country');
        activeFiltersContainer.appendChild(countryTag);
    }
    
    // Get active data type
    const activeDataType = document.querySelector('.data-type-btn.active');
    if (activeDataType && activeDataType.getAttribute('data-type') !== 'all') {
        const dataTypeTag = createFilterTag(activeDataType.textContent, 'data-type');
        activeFiltersContainer.appendChild(dataTypeTag);
    }
    
    // Get active tags
    const activeTags = document.querySelectorAll('.tag-btn.active');
    activeTags.forEach(tag => {
        const tagElement = createFilterTag(tag.textContent, 'tag');
        activeFiltersContainer.appendChild(tagElement);
    });
    
    // Show/hide the active filters section
    const activeFiltersSection = document.querySelector('.active-filters');
    if (activeFiltersContainer.children.length > 0) {
        activeFiltersSection.style.display = 'flex';
    } else {
        activeFiltersSection.style.display = 'none';
    }
}

function createFilterTag(text, type) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.setAttribute('data-filter-type', type);
    tag.textContent = text;
    
    const removeBtn = document.createElement('span');
    removeBtn.className = 'remove-filter';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', function() {
        removeFilter(type, text);
    });
    
    tag.appendChild(removeBtn);
    return tag;
}

function removeFilter(type, text) {
    if (type === 'country') {
        // Reset country filter
        document.querySelector('.country-btn[data-country="all"]').click();
    } else if (type === 'data-type') {
        // Reset data type filter
        document.querySelector('.data-type-btn[data-type="all"]').click();
    } else if (type === 'tag') {
        // Find and deactivate the tag button
        const tagButtons = document.querySelectorAll('.tag-btn');
        tagButtons.forEach(btn => {
            if (btn.textContent.trim() === text.trim()) {
                btn.classList.remove('active');
            }
        });
        
        // Reapply tag filters
        const activeTags = Array.from(document.querySelectorAll('.tag-btn.active'))
            .map(btn => btn.getAttribute('data-tag'));
        filterTableRowsByTags(activeTags);
    }
    
    // Update active filters display
    updateActiveFilters();
}

function setupResetFilters() {
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset country filter
            document.querySelector('.country-btn[data-country="all"]').click();
            
            // Reset data type filter
            document.querySelector('.data-type-btn[data-type="all"]').click();
            
            // Reset tag filters
            document.querySelectorAll('.tag-btn.active').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show all table rows
            document.querySelectorAll('#data-table-body tr').forEach(row => {
                row.style.display = '';
            });
            
            // Update active filters display
            updateActiveFilters();
        });
    }
}

function setupCollapsibles() {
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(collapsible => {
        const header = collapsible.querySelector('.collapsible-header');
        const content = collapsible.querySelector('.collapsible-content');
        const icon = collapsible.querySelector('.toggle-icon');
        
        // Initially hide content
        content.style.display = 'none';
        
        header.addEventListener('click', function() {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '-';
            } else {
                content.style.display = 'none';
                icon.textContent = '+';
            }
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