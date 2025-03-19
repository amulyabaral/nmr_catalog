// Tag filtering
document.addEventListener('DOMContentLoaded', function() {
    // Setup browse tabs
    setupBrowseTabs();
    
    // Setup category checkboxes
    setupCategoryCheckboxes();
    
    // Setup explore button
    setupExploreButton();
    
    // Setup resource hierarchy visualization
    setupResourceHierarchy();
    
    // Setup view buttons
    setupViewButtons();
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
                // Add to selected categories
                addSelectedCategory(category, value);
            } else {
                // Remove from selected categories
                removeSelectedCategory(category, value);
            }
            
            // Update the explore button state
            updateExploreButtonState();
        });
    });
}

function addSelectedCategory(category, value) {
    const container = document.querySelector(`#selected-${category}s .selected-tags`);
    
    // Check if this category is already selected
    if (document.querySelector(`#selected-${category}s .selected-tag[data-value="${value}"]`)) {
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
    
    // Add to container
    container.appendChild(tag);
    
    // Add event listener to remove button
    tag.querySelector('.remove-tag').addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        const value = this.getAttribute('data-value');
        
        // Uncheck the corresponding checkbox
        document.querySelector(`.category-checkbox[data-category="${category}"][value="${value}"]`).checked = false;
        
        // Remove the tag
        removeSelectedCategory(category, value);
        
        // Update the explore button state
        updateExploreButtonState();
    });
    
    // Update count
    updateCategoryCount(category);
}

function removeSelectedCategory(category, value) {
    const tag = document.querySelector(`#selected-${category}s .selected-tag[data-value="${value}"]`);
    
    if (tag) {
        tag.remove();
        
        // Update count
        updateCategoryCount(category);
    }
}

function updateCategoryCount(category) {
    const count = document.querySelectorAll(`#selected-${category}s .selected-tag`).length;
    document.querySelector(`#selected-${category}s .count`).textContent = `(${count})`;
}

function updateExploreButtonState() {
    const exploreButton = document.getElementById('explore-button');
    
    // Check if at least one category is selected
    const hasCountry = document.querySelectorAll('#selected-countries .selected-tag').length > 0;
    const hasDomain = document.querySelectorAll('#selected-domains .selected-tag').length > 0;
    const hasResourceType = document.querySelectorAll('#selected-resource-types .selected-tag').length > 0;
    
    // Enable button if at least one category is selected
    exploreButton.disabled = !(hasCountry || hasDomain || hasResourceType);
}

function setupExploreButton() {
    const exploreButton = document.getElementById('explore-button');
    
    exploreButton.addEventListener('click', function() {
        // Get selected categories
        const selectedCountries = Array.from(document.querySelectorAll('#selected-countries .selected-tag'))
            .map(tag => tag.getAttribute('data-value'));
        
        const selectedDomains = Array.from(document.querySelectorAll('#selected-domains .selected-tag'))
            .map(tag => tag.getAttribute('data-value'));
        
        const selectedResourceTypes = Array.from(document.querySelectorAll('#selected-resource-types .selected-tag'))
            .map(tag => tag.getAttribute('data-value'));
        
        // Filter data points based on selections
        filterResults(selectedCountries, selectedDomains, selectedResourceTypes);
        
        // Show results section
        document.querySelector('.results-section').style.display = 'block';
        
        // Scroll to results
        document.querySelector('.results-section').scrollIntoView({
            behavior: 'smooth'
        });
    });
    
    // Setup clear filters button
    document.getElementById('clear-filters').addEventListener('click', function() {
        // Clear all checkboxes
        document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear all selected categories
        document.querySelectorAll('.selected-tags').forEach(container => {
            container.innerHTML = '';
        });
        
        // Update counts
        updateCategoryCount('country');
        updateCategoryCount('domain');
        updateCategoryCount('resource-type');
        
        // Update explore button state
        updateExploreButtonState();
        
        // Hide results section
        document.querySelector('.results-section').style.display = 'none';
    });
}

function filterResults(countries, domains, resourceTypes) {
    const resultsTableBody = document.getElementById('results-table-body');
    resultsTableBody.innerHTML = '';
    
    // Get all data points
    const dataPoints = Array.from(document.querySelectorAll('#data-table-body tr'));
    
    // Filter based on selections
    const filteredPoints = dataPoints.filter(point => {
        const pointCountry = point.getAttribute('data-country');
        const pointDomain = point.getAttribute('data-domain');
        const pointResourceType = point.getAttribute('data-resource-type');
        
        // If no countries selected, don't filter by country
        const countryMatch = countries.length === 0 || countries.includes(pointCountry);
        
        // If no domains selected, don't filter by domain
        const domainMatch = domains.length === 0 || domains.includes(pointDomain);
        
        // If no resource types selected, don't filter by resource type
        const resourceTypeMatch = resourceTypes.length === 0 || resourceTypes.includes(pointResourceType);
        
        return countryMatch && domainMatch && resourceTypeMatch;
    });
    
    // Update results count
    document.getElementById('results-count').textContent = filteredPoints.length;
    
    // Add filtered points to results table
    filteredPoints.forEach(point => {
        const newRow = document.createElement('tr');
        
        // Source ID
        const sourceCell = document.createElement('td');
        sourceCell.textContent = point.cells[0].textContent;
        newRow.appendChild(sourceCell);
        
        // Country
        const countryCell = document.createElement('td');
        countryCell.textContent = point.getAttribute('data-country');
        newRow.appendChild(countryCell);
        
        // Domain
        const domainCell = document.createElement('td');
        domainCell.textContent = point.getAttribute('data-domain');
        newRow.appendChild(domainCell);
        
        // Resource Type
        const resourceTypeCell = document.createElement('td');
        resourceTypeCell.textContent = point.getAttribute('data-resource-type');
        newRow.appendChild(resourceTypeCell);
        
        // Category
        const categoryCell = document.createElement('td');
        categoryCell.textContent = point.cells[1].textContent;
        newRow.appendChild(categoryCell);
        
        // Repository
        const repoCell = document.createElement('td');
        repoCell.textContent = point.cells[4].textContent;
        newRow.appendChild(repoCell);
        
        // Last Updated
        const dateCell = document.createElement('td');
        dateCell.textContent = point.cells[5].textContent;
        newRow.appendChild(dateCell);
        
        // Actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = point.cells[6].innerHTML;
        newRow.appendChild(actionsCell);
        
        resultsTableBody.appendChild(newRow);
    });
    
    // Setup view buttons in results
    setupViewButtons();
}

function setupResourceHierarchy() {
    // Fetch the resource type hierarchy
    fetch('/api/resource-hierarchy')
        .then(response => response.json())
        .then(hierarchy => {
            renderHierarchy(hierarchy);
        })
        .catch(error => {
            console.error('Error fetching resource hierarchy:', error);
        });
}

function renderHierarchy(hierarchy) {
    const container = document.querySelector('.hierarchy-visualization');
    container.innerHTML = ''; // Clear any existing content
    
    // Create a simple tree visualization
    const tree = document.createElement('div');
    tree.className = 'hierarchy-tree';
    
    // For each top-level resource type
    for (const [resourceType, details] of Object.entries(hierarchy)) {
        const resourceNode = createResourceNode(resourceType, details);
        tree.appendChild(resourceNode);
    }
    
    container.appendChild(tree);
}

function createResourceNode(name, details) {
    const node = document.createElement('div');
    node.className = 'hierarchy-node';
    
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'node-header';
    nodeHeader.textContent = name;
    
    node.appendChild(nodeHeader);
    
    // If there are subcategories, create child nodes
    if (details.sub_categories) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'node-children';
        
        for (const [subName, subDetails] of Object.entries(details.sub_categories)) {
            // If subDetails is an object with nested structure
            if (typeof subDetails === 'object' && !Array.isArray(subDetails)) {
                const childNode = createResourceNode(subName, { sub_categories: subDetails });
                childrenContainer.appendChild(childNode);
            } 
            // If subDetails is an array
            else if (Array.isArray(subDetails)) {
                const childNode = document.createElement('div');
                childNode.className = 'hierarchy-node';
                
                const childHeader = document.createElement('div');
                childHeader.className = 'node-header';
                childHeader.textContent = subName;
                
                childNode.appendChild(childHeader);
                
                // Create leaf nodes for array items
                const leafContainer = document.createElement('div');
                leafContainer.className = 'node-children';
                
                subDetails.forEach(item => {
                    if (typeof item === 'object') {
                        // Handle nested objects in arrays
                        for (const [leafName, leafValues] of Object.entries(item)) {
                            const leafNode = createResourceNode(leafName, { sub_categories: leafValues });
                            leafContainer.appendChild(leafNode);
                        }
                    } else {
                        // Simple string item
                        const leafNode = document.createElement('div');
                        leafNode.className = 'hierarchy-leaf';
                        leafNode.textContent = item;
                        leafContainer.appendChild(leafNode);
                    }
                });
                
                childNode.appendChild(leafContainer);
                childrenContainer.appendChild(childNode);
            }
        }
        
        node.appendChild(childrenContainer);
    }
    
    return node;
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