document.addEventListener('DOMContentLoaded', function() {
    // Setup core functionality
    setupBrowseTabs();
    setupCategoryCheckboxes();
    setupExploreButton();
    setupModal();
    
    // Sort by newest entry by default
    const yearHeader = document.querySelector('th[data-sort="year"]');
    if (yearHeader) {
        yearHeader.click();
        yearHeader.click(); // Click twice to sort descending
    }
});

function setupBrowseTabs() {
    const tabs = document.querySelectorAll('.browse-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function setupCategoryCheckboxes() {
    const checkboxes = document.querySelectorAll('.category-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const category = this.getAttribute('data-category');
            const value = this.value;
            
            if (this.checked) {
                addSelectedCategory(category, value);
            } else {
                removeSelectedCategory(category, value);
            }
            
            updateExploreButtonState();
        });
    });
}

function addSelectedCategory(category, value) {
    const containerSelector = `#selected-${category}s .selected-tags`;
    const container = document.querySelector(containerSelector);
    
    if (!container) return;
    
    // Check if already selected
    if (document.querySelector(`${containerSelector} .selected-tag[data-value="${value}"]`)) {
        return;
    }
    
    // Create tag element
    const tag = document.createElement('div');
    tag.className = 'selected-tag';
    tag.setAttribute('data-value', value);
    tag.innerHTML = `
        ${value}
        <span class="remove-tag" data-category="${category}" data-value="${value}">&times;</span>
    `;
    
    container.appendChild(tag);
    
    // Add remove handler
    tag.querySelector('.remove-tag').addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        const value = this.getAttribute('data-value');
        
        // Uncheck corresponding checkbox
        const checkbox = document.querySelector(`.category-checkbox[data-category="${category}"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        removeSelectedCategory(category, value);
        updateExploreButtonState();
    });
    
    updateCategoryCount(category);
}

function removeSelectedCategory(category, value) {
    const tag = document.querySelector(`#selected-${category}s .selected-tag[data-value="${value}"]`);
    if (tag) {
        tag.remove();
        updateCategoryCount(category);
    }
}

function updateCategoryCount(category) {
    const count = document.querySelectorAll(`#selected-${category}s .selected-tag`).length;
    document.querySelector(`#selected-${category}s .count`).textContent = `(${count})`;
}

function updateExploreButtonState() {
    const exploreButton = document.getElementById('explore-button');
    const hasSelection = ['countries', 'domains', 'resource-types'].some(category => 
        document.querySelectorAll(`#selected-${category} .selected-tag`).length > 0
    );
    exploreButton.disabled = !hasSelection;
}

function setupExploreButton() {
    const exploreButton = document.getElementById('explore-button');
    
    exploreButton.addEventListener('click', function() {
        // Get selected categories
        const selectedCategories = {
            countries: getSelectedValues('countries'),
            domains: getSelectedValues('domains'),
            resourceTypes: getSelectedValues('resource-types')
        };
        
        // Filter and display results
        filterAndDisplayResults(selectedCategories);
        
        // Show and scroll to results
        const resultsSection = document.querySelector('.results-section');
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Setup clear filters
    document.getElementById('clear-filters').addEventListener('click', clearAllFilters);
}

function getSelectedValues(category) {
    return Array.from(document.querySelectorAll(`#selected-${category} .selected-tag`))
        .map(tag => tag.getAttribute('data-value'));
}

function clearAllFilters() {
    // Clear checkboxes
    document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear selected tags
    document.querySelectorAll('.selected-tags').forEach(container => {
        container.innerHTML = '';
    });
    
    // Update counts and button state
    ['country', 'domain', 'resource-type'].forEach(updateCategoryCount);
    updateExploreButtonState();
    
    // Hide results
    document.querySelector('.results-section').style.display = 'none';
}

function setupModal() {
    const modal = document.getElementById('resource-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
} 