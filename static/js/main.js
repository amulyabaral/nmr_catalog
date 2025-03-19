document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up functionality');
    
    // Log all category checkboxes to verify they exist
    const checkboxes = document.querySelectorAll('.category-checkbox');
    console.log('Found checkboxes:', checkboxes.length);
    
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
    console.log('Setting up checkboxes:', checkboxes.length);
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('Checkbox changed:', this.value, 'Checked:', this.checked);
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
    const categoryMappings = {
        'country': 'countries',
        'domain': 'domains',
        'resource-type': 'resource-types'
    };
    
    const mappedCategory = categoryMappings[category] || category;
    const containerSelector = `#selected-${mappedCategory} .selected-tags`;
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }
    
    // Check if already selected
    if (document.querySelector(`${containerSelector} .selected-tag[data-value="${value}"]`)) {
        return;
    }
    
    console.log(`Adding to ${mappedCategory}:`, value);
    
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
    
    updateCategoryCount(mappedCategory);
}

function removeSelectedCategory(category, value) {
    const categoryMappings = {
        'country': 'countries',
        'domain': 'domains',
        'resource-type': 'resource-types'
    };
    
    const mappedCategory = categoryMappings[category] || category;
    const tag = document.querySelector(`#selected-${mappedCategory} .selected-tag[data-value="${value}"]`);
    
    if (tag) {
        tag.remove();
        updateCategoryCount(mappedCategory);
    }
}

function updateCategoryCount(category) {
    const count = document.querySelectorAll(`#selected-${category} .selected-tag`).length;
    const countElement = document.querySelector(`#selected-${category} .count`);
    
    if (countElement) {
        countElement.textContent = `(${count})`;
    }
    
    console.log(`Updated ${category} count:`, count);
}

function updateExploreButtonState() {
    const exploreButton = document.getElementById('explore-button');
    if (!exploreButton) return; // Add safety check
    
    const hasSelection = ['countries', 'domains', 'resource-types'].some(category => {
        const container = document.querySelector(`#selected-${category} .selected-tags`);
        return container && container.children.length > 0;
    });
    
    exploreButton.disabled = !hasSelection;
    
    // For debugging
    console.log('Selection state:', {
        countries: document.querySelectorAll('#selected-countries .selected-tag').length,
        domains: document.querySelectorAll('#selected-domains .selected-tag').length,
        resourceTypes: document.querySelectorAll('#selected-resource-types .selected-tag').length,
        buttonDisabled: exploreButton.disabled
    });
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
    const tags = document.querySelectorAll(`#selected-${category} .selected-tag`);
    return Array.from(tags).map(tag => tag.getAttribute('data-value'));
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

function filterAndDisplayResults(selectedCategories) {
    // Fetch data from the server
    fetch('/api/filter-resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedCategories)
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data);
        updateResultsCount(data);
        displayActiveFilters(selectedCategories);
    })
    .catch(error => console.error('Error:', error));
}

function displayResults(data) {
    const stratifiedResults = document.getElementById('stratified-results');
    stratifiedResults.innerHTML = '';

    if (data.length === 0) {
        stratifiedResults.innerHTML = '<p class="no-results">No resources found matching your criteria.</p>';
        return;
    }

    // Update results count
    document.getElementById('results-count').textContent = data.length;

    // Group data by resource type
    const groupedData = groupByResourceType(data);

    // Build resource hierarchy in sidebar
    buildResourceHierarchy(data);

    // Create sections for each resource type with improved display
    for (const [resourceType, resources] of Object.entries(groupedData)) {
        const section = document.createElement('div');
        section.className = 'resource-type-section';
        
        // Create data table for better organization
        section.innerHTML = `
            <h3>${resourceType}</h3>
            <div class="data-table-container">
                <table class="data-table-grid">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th data-sort="country" class="sortable">Country <span class="sort-icon">↓</span></th>
                            <th data-sort="domain" class="sortable">Domain <span class="sort-icon">↓</span></th>
                            <th data-sort="year" class="sortable">Year <span class="sort-icon">↓</span></th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resources.map(resource => {
                            // Parse metadata for additional info
                            let metadata = {};
                            try {
                                metadata = JSON.parse(resource.metadata);
                            } catch(e) {
                                console.error('Failed to parse metadata:', e);
                            }
                            
                            // Extract year from last_updated
                            const year = resource.last_updated ? resource.last_updated.split('-')[0] : '';
                            
                            return `
                                <tr class="data-row" data-id="${resource.data_source_id}" 
                                    data-category="${resource.category}" 
                                    data-subcategory="${resource.subcategory}">
                                    <td>
                                        <a href="${resource.repository_url}" class="resource-link" target="_blank">
                                            ${metadata.title || resource.data_source_id}
                                        </a>
                                        <div class="resource-metadata">
                                            ${resource.category ? `<span class="metadata-item">${resource.category.replace(/_/g, ' ')}</span>` : ''}
                                            ${resource.subcategory ? `<span class="metadata-item">${resource.subcategory.replace(/_/g, ' ')}</span>` : ''}
                                        </div>
                                    </td>
                                    <td>${resource.country}</td>
                                    <td>${resource.domain}</td>
                                    <td data-year="${year}">${year}</td>
                                    <td>
                                        <button class="view-details-btn" onclick="showResourceDetails('${resource.data_source_id}')">
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        stratifiedResults.appendChild(section);
    }
    
    // Setup sorting functionality
    setupTableSorting();
    
    // Setup row click for details view
    setupRowClick();
}

function showResourceDetails(resourceId) {
    fetch(`/api/resource/${resourceId}`)
        .then(response => response.json())
        .then(resource => {
            // Update modal with resource details
            document.getElementById('modal-title').textContent = resource.data_source_id;
            
            let metadataObj = {};
            try {
                metadataObj = JSON.parse(resource.metadata);
            } catch(e) {
                console.error('Failed to parse metadata:', e);
            }
            
            // Populate modal details
            const detailsContainer = document.getElementById('modal-details');
            detailsContainer.innerHTML = `
                <div class="detail-section">
                    <h3>Resource Information</h3>
                    <div class="detail-row">
                        <div class="detail-label">Name:</div>
                        <div class="detail-value">${metadataObj.title || resource.data_source_id}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Description:</div>
                        <div class="detail-value">${resource.data_description}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Repository:</div>
                        <div class="detail-value">${resource.repository}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Last Updated:</div>
                        <div class="detail-value">${resource.last_updated}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Categories</h3>
                    <div class="detail-row">
                        <div class="detail-label">Country:</div>
                        <div class="detail-value">${resource.country}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Domain:</div>
                        <div class="detail-value">${resource.domain}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Resource Type:</div>
                        <div class="detail-value">${resource.resource_type}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Category:</div>
                        <div class="detail-value">${resource.category}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Subcategory:</div>
                        <div class="detail-value">${resource.subcategory}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Additional Information</h3>
                    <div class="detail-row">
                        <div class="detail-label">Contact:</div>
                        <div class="detail-value">${resource.contact_information}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Keywords:</div>
                        <div class="detail-value">
                            <div class="tag-list">
                                ${resource.keywords.split(',').map(keyword => 
                                    `<span class="data-tag category-tag">${keyword.trim()}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Set resource link
            const resourceLink = document.getElementById('resource-link');
            resourceLink.href = resource.repository_url;
            
            // Show modal
            document.getElementById('resource-modal').style.display = 'block';
        })
        .catch(error => console.error('Error fetching resource details:', error));
}

function groupByResourceType(data) {
    const groupedData = {};
    
    data.forEach(resource => {
        const resourceType = resource.resource_type || 'Other';
        
        if (!groupedData[resourceType]) {
            groupedData[resourceType] = [];
        }
        
        groupedData[resourceType].push(resource);
    });
    
    return groupedData;
}

function buildResourceHierarchy(data) {
    // Fetch hierarchy data from server
    fetch('/api/resource-hierarchy')
        .then(response => response.json())
        .then(hierarchy => {
            const hierarchyTree = document.getElementById('hierarchy-tree');
            hierarchyTree.innerHTML = '';
            
            // Create top-level nodes for resource types
            for (const [resourceType, details] of Object.entries(hierarchy)) {
                // Count resources in this type
                const resourcesInType = data.filter(r => r.resource_type === resourceType).length;
                
                if (resourcesInType === 0) continue; // Skip if no resources of this type
                
                const node = document.createElement('div');
                node.className = 'hierarchy-node';
                node.innerHTML = `
                    <div class="node-header" data-type="resource_type" data-value="${resourceType}">
                        ${resourceType} (${resourcesInType})
                    </div>
                    <div class="node-children"></div>
                `;
                
                hierarchyTree.appendChild(node);
                
                // Add subcategories if they exist
                if (details.sub_categories) {
                    const nodeChildren = node.querySelector('.node-children');
                    
                    for (const [category, subcategories] of Object.entries(details.sub_categories)) {
                        // Count resources in this category
                        const resourcesInCategory = data.filter(r => 
                            r.resource_type === resourceType && r.category === category).length;
                        
                        if (resourcesInCategory === 0) continue; // Skip if no resources of this category
                        
                        const subnode = document.createElement('div');
                        subnode.className = 'hierarchy-subnode';
                        subnode.innerHTML = `
                            <div class="subnode-header" data-type="category" data-value="${category}">
                                ${category.replace(/_/g, ' ')} (${resourcesInCategory})
                            </div>
                            <div class="node-children"></div>
                        `;
                        
                        nodeChildren.appendChild(subnode);
                        
                        // Add subcategories of categories
                        addSubcategories(subnode, subcategories, data, resourceType, category);
                    }
                }
            }
            
            // Add click handlers for hierarchy filtering
            setupHierarchyFiltering(hierarchyTree);
        })
        .catch(error => console.error('Error building resource hierarchy:', error));
}

function addSubcategories(parentNode, subcategories, data, resourceType, category) {
    const nodeChildren = parentNode.querySelector('.node-children');
    
    if (Array.isArray(subcategories)) {
        subcategories.forEach(item => {
            if (typeof item === 'string') {
                // Count resources with this subcategory
                const resourcesInSubcategory = data.filter(r => 
                    r.resource_type === resourceType && 
                    r.category === category && 
                    r.subcategory === item).length;
                
                if (resourcesInSubcategory === 0) return; // Skip if no resources
                
                const leaf = document.createElement('div');
                leaf.className = 'hierarchy-leafnode';
                leaf.innerHTML = `
                    <div class="leafnode-header" data-type="subcategory" data-value="${item}">
                        ${item.replace(/_/g, ' ')} (${resourcesInSubcategory})
                    </div>
                `;
                
                nodeChildren.appendChild(leaf);
            } else if (typeof item === 'object') {
                // Handle nested subcategories
                for (const [subcat, deepItems] of Object.entries(item)) {
                    // Count resources with this subcategory
                    const resourcesInSubcategory = data.filter(r => 
                        r.resource_type === resourceType && 
                        r.category === category && 
                        r.subcategory === subcat).length;
                    
                    if (resourcesInSubcategory === 0) continue; // Skip if no resources
                    
                    const deepNode = document.createElement('div');
                    deepNode.className = 'hierarchy-deepnode';
                    deepNode.innerHTML = `
                        <div class="deepnode-header" data-type="subcategory" data-value="${subcat}">
                            ${subcat.replace(/_/g, ' ')} (${resourcesInSubcategory})
                        </div>
                        <div class="node-children"></div>
                    `;
                    
                    nodeChildren.appendChild(deepNode);
                    
                    // Add even deeper items if needed
                    if (Array.isArray(deepItems)) {
                        const deepChildren = deepNode.querySelector('.node-children');
                        deepItems.forEach(deepItem => {
                            if (typeof deepItem === 'string') {
                                const leaf = document.createElement('div');
                                leaf.className = 'hierarchy-leafnode';
                                leaf.innerHTML = `
                                    <div class="leafnode-header" data-type="deep_subcategory" data-value="${deepItem}">
                                        ${deepItem.replace(/_/g, ' ')}
                                    </div>
                                `;
                                
                                deepChildren.appendChild(leaf);
                            }
                        });
                    }
                }
            }
        });
    }
}

function setupHierarchyFiltering(hierarchyTree) {
    const headerElements = hierarchyTree.querySelectorAll('.node-header, .subnode-header, .deepnode-header, .leafnode-header');
    
    headerElements.forEach(header => {
        header.addEventListener('click', function() {
            const filterType = this.getAttribute('data-type');
            const filterValue = this.getAttribute('data-value');
            
            // Toggle selection state visually
            this.closest('.hierarchy-node, .hierarchy-subnode, .hierarchy-deepnode, .hierarchy-leafnode').classList.toggle('selected');
            
            // Get all selected filters
            const selectedFilters = getSelectedHierarchyFilters();
            
            // Apply filtering
            filterDisplayedResults(selectedFilters);
        });
    });
}

function getSelectedHierarchyFilters() {
    const selectedFilters = {
        resource_type: [],
        category: [],
        subcategory: [],
        deep_subcategory: []
    };
    
    document.querySelectorAll('.hierarchy-node.selected > .node-header').forEach(header => {
        selectedFilters.resource_type.push(header.getAttribute('data-value'));
    });
    
    document.querySelectorAll('.hierarchy-subnode.selected > .subnode-header').forEach(header => {
        selectedFilters.category.push(header.getAttribute('data-value'));
    });
    
    document.querySelectorAll('.hierarchy-deepnode.selected > .deepnode-header, .hierarchy-leafnode.selected > .leafnode-header').forEach(header => {
        if (header.getAttribute('data-type') === 'subcategory') {
            selectedFilters.subcategory.push(header.getAttribute('data-value'));
        } else if (header.getAttribute('data-type') === 'deep_subcategory') {
            selectedFilters.deep_subcategory.push(header.getAttribute('data-value'));
        }
    });
    
    return selectedFilters;
}

function filterDisplayedResults(filters) {
    const resourceSections = document.querySelectorAll('.resource-type-section');
    
    resourceSections.forEach(section => {
        const resourceCards = section.querySelectorAll('.resource-card');
        let sectionVisible = false;
        
        resourceCards.forEach(card => {
            let shouldDisplay = true;
            
            // Check resource type filter
            if (filters.resource_type.length > 0) {
                const sectionTitle = section.querySelector('h3').textContent;
                if (!filters.resource_type.includes(sectionTitle)) {
                    shouldDisplay = false;
                }
            }
            
            // Check category filter
            if (shouldDisplay && filters.category.length > 0) {
                const category = card.getAttribute('data-category');
                if (!filters.category.includes(category)) {
                    shouldDisplay = false;
                }
            }
            
            // Check subcategory filter
            if (shouldDisplay && filters.subcategory.length > 0) {
                const subcategory = card.getAttribute('data-subcategory');
                if (!filters.subcategory.includes(subcategory)) {
                    shouldDisplay = false;
                }
            }
            
            // Update card visibility
            card.style.display = shouldDisplay ? 'block' : 'none';
            
            // Update section visibility state
            if (shouldDisplay) {
                sectionVisible = true;
            }
        });
        
        // Update section visibility
        section.style.display = sectionVisible ? 'block' : 'none';
    });
    
    // Update results count
    updateFilteredResultsCount();
}

function updateFilteredResultsCount() {
    const visibleCards = document.querySelectorAll('.resource-card[style="display: block"]').length;
    document.getElementById('results-count').textContent = visibleCards;
}

function setupTableSorting() {
    document.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const sortKey = this.getAttribute('data-sort');
            const currentDirection = this.getAttribute('data-direction') || 'desc';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            
            // Update sort direction
            this.setAttribute('data-direction', newDirection);
            
            // Clear other headers
            document.querySelectorAll('th.sortable').forEach(h => {
                if (h !== this) {
                    h.removeAttribute('data-direction');
                    h.classList.remove('active');
                }
            });
            
            // Update visual indicator
            this.classList.add('active');
            const sortIcon = this.querySelector('.sort-icon');
            sortIcon.textContent = newDirection === 'asc' ? '↑' : '↓';
            
            // Perform sorting on each table
            document.querySelectorAll('.data-table-grid').forEach(table => {
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                rows.sort((a, b) => {
                    let aValue, bValue;
                    
                    if (sortKey === 'year') {
                        aValue = a.querySelector(`td[data-year]`).getAttribute('data-year');
                        bValue = b.querySelector(`td[data-year]`).getAttribute('data-year');
                        
                        // Convert to numbers for year comparison
                        aValue = parseInt(aValue) || 0;
                        bValue = parseInt(bValue) || 0;
                    } else {
                        // Get cell index for this column
                        const cellIndex = Array.from(table.querySelectorAll('th')).findIndex(th => 
                            th.getAttribute('data-sort') === sortKey);
                        
                        if (cellIndex !== -1) {
                            aValue = a.cells[cellIndex].textContent.trim().toLowerCase();
                            bValue = b.cells[cellIndex].textContent.trim().toLowerCase();
                        } else {
                            return 0;
                        }
                    }
                    
                    // Compare values
                    if (aValue < bValue) return newDirection === 'asc' ? -1 : 1;
                    if (aValue > bValue) return newDirection === 'asc' ? 1 : -1;
                    return 0;
                });
                
                // Reorder rows
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    });
}

function setupRowClick() {
    document.querySelectorAll('.data-row').forEach(row => {
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on a link or button
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                return;
            }
            
            const resourceId = this.getAttribute('data-id');
            showResourceDetails(resourceId);
        });
    });
}