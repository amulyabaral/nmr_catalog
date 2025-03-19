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
    
    // Setup sortable columns
    setupSortableColumns();
    
    // Setup clickable rows
    setupClickableRows();
    
    // Add click handlers for data tags
    document.querySelectorAll('.data-tag[data-filter]').forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent row click
            const filterType = this.getAttribute('data-filter');
            const filterValue = this.getAttribute('data-value');
            
            // Apply filter to the data table
            filterDataTable(filterType, filterValue);
        });
    });
    
    // Sort by newest entry by default (assuming year is the last column)
    const yearHeader = document.querySelector('th[data-sort="year"]');
    if (yearHeader) {
        yearHeader.click();
        yearHeader.click(); // Click twice to sort descending (newest first)
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
        const checkbox = document.querySelector(`.category-checkbox[data-category="${category}"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
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
    
    // Check if at least one category is selected from any group
    const hasCountry = document.querySelectorAll('#selected-countries .selected-tag').length > 0;
    const hasDomain = document.querySelectorAll('#selected-domains .selected-tag').length > 0;
    const hasResourceType = document.querySelectorAll('#selected-resource-types .selected-tag').length > 0;
    
    // Enable button if at least one category is selected from any group
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
        // For countries, check both the primary country and countries in metadata
        const pointCountry = point.getAttribute('data-country');
        const countryTags = Array.from(point.querySelectorAll('.country-tag')).map(tag => 
            tag.getAttribute('data-value')
        );
        
        // For domains, check both the primary domain and domains in metadata
        const pointDomain = point.getAttribute('data-domain');
        const domainTags = Array.from(point.querySelectorAll('.domain-tag')).map(tag => 
            tag.getAttribute('data-value')
        );
        
        const pointResourceType = point.getAttribute('data-resource-type');
        
        // If no countries selected, don't filter by country
        const countryMatch = countries.length === 0 || 
                            countries.includes(pointCountry) || 
                            countries.some(c => countryTags.includes(c));
        
        // If no domains selected, don't filter by domain
        const domainMatch = domains.length === 0 || 
                           domains.includes(pointDomain) || 
                           domains.some(d => domainTags.includes(d));
        
        // If no resource types selected, don't filter by resource type
        const resourceTypeMatch = resourceTypes.length === 0 || 
                                 resourceTypes.includes(pointResourceType);
        
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
    for (const resourceType in groupedResults) {
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
        
        // Add data-type attribute if available
        if (point.hasAttribute('data-data-type')) {
            tr.setAttribute('data-data-type', point.getAttribute('data-data-type'));
        }
        
        // Title with link and metadata
        const titleCell = document.createElement('td');
        const titleLink = document.createElement('a');
        titleLink.href = point.querySelector('a').href;
        titleLink.target = '_blank';
        titleLink.textContent = point.getAttribute('data-title');
        
        // Add metadata display
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'resource-metadata';
        
        // Add subcategory
        const subcategory = point.getAttribute('data-subcategory');
        if (subcategory) {
            const subcategorySpan = document.createElement('span');
            subcategorySpan.className = 'metadata-item';
            subcategorySpan.textContent = subcategory;
            metadataDiv.appendChild(subcategorySpan);
        }
        
        // Add data type if available
        const dataType = point.getAttribute('data-data-type');
        if (dataType) {
            const dataTypeSpan = document.createElement('span');
            dataTypeSpan.className = 'metadata-item';
            dataTypeSpan.textContent = dataType;
            metadataDiv.appendChild(dataTypeSpan);
        }
        
        titleCell.appendChild(titleLink);
        titleCell.appendChild(metadataDiv);
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

function createHierarchyNode(name, details, selectedResourceTypes, parentPath = []) {
    const isSelected = selectedResourceTypes.includes(name);
    const currentPath = [...parentPath, name];
    
    const node = document.createElement('div');
    node.className = `hierarchy-node ${isSelected ? 'selected' : ''}`;
    node.setAttribute('data-path', currentPath.join('/'));
    
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'node-header';
    nodeHeader.textContent = name;
    
    // Make node header clickable to filter results
    nodeHeader.addEventListener('click', function() {
        filterAndHighlightCategory(name, currentPath);
    });
    
    node.appendChild(nodeHeader);
    
    // If there are subcategories, create child nodes
    if (details.sub_categories) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'node-children';
        
        for (const [subName, subDetails] of Object.entries(details.sub_categories)) {
            // Create subcategory node
            const subPath = [...currentPath, subName];
            const subNode = document.createElement('div');
            subNode.className = 'hierarchy-subnode';
            subNode.setAttribute('data-path', subPath.join('/'));
            
            const subHeader = document.createElement('div');
            subHeader.className = 'subnode-header';
            subHeader.textContent = subName;
            
            // Make subnode header clickable to filter results
            subHeader.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent parent node click
                filterAndHighlightSubcategory(name, subName, subPath);
            });
            
            subNode.appendChild(subHeader);
            
            // If this subcategory has further children, recursively add them
            if (Array.isArray(subDetails)) {
                const subChildrenContainer = document.createElement('div');
                subChildrenContainer.className = 'node-children';
                
                // Process array of subcategories
                subDetails.forEach(item => {
                    if (typeof item === 'object') {
                        // Handle nested objects
                        for (const [deepName, deepDetails] of Object.entries(item)) {
                            const deepPath = [...subPath, deepName];
                            const deepNode = createDeepNode(deepName, deepDetails, deepPath);
                            subChildrenContainer.appendChild(deepNode);
                        }
                    } else if (typeof item === 'string') {
                        // Handle string items
                        const leafPath = [...subPath, item];
                        const leafNode = createLeafNode(item, leafPath);
                        subChildrenContainer.appendChild(leafNode);
                    }
                });
                
                subNode.appendChild(subChildrenContainer);
            } else if (typeof subDetails === 'object' && !Array.isArray(subDetails)) {
                // Handle direct object subcategories
                const subChildrenContainer = document.createElement('div');
                subChildrenContainer.className = 'node-children';
                
                for (const [deepName, deepDetails] of Object.entries(subDetails)) {
                    const deepPath = [...subPath, deepName];
                    const deepNode = createDeepNode(deepName, deepDetails, deepPath);
                    subChildrenContainer.appendChild(deepNode);
                }
                
                subNode.appendChild(subChildrenContainer);
            }
            
            // Add to container
            childrenContainer.appendChild(subNode);
        }
        
        node.appendChild(childrenContainer);
    }
    
    return node;
}

function createDeepNode(name, details, path) {
    const node = document.createElement('div');
    node.className = 'hierarchy-deepnode';
    node.setAttribute('data-path', path.join('/'));
    
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'deepnode-header';
    nodeHeader.textContent = name;
    
    // Make deep node header clickable
    nodeHeader.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent parent clicks
        filterByDeepCategory(path);
    });
    
    node.appendChild(nodeHeader);
    
    // If there are further children
    if (Array.isArray(details)) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'node-children';
        
        details.forEach(item => {
            if (typeof item === 'string') {
                const leafPath = [...path, item];
                const leafNode = createLeafNode(item, leafPath);
                childrenContainer.appendChild(leafNode);
            } else if (typeof item === 'object') {
                for (const [leafName, leafDetails] of Object.entries(item)) {
                    const leafPath = [...path, leafName];
                    const leafNode = createLeafNode(leafName, leafPath);
                    childrenContainer.appendChild(leafNode);
                }
            }
        });
        
        node.appendChild(childrenContainer);
    }
    
    return node;
}

function createLeafNode(name, path) {
    const node = document.createElement('div');
    node.className = 'hierarchy-leafnode';
    node.setAttribute('data-path', path.join('/'));
    
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'leafnode-header';
    nodeHeader.textContent = name;
    
    // Make leaf node header clickable
    nodeHeader.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent parent clicks
        filterByLeafCategory(path);
    });
    
    node.appendChild(nodeHeader);
    return node;
}

function filterAndHighlightCategory(category, path) {
    // Reset all selections
    resetAllSelections();
    
    // Highlight the selected category in the hierarchy
    const selectedNode = document.querySelector(`.hierarchy-node[data-path="${path.join('/')}"]`);
    if (selectedNode) {
        selectedNode.classList.add('selected');
    }
    
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
    
    // Update active filters display
    updateActiveFilters([{ type: 'category', value: category }]);
}

function filterAndHighlightSubcategory(resourceType, subcategory, path) {
    // Reset all selections
    resetAllSelections();
    
    // Highlight the selected subcategory in the hierarchy
    const selectedNode = document.querySelector(`.hierarchy-subnode[data-path="${path.join('/')}"]`);
    if (selectedNode) {
        selectedNode.classList.add('selected');
        
        // Also highlight parent
        const parentPath = path.slice(0, -1).join('/');
        const parentNode = document.querySelector(`.hierarchy-node[data-path="${parentPath}"]`);
        if (parentNode) {
            parentNode.classList.add('selected');
        }
    }
    
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
    
    // Update active filters display
    updateActiveFilters([
        { type: 'category', value: resourceType },
        { type: 'subcategory', value: subcategory }
    ]);
}

function filterByDeepCategory(path) {
    // Reset all selections
    resetAllSelections();
    
    // Get the resource type (first element in path)
    const resourceType = path[0];
    // Get the category (second element in path)
    const category = path[1];
    // Get the subcategory (third element in path)
    const subcategory = path[2];
    // Get the deep category (last element in path)
    const deepCategory = path[path.length - 1];
    
    // Highlight the selected node in the hierarchy
    const selectedNode = document.querySelector(`[data-path="${path.join('/')}"]`);
    if (selectedNode) {
        selectedNode.classList.add('selected');
        
        // Also highlight parents
        for (let i = 1; i < path.length; i++) {
            const parentPath = path.slice(0, i).join('/');
            const parentNode = document.querySelector(`[data-path="${parentPath}"]`);
            if (parentNode) {
                parentNode.classList.add('selected');
            }
        }
    }
    
    // Filter results
    const tableId = `results-table-${resourceType.replace(/\s+/g, '-').toLowerCase()}`;
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    rows.forEach(row => {
        // Check if the row matches all criteria in the path
        const rowCategory = row.getAttribute('data-category');
        const rowSubcategory = row.getAttribute('data-subcategory');
        const rowDataType = row.getAttribute('data-data-type');
        
        // Match based on available data attributes
        if (rowCategory === category && 
            (subcategory === undefined || rowSubcategory === subcategory) &&
            (rowDataType && rowDataType.includes(deepCategory))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update active filters
    const filters = path.map((item, index) => {
        let type;
        if (index === 0) type = 'category';
        else if (index === 1) type = 'subcategory';
        else if (index === 2) type = 'data-type';
        else type = 'deep-filter';
        
        return { type, value: item };
    });
    
    updateActiveFilters(filters);
}

function filterByLeafCategory(path) {
    // Similar to filterByDeepCategory but for leaf nodes
    filterByDeepCategory(path); // Reuse the same logic
}

function resetAllSelections() {
    // Remove selected class from all nodes
    document.querySelectorAll('.hierarchy-node, .hierarchy-subnode, .hierarchy-deepnode, .hierarchy-leafnode').forEach(node => {
        node.classList.remove('selected');
    });
    
    document.querySelectorAll('.node-header, .subnode-header, .deepnode-header, .leafnode-header').forEach(header => {
        header.classList.remove('selected');
    });
}

function updateActiveFilters(filters) {
    const activeFiltersContainer = document.getElementById('active-filter-tags');
    activeFiltersContainer.innerHTML = '';
    
    filters.forEach(filter => {
        const filterTag = document.createElement('div');
        filterTag.className = 'filter-tag';
        filterTag.innerHTML = `
            <span class="filter-type">${filter.type}:</span> ${filter.value}
            <span class="remove-filter" data-type="${filter.type}" data-value="${filter.value}">&times;</span>
        `;
        
        // Add click handler to remove filter
        filterTag.querySelector('.remove-filter').addEventListener('click', function() {
            // Clear this filter
            resetAllSelections();
            
            // Refresh results
            const selectedResourceTypes = Array.from(document.querySelectorAll('#selected-resource-types .selected-tag'))
                .map(tag => tag.getAttribute('data-value'));
            
            filterAndStratifyResults(
                Array.from(document.querySelectorAll('#selected-countries .selected-tag'))
                    .map(tag => tag.getAttribute('data-value')),
                Array.from(document.querySelectorAll('#selected-domains .selected-tag'))
                    .map(tag => tag.getAttribute('data-value')),
                selectedResourceTypes
            );
        });
        
        activeFiltersContainer.appendChild(filterTag);
    });
    
    // Show active filters container if there are filters
    document.querySelector('.active-filters').style.display = filters.length > 0 ? 'flex' : 'none';
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
    // Fetch the data point details from the server
    fetch(`/api/data-point/${dataId}`)
        .then(response => response.json())
        .then(data => {
            // Set modal title
            document.getElementById('modal-title').textContent = data.metadata.title || data.data_source_id;
            
            // Set resource link
            const resourceLink = document.getElementById('resource-link');
            resourceLink.href = data.repository_url;
            
            // Build the details HTML
            let detailsHTML = '';
            
            // Basic Information Section
            detailsHTML += `
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <div class="detail-row">
                        <div class="detail-label">ID:</div>
                        <div class="detail-value">${data.data_source_id}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Resource Type:</div>
                        <div class="detail-value">${data.resource_type}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Category:</div>
                        <div class="detail-value">${data.category}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Subcategory:</div>
                        <div class="detail-value">${data.subcategory}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Data Format:</div>
                        <div class="detail-value">${data.data_format}</div>
                    </div>
                </div>
            `;
            
            // Countries and Domains Section
            detailsHTML += `
                <div class="detail-section">
                    <h3>Coverage</h3>
                    <div class="detail-row">
                        <div class="detail-label">Countries:</div>
                        <div class="detail-value">
                            <div class="tag-list">
                                ${(data.metadata.countries || [data.country]).map(country => 
                                    `<span class="data-tag country-tag">${country}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Domains:</div>
                        <div class="detail-value">
                            <div class="tag-list">
                                ${(data.metadata.domains || [data.domain]).map(domain => 
                                    `<span class="data-tag domain-tag">${domain}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Years:</div>
                        <div class="detail-value">${data.metadata.years ? data.metadata.years.join(', ') : data.last_updated.substring(0, 4)}</div>
                    </div>
                </div>
            `;
            
            // Description Section
            detailsHTML += `
                <div class="detail-section">
                    <h3>Description</h3>
                    <div class="detail-row">
                        <div class="detail-value">${data.data_description}</div>
                    </div>
                </div>
            `;
            
            // Keywords Section
            detailsHTML += `
                <div class="detail-section">
                    <h3>Keywords</h3>
                    <div class="detail-row">
                        <div class="detail-value">
                            <div class="tag-list">
                                ${data.keywords.split(',').map(keyword => 
                                    `<span class="data-tag">${keyword.trim()}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Contact Information
            detailsHTML += `
                <div class="detail-section">
                    <h3>Contact Information</h3>
                    <div class="detail-row">
                        <div class="detail-value">${data.contact_information}</div>
                    </div>
                </div>
            `;
            
            // Set the details HTML
            document.getElementById('modal-details').innerHTML = detailsHTML;
            
            // Show the modal
            document.getElementById('resource-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching data point details:', error);
            
            // Fallback to using the data from the table row if API fails
            const dataPoint = document.querySelector(`.data-row[data-id="${dataId}"]`);
            
            const title = dataPoint.getAttribute('data-title');
            const category = dataPoint.getAttribute('data-category');
            const subcategory = dataPoint.getAttribute('data-subcategory');
            const country = dataPoint.getAttribute('data-country');
            const domain = dataPoint.getAttribute('data-domain');
            const resourceType = dataPoint.getAttribute('data-resource-type');
            const tags = dataPoint.getAttribute('data-tags');
            const repositoryUrl = dataPoint.querySelector('a').href;
            
            // Set modal title
            document.getElementById('modal-title').textContent = title;
            
            // Set resource link
            document.getElementById('resource-link').href = repositoryUrl;
            
            // Build simplified details HTML
            let detailsHTML = `
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <div class="detail-row">
                        <div class="detail-label">Resource Type:</div>
                        <div class="detail-value">${resourceType}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Category:</div>
                        <div class="detail-value">${category}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Subcategory:</div>
                        <div class="detail-value">${subcategory}</div>
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Coverage</h3>
                    <div class="detail-row">
                        <div class="detail-label">Country:</div>
                        <div class="detail-value">${country}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Domain:</div>
                        <div class="detail-value">${domain}</div>
                    </div>
                </div>
            `;
            
            // Set the details HTML
            document.getElementById('modal-details').innerHTML = detailsHTML;
            
            // Show the modal
            document.getElementById('resource-modal').style.display = 'block';
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

// Function to filter the data table
function filterDataTable(filterType, filterValue) {
    const rows = document.querySelectorAll('#data-table-body tr');
    
    rows.forEach(row => {
        const rowValue = row.getAttribute(`data-${filterType}`);
        
        // For countries and domains, check if they're in the metadata
        if (filterType === 'country' || filterType === 'domain') {
            const tags = row.querySelectorAll(`.${filterType}-tag`);
            let hasMatch = false;
            
            tags.forEach(tag => {
                if (tag.getAttribute('data-value') === filterValue) {
                    hasMatch = true;
                }
            });
            
            if (hasMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        } 
        // For other filters, check the data attribute directly
        else if (rowValue === filterValue) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show active filter
    const activeFiltersContainer = document.createElement('div');
    activeFiltersContainer.className = 'active-filters';
    activeFiltersContainer.innerHTML = `
        <span class="filter-label">Active filter:</span>
        <div class="filter-tag">
            <span class="filter-type">${filterType}:</span> ${filterValue}
            <span class="remove-filter" id="clear-table-filter">&times;</span>
        </div>
    `;
    
    // Remove any existing active filters
    const existingFilters = document.querySelector('.data-browser .active-filters');
    if (existingFilters) {
        existingFilters.remove();
    }
    
    // Add the new active filters
    const dataTable = document.querySelector('.data-table');
    dataTable.parentNode.insertBefore(activeFiltersContainer, dataTable);
    
    // Add click handler to clear filter
    document.getElementById('clear-table-filter').addEventListener('click', function() {
        // Show all rows
        rows.forEach(row => {
            row.style.display = '';
        });
        
        // Remove active filters
        activeFiltersContainer.remove();
    });
}

// Setup sortable columns
function setupSortableColumns() {
    const headers = document.querySelectorAll('.sortable');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            const isAscending = !this.classList.contains('asc');
            
            // Remove active class and sort direction from all headers
            headers.forEach(h => {
                h.classList.remove('active', 'asc', 'desc');
                h.querySelector('.sort-icon').textContent = '';
            });
            
            // Add active class and sort direction to clicked header
            this.classList.add('active');
            if (isAscending) {
                this.classList.add('asc');
                this.querySelector('.sort-icon').textContent = '↑';
            } else {
                this.classList.add('desc');
                this.querySelector('.sort-icon').textContent = '↓';
            }
            
            // Sort the table
            sortTable(sortField, isAscending);
        });
    });
}

// Sort table function
function sortTable(field, ascending) {
    const tbody = document.getElementById('data-table-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort the rows
    rows.sort((a, b) => {
        let valueA = a.getAttribute(`data-${field}`).toLowerCase();
        let valueB = b.getAttribute(`data-${field}`).toLowerCase();
        
        // Special handling for year field to ensure numeric sorting
        if (field === 'year') {
            valueA = parseInt(valueA) || 0;
            valueB = parseInt(valueB) || 0;
            return ascending ? valueA - valueB : valueB - valueA;
        }
        
        // Default string comparison
        if (valueA < valueB) return ascending ? -1 : 1;
        if (valueA > valueB) return ascending ? 1 : -1;
        return 0;
    });
    
    // Reorder the rows in the DOM
    rows.forEach(row => {
        tbody.appendChild(row);
    });
}

// Setup clickable rows
function setupClickableRows() {
    const rows = document.querySelectorAll('.data-row');
    
    rows.forEach(row => {
        row.addEventListener('click', function() {
            const dataId = this.getAttribute('data-id');
            showResourceDetails(dataId);
        });
    });
} 