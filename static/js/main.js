// Tag filtering
document.addEventListener('DOMContentLoaded', function() {
    // Setup browse tabs
    setupBrowseTabs();
    
    // Setup category checkboxes
    setupCategoryCheckboxes();
    
    // Setup explore button
    setupExploreButton();
    
    // Setup view buttons
    setupViewButtons();
    
    // Setup modal
    setupModal();
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
        
        // Filter and stratify results based on selections
        filterAndStratifyResults(selectedCountries, selectedDomains, selectedResourceTypes);
        
        // Show results section
        document.querySelector('.results-section').style.display = 'block';
        
        // Scroll to results
        document.querySelector('.results-section').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Fetch and render resource hierarchy
        fetchAndRenderHierarchy(selectedResourceTypes);
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

function filterAndStratifyResults(countries, domains, resourceTypes) {
    const stratifiedResults = document.getElementById('stratified-results');
    stratifiedResults.innerHTML = '';
    
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
    
    // If no resource types selected, show all results without stratification
    if (resourceTypes.length === 0) {
        createResultsTable(filteredPoints, 'All Resources', stratifiedResults);
        return;
    }
    
    // Group results by resource type
    const groupedResults = {};
    
    filteredPoints.forEach(point => {
        const resourceType = point.getAttribute('data-resource-type');
        
        if (!groupedResults[resourceType]) {
            groupedResults[resourceType] = [];
        }
        
        groupedResults[resourceType].push(point);
    });
    
    // Create a section for each resource type
    for (const resourceType of resourceTypes) {
        if (groupedResults[resourceType] && groupedResults[resourceType].length > 0) {
            const resourceTypeSection = document.createElement('div');
            resourceTypeSection.className = 'resource-type-section';
            
            createResultsTable(groupedResults[resourceType], resourceType, resourceTypeSection);
            
            stratifiedResults.appendChild(resourceTypeSection);
        }
    }
}

function createResultsTable(dataPoints, title, container) {
    // Create section title
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'resource-section-title';
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);
    
    // Create filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-controls';
    
    // Get unique categories for this resource type
    const categories = [...new Set(dataPoints.map(point => point.getAttribute('data-category')))];
    
    if (categories.length > 0) {
        const categoryFilter = document.createElement('div');
        categoryFilter.className = 'filter-dropdown';
        
        const categoryLabel = document.createElement('label');
        categoryLabel.textContent = 'Filter by Category: ';
        categoryLabel.setAttribute('for', `category-filter-${title.replace(/\s+/g, '-').toLowerCase()}`);
        
        const categorySelect = document.createElement('select');
        categorySelect.id = `category-filter-${title.replace(/\s+/g, '-').toLowerCase()}`;
        categorySelect.className = 'category-filter';
        categorySelect.setAttribute('data-resource-type', title);
        
        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Categories';
        categorySelect.appendChild(allOption);
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        
        // Add event listener
        categorySelect.addEventListener('change', function() {
            filterResourceTypeResults(this.value, title);
        });
        
        categoryFilter.appendChild(categoryLabel);
        categoryFilter.appendChild(categorySelect);
        filterControls.appendChild(categoryFilter);
    }
    
    container.appendChild(filterControls);
    
    // Create results table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'data-table';
    
    const table = document.createElement('table');
    table.id = `results-table-${title.replace(/\s+/g, '-').toLowerCase()}`;
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Year</th>
            <th>Repository</th>
            <th>Actions</th>
        </tr>
    `;
    
    const tbody = document.createElement('tbody');
    
    // Add data points to table
    dataPoints.forEach(point => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-category', point.getAttribute('data-category'));
        tr.setAttribute('data-subcategory', point.getAttribute('data-subcategory'));
        
        // Title with link
        const titleCell = document.createElement('td');
        const titleLink = document.createElement('a');
        titleLink.href = point.querySelector('a').href;
        titleLink.target = '_blank';
        titleLink.textContent = point.getAttribute('data-title');
        titleCell.appendChild(titleLink);
        tr.appendChild(titleCell);
        
        // Category
        const categoryCell = document.createElement('td');
        categoryCell.textContent = point.getAttribute('data-category');
        tr.appendChild(categoryCell);
        
        // Year
        const yearCell = document.createElement('td');
        yearCell.textContent = point.getAttribute('data-year');
        tr.appendChild(yearCell);
        
        // Repository
        const repoCell = document.createElement('td');
        repoCell.textContent = point.cells[4].textContent;
        tr.appendChild(repoCell);
        
        // Actions
        const actionsCell = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.className = 'action-btn view-btn';
        viewButton.setAttribute('data-id', point.querySelector('.view-btn').getAttribute('data-id'));
        viewButton.textContent = 'View Details';
        actionsCell.appendChild(viewButton);
        tr.appendChild(actionsCell);
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
    
    // Setup view buttons in results
    setupViewButtons();
}

function filterResourceTypeResults(category, resourceType) {
    const tableId = `results-table-${resourceType.replace(/\s+/g, '-').toLowerCase()}`;
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    rows.forEach(row => {
        if (!category || row.getAttribute('data-category') === category) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function fetchAndRenderHierarchy(selectedResourceTypes) {
    // Fetch the resource type hierarchy
    fetch('/api/resource-hierarchy')
        .then(response => response.json())
        .then(hierarchy => {
            renderHierarchyTree(hierarchy, selectedResourceTypes);
        })
        .catch(error => {
            console.error('Error fetching resource hierarchy:', error);
        });
}

function renderHierarchyTree(hierarchy, selectedResourceTypes) {
    const container = document.getElementById('hierarchy-tree');
    container.innerHTML = ''; // Clear any existing content
    
    // For each top-level resource type
    for (const [resourceType, details] of Object.entries(hierarchy)) {
        // Only show selected resource types or all if none selected
        if (selectedResourceTypes.length === 0 || selectedResourceTypes.includes(resourceType)) {
            const resourceNode = createHierarchyNode(resourceType, details, selectedResourceTypes);
            container.appendChild(resourceNode);
        }
    }
}

function createHierarchyNode(name, details, selectedResourceTypes) {
    const isSelected = selectedResourceTypes.includes(name);
    
    const node = document.createElement('div');
    node.className = `hierarchy-node ${isSelected ? 'selected' : ''}`;
    
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'node-header';
    nodeHeader.textContent = name;
    
    // Make node header clickable to filter results
    nodeHeader.addEventListener('click', function() {
        filterAndHighlightCategory(name);
    });
    
    node.appendChild(nodeHeader);
    
    // If there are subcategories, create child nodes
    if (details.sub_categories) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'node-children';
        
        for (const [subName, subDetails] of Object.entries(details.sub_categories)) {
            const subNode = document.createElement('div');
            subNode.className = 'hierarchy-subnode';
            
            const subHeader = document.createElement('div');
            subHeader.className = 'subnode-header';
            subHeader.textContent = subName;
            
            // Make subnode header clickable to filter results
            subHeader.addEventListener('click', function() {
                filterAndHighlightSubcategory(name, subName);
            });
            
            subNode.appendChild(subHeader);
            
            // Add to container
            childrenContainer.appendChild(subNode);
        }
        
        node.appendChild(childrenContainer);
    }
    
    return node;
}

function filterAndHighlightCategory(category) {
    // Highlight the selected category in the hierarchy
    document.querySelectorAll('.hierarchy-node').forEach(node => {
        if (node.querySelector('.node-header').textContent === category) {
            node.classList.add('selected');
        } else {
            node.classList.remove('selected');
        }
    });
    
    // Filter results to show only this category
    const resourceTypeSections = document.querySelectorAll('.resource-type-section');
    
    resourceTypeSections.forEach(section => {
        const sectionTitle = section.querySelector('.resource-section-title').textContent;
        
        if (sectionTitle === category) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });
}

function filterAndHighlightSubcategory(resourceType, subcategory) {
    // Highlight the selected subcategory in the hierarchy
    document.querySelectorAll('.subnode-header').forEach(header => {
        if (header.textContent === subcategory) {
            header.classList.add('selected');
        } else {
            header.classList.remove('selected');
        }
    });
    
    // Filter results to show only this subcategory
    const tableId = `results-table-${resourceType.replace(/\s+/g, '-').toLowerCase()}`;
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    rows.forEach(row => {
        if (row.getAttribute('data-category') === subcategory) {
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
            showResourceDetails(dataId);
        });
    });
}

function setupModal() {
    // Get the modal
    const modal = document.getElementById('resource-modal');
    
    // Get the <span> element that closes the modal
    const closeBtn = document.querySelector('.close-modal');
    
    // When the user clicks on <span> (x), close the modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function showResourceDetails(dataId) {
    // In a real application, you would fetch the details from the server
    // For now, we'll just show some dummy data
    
    // Find the data point in the table
    const dataPoint = document.querySelector(`#data-table-body tr .view-btn[data-id="${dataId}"]`).closest('tr');
    
    const title = dataPoint.getAttribute('data-title');
    const category = dataPoint.getAttribute('data-category');
    const subcategory = dataPoint.getAttribute('data-subcategory');
    const country = dataPoint.getAttribute('data-country');
    const domain = dataPoint.getAttribute('data-domain');
    const resourceType = dataPoint.getAttribute('data-resource-type');
    const year = dataPoint.getAttribute('data-year');
    const repository = dataPoint.cells[4].textContent;
    const repositoryUrl = dataPoint.querySelector('a').href;
    
    // Set modal title
    document.getElementById('modal-title').textContent = title;
    
    // Set modal details
    document.getElementById('modal-details').innerHTML = `
        <div class="modal-detail-row">
            <strong>Category:</strong> ${category}
        </div>
        <div class="modal-detail-row">
            <strong>Subcategory:</strong> ${subcategory}
        </div>
        <div class="modal-detail-row">
            <strong>Country:</strong> ${country}
        </div>
        <div class="modal-detail-row">
            <strong>Domain:</strong> ${domain}
        </div>
        <div class="modal-detail-row">
            <strong>Resource Type:</strong> ${resourceType}
        </div>
        <div class="modal-detail-row">
            <strong>Year:</strong> ${year}
        </div>
        <div class="modal-detail-row">
            <strong>Repository:</strong> ${repository}
        </div>
        <div class="modal-detail-row">
            <a href="${repositoryUrl}" target="_blank" class="modal-link">Go to Resource</a>
        </div>
    `;
    
    // Show the modal
    document.getElementById('resource-modal').style.display = 'block';
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