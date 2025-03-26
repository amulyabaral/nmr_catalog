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
    
    // Set up explorer card functionality
    document.querySelectorAll('.expand-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const container = document.getElementById(targetId);
            
            if (container.classList.contains('expanded')) {
                container.classList.remove('expanded');
                this.textContent = `Explore ${this.textContent.split(' ')[1]}`;
            } else {
                container.classList.add('expanded');
                this.textContent = 'Collapse';
                
                // Initialize tree if it's empty
                if (container.innerHTML.trim() === '') {
                    initializeTree(targetId);
                }
            }
        });
    });
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
    
    // Clear active filters
    document.getElementById('active-filter-tags').innerHTML = '';
    document.querySelector('.active-filters').style.display = 'none';
    
    // Clear hierarchy selections
    document.querySelectorAll('.hierarchy-node.selected, .hierarchy-subnode.selected, .hierarchy-deepnode.selected, .hierarchy-leafnode.selected').forEach(node => {
        node.classList.remove('selected');
    });
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
                                    data-subcategory="${resource.subcategory}"
                                    data-data-type="${resource.data_type || ''}">
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
            // Parse metadata
            let metadataObj = {};
            try {
                metadataObj = JSON.parse(resource.metadata);
            } catch(e) {
                console.error('Failed to parse metadata:', e);
            }
            
            // Update modal title with resource name from metadata if available
            document.getElementById('modal-title').textContent = metadataObj.title || resource.data_source_id;
            
            // Build a more comprehensive and well-organized display
            const detailsContainer = document.getElementById('modal-details');
            
            // Extract year from last_updated
            const year = resource.last_updated ? resource.last_updated.split('-')[0] : '';
            
            detailsContainer.innerHTML = `
                <div class="detail-grid">
                    <div class="detail-column">
                        <div class="detail-section">
                            <h3>Resource Information</h3>
                            <div class="detail-row">
                                <div class="detail-label">Data Source ID:</div>
                                <div class="detail-value">${resource.data_source_id}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Repository:</div>
                                <div class="detail-value">${resource.repository}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Year:</div>
                                <div class="detail-value">${year}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Last Updated:</div>
                                <div class="detail-value">${resource.last_updated}</div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-label">Data Format:</div>
                                <div class="detail-value">${resource.data_format || 'Not specified'}</div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Categories</h3>
                            <div class="detail-tags">
                                <div class="detail-tag country">${resource.country}</div>
                                <div class="detail-tag domain">${resource.domain}</div>
                                <div class="detail-tag resource-type">${resource.resource_type}</div>
                            </div>
                            <div class="subcategory-tags">
                                <div class="detail-tag category">${resource.category.replace(/_/g, ' ')}</div>
                                <div class="detail-tag subcategory">${resource.subcategory.replace(/_/g, ' ')}</div>
                                ${resource.data_type ? `<div class="detail-tag data-type">${resource.data_type.replace(/_/g, ' ')}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-column">
                        <div class="detail-section">
                            <h3>Description</h3>
                            <div class="detail-description">
                                ${resource.data_description}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Contact Information</h3>
                            <div class="detail-contact">
                                ${resource.contact_information}
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Keywords</h3>
                            <div class="keyword-tags">
                                ${resource.keywords.split(',').map(keyword => 
                                    `<span class="keyword-tag">${keyword.trim()}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        ${metadataObj.institution ? `
                        <div class="detail-section">
                            <h3>Additional Information</h3>
                            <div class="detail-row">
                                <div class="detail-label">Institution:</div>
                                <div class="detail-value">${metadataObj.institution}</div>
                            </div>
                            ${metadataObj.creator ? `
                            <div class="detail-row">
                                <div class="detail-label">Creator:</div>
                                <div class="detail-value">${metadataObj.creator}</div>
                            </div>` : ''}
                            ${metadataObj.license ? `
                            <div class="detail-row">
                                <div class="detail-label">License:</div>
                                <div class="detail-value">${metadataObj.license}</div>
                            </div>` : ''}
                            ${metadataObj.version ? `
                            <div class="detail-row">
                                <div class="detail-label">Version:</div>
                                <div class="detail-value">${metadataObj.version}</div>
                            </div>` : ''}
                        </div>` : ''}
                    </div>
                </div>
            `;
            
            // Set resource link
            const resourceLink = document.getElementById('resource-link');
            resourceLink.href = resource.repository_url;
            resourceLink.textContent = 'Go to Resource Repository';
            
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
                node.dataset.type = 'resource_type';
                node.dataset.value = resourceType;
                node.innerHTML = `
                    <div class="node-header" data-type="resource_type" data-value="${resourceType}">
                        ${resourceType} <span class="count">(${resourcesInType})</span>
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
                        subnode.dataset.type = 'category';
                        subnode.dataset.value = category;
                        subnode.innerHTML = `
                            <div class="subnode-header" data-type="category" data-value="${category}">
                                ${category.replace(/_/g, ' ')} <span class="count">(${resourcesInCategory})</span>
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
            
            // Expand all nodes by default to show full hierarchy
            document.querySelectorAll('.node-children').forEach(node => {
                node.style.display = 'block';
            });
        })
        .catch(error => console.error('Error building resource hierarchy:', error));
}

function addSubcategories(parentNode, subcategories, data, resourceType, category, currentPath = {}) {
    const nodeChildren = parentNode.querySelector('.node-children');
    
    // Enhanced handling of subcategories to better process nested structures
    if (Array.isArray(subcategories)) {
        subcategories.forEach(item => {
            // Check if item is a string (simple subcategory) or object (complex nested structure)
            if (typeof item === 'string') {
                // Count resources with this subcategory
                const resourcesInSubcategory = data.filter(r => {
                    let matches = r.resource_type === resourceType && 
                                r.category === category;
                    
                    // Add subcategory matching if the current path has one
                    if (currentPath.subcategory) {
                        matches = matches && r.subcategory === currentPath.subcategory;
                    } else {
                        matches = matches && r.subcategory === item;
                    }
                    
                    // Add data_type matching if needed
                    if (currentPath.data_type) {
                        matches = matches && r.data_type === currentPath.data_type;
                    }
                    
                    return matches;
                }).length;
                
                if (resourcesInSubcategory === 0) return; // Skip if no resources
                
                const leaf = document.createElement('div');
                leaf.className = 'hierarchy-leafnode';
                
                // Set correct data attributes based on where we are in the hierarchy
                if (currentPath.subcategory) {
                    leaf.dataset.type = 'data_type';
                    leaf.dataset.value = item;
                    leaf.dataset.subcategory = currentPath.subcategory;
                    leaf.dataset.category = category;
                    leaf.dataset.resourceType = resourceType;
                } else {
                    leaf.dataset.type = 'subcategory';
                    leaf.dataset.value = item;
                    leaf.dataset.category = category;
                    leaf.dataset.resourceType = resourceType;
                }
                
                leaf.innerHTML = `
                    <div class="leafnode-header" data-type="${leaf.dataset.type}" data-value="${item}">
                        ${item.replace(/_/g, ' ')} <span class="count">(${resourcesInSubcategory})</span>
                    </div>
                `;
                
                nodeChildren.appendChild(leaf);
            } else if (typeof item === 'object') {
                // Handle complex nested structures (like genomic->whole_genome_sequencing->clinical_isolates)
                for (const [subcat, deepItems] of Object.entries(item)) {
                    // Count resources with this subcategory
                    const resourcesInSubcategory = data.filter(r => {
                        let matches = r.resource_type === resourceType && 
                                    r.category === category && 
                                    r.subcategory === subcat;
                        
                        // Add data_type matching if the current path has one
                        if (currentPath.data_type) {
                            matches = matches && r.data_type === currentPath.data_type;
                        }
                        
                        return matches;
                    }).length;
                    
                    if (resourcesInSubcategory === 0) continue; // Skip if no resources
                    
                    const deepNode = document.createElement('div');
                    deepNode.className = 'hierarchy-deepnode';
                    deepNode.dataset.type = 'subcategory';
                    deepNode.dataset.value = subcat;
                    deepNode.dataset.category = category;
                    deepNode.dataset.resourceType = resourceType;
                    
                    deepNode.innerHTML = `
                        <div class="deepnode-header" data-type="subcategory" data-value="${subcat}">
                            ${subcat.replace(/_/g, ' ')} <span class="count">(${resourcesInSubcategory})</span>
                        </div>
                        <div class="node-children"></div>
                    `;
                    
                    nodeChildren.appendChild(deepNode);
                    
                    // Recursively add deeper items (like clinical_isolates, bacterial_genomes)
                    if (Array.isArray(deepItems)) {
                        // Just pass the array directly
                        const newPath = {
                            ...currentPath,
                            subcategory: subcat
                        };
                        addSubcategories(deepNode, deepItems, data, resourceType, category, newPath);
                    } else if (typeof deepItems === 'object') {
                        // For even deeper nesting like in genomic data
                        for (const [deepSubcat, deepestItems] of Object.entries(deepItems)) {
                            // Create a node for this deep subcategory
                            const deepestNode = document.createElement('div');
                            deepestNode.className = 'hierarchy-deepestnode';
                            deepestNode.dataset.type = 'deep_subcategory';
                            deepestNode.dataset.value = deepSubcat;
                            deepestNode.dataset.subcategory = subcat;
                            deepestNode.dataset.category = category;
                            deepestNode.dataset.resourceType = resourceType;
                            
                            // Count resources with this deep subcategory
                            const resourcesInDeepestSubcategory = data.filter(r => 
                                r.resource_type === resourceType && 
                                r.category === category && 
                                r.subcategory === subcat &&
                                r.data_type === deepSubcat
                            ).length;
                            
                            if (resourcesInDeepestSubcategory === 0) continue; // Skip if no resources
                            
                            deepestNode.innerHTML = `
                                <div class="deepestnode-header" data-type="deep_subcategory" data-value="${deepSubcat}">
                                    ${deepSubcat.replace(/_/g, ' ')} <span class="count">(${resourcesInDeepestSubcategory})</span>
                                </div>
                                <div class="node-children"></div>
                            `;
                            
                            deepNode.querySelector('.node-children').appendChild(deepestNode);
                            
                            // Add even deeper levels if they exist
                            if (Array.isArray(deepestItems) && deepestItems.length > 0) {
                                const deepestPath = {
                                    ...newPath,
                                    data_type: deepSubcat
                                };
                                addSubcategories(deepestNode, deepestItems, data, resourceType, category, deepestPath);
                            }
                        }
                    }
                }
            }
        });
    }
}

function setupHierarchyFiltering(hierarchyTree) {
    // Get all clickable elements in the hierarchy
    const headerElements = hierarchyTree.querySelectorAll('.node-header, .subnode-header, .deepnode-header, .leafnode-header');
    
    headerElements.forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            
            const filterType = this.getAttribute('data-type');
            const filterValue = this.getAttribute('data-value');
            const parentElement = this.parentElement;
            
            // Toggle selection state
            const isSelected = parentElement.classList.contains('selected');
            
            // Clear selected class from all elements at the same level in the hierarchy
            if (filterType === 'resource_type') {
                hierarchyTree.querySelectorAll('.hierarchy-node').forEach(node => {
                    node.classList.remove('selected');
                });
            } else if (filterType === 'category') {
                const resourceTypeNode = parentElement.closest('.hierarchy-node');
                resourceTypeNode.querySelectorAll('.hierarchy-subnode').forEach(node => {
                    node.classList.remove('selected');
                });
            } else if (filterType === 'subcategory') {
                const categoryNode = parentElement.closest('.hierarchy-subnode');
                categoryNode.querySelectorAll('.hierarchy-deepnode, .hierarchy-leafnode').forEach(node => {
                    if (node.dataset.type === 'subcategory') {
                        node.classList.remove('selected');
                    }
                });
            } else if (filterType === 'data_type' || filterType === 'deep_subcategory') {
                const subcategoryNode = parentElement.closest('.hierarchy-deepnode');
                if (subcategoryNode) {
                    subcategoryNode.querySelectorAll('.hierarchy-leafnode').forEach(node => {
                        if (node.dataset.type === filterType) {
                            node.classList.remove('selected');
                        }
                    });
                }
            }
            
            // Toggle selection on the clicked element
            if (!isSelected) {
                parentElement.classList.add('selected');
                
                // Add to active filters
                addActiveFilter(filterType, filterValue);
            } else {
                // Remove from active filters
                removeActiveFilter(filterType, filterValue);
            }
            
            // Apply filtering
            const selectedFilters = getSelectedHierarchyFilters();
            filterDisplayedResults(selectedFilters);
        });
    });
}

function addActiveFilter(filterType, filterValue) {
    const activeFiltersContainer = document.getElementById('active-filter-tags');
    
    // Check if filter already exists
    if (document.querySelector(`.filter-tag[data-type="${filterType}"][data-value="${filterValue}"]`)) {
        return;
    }
    
    // Format display names
    const displayType = formatFilterType(filterType);
    
    // Create filter tag
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.dataset.type = filterType;
    tag.dataset.value = filterValue;
    tag.innerHTML = `
        <span class="filter-type">${displayType}:</span>
        <span class="filter-value">${formatFilterValue(filterValue)}</span>
        <span class="remove-filter" data-type="${filterType}" data-value="${filterValue}">&times;</span>
    `;
    
    activeFiltersContainer.appendChild(tag);
    
    // Show active filters container
    document.querySelector('.active-filters').style.display = 'flex';
    
    // Add remove handler
    tag.querySelector('.remove-filter').addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        const value = this.getAttribute('data-value');
        
        // Deselect the corresponding item in hierarchy
        const selector = `.hierarchy-node[data-type="${type}"][data-value="${value}"], 
                           .hierarchy-subnode[data-type="${type}"][data-value="${value}"],
                           .hierarchy-deepnode[data-type="${type}"][data-value="${value}"],
                           .hierarchy-leafnode[data-type="${type}"][data-value="${value}"]`;
        const hierarchyItem = document.querySelector(selector);
        if (hierarchyItem) {
            hierarchyItem.classList.remove('selected');
        }
        
        removeActiveFilter(type, value);
        
        // Apply filtering
        const selectedFilters = getSelectedHierarchyFilters();
        filterDisplayedResults(selectedFilters);
    });
}

function removeActiveFilter(filterType, filterValue) {
    const tag = document.querySelector(`.filter-tag[data-type="${filterType}"][data-value="${filterValue}"]`);
    if (tag) {
        tag.remove();
    }
    
    // Hide active filters container if empty
    const activeFiltersContainer = document.getElementById('active-filter-tags');
    if (activeFiltersContainer.children.length === 0) {
        document.querySelector('.active-filters').style.display = 'none';
    }
}

function formatFilterType(type) {
    const typeMap = {
        'resource_type': 'Resource Type',
        'category': 'Category',
        'subcategory': 'Subcategory',
        'data_type': 'Data Type',
        'deep_subcategory': 'Data Type'
    };
    
    return typeMap[type] || type;
}

function formatFilterValue(value) {
    // Replace underscores with spaces and capitalize words
    return value.replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function getSelectedHierarchyFilters() {
    const selectedFilters = {
        resource_type: [],
        category: [],
        subcategory: [],
        data_type: []
    };
    
    document.querySelectorAll('.hierarchy-node.selected').forEach(node => {
        selectedFilters.resource_type.push(node.dataset.value);
    });
    
    document.querySelectorAll('.hierarchy-subnode.selected').forEach(node => {
        selectedFilters.category.push(node.dataset.value);
    });
    
    document.querySelectorAll('.hierarchy-deepnode.selected, .hierarchy-leafnode.selected').forEach(node => {
        if (node.dataset.type === 'subcategory') {
            selectedFilters.subcategory.push(node.dataset.value);
        } else if (node.dataset.type === 'data_type') {
            selectedFilters.data_type.push({
                value: node.dataset.value,
                subcategory: node.dataset.subcategory
            });
        }
    });
    
    return selectedFilters;
}

function filterDisplayedResults(filters) {
    // Get all data rows
    const dataRows = document.querySelectorAll('.data-row');
    let visibleRowCount = 0;
    
    dataRows.forEach(row => {
        const resourceType = row.closest('.resource-type-section').querySelector('h3').textContent;
        const category = row.dataset.category || '';
        const subcategory = row.dataset.subcategory || '';
        const dataType = row.dataset.dataType || '';
        
        let shouldDisplay = true;
        
        // Apply resource type filter
        if (filters.resource_type.length > 0 && !filters.resource_type.includes(resourceType)) {
            shouldDisplay = false;
        }
        
        // Apply category filter
        if (shouldDisplay && filters.category.length > 0 && !filters.category.includes(category)) {
            shouldDisplay = false;
        }
        
        // Apply subcategory filter
        if (shouldDisplay && filters.subcategory.length > 0 && !filters.subcategory.includes(subcategory)) {
            shouldDisplay = false;
        }
        
        // Apply data type filter (needs to match both value and parent subcategory)
        if (shouldDisplay && filters.data_type.length > 0) {
            const matchesDataType = filters.data_type.some(filter => 
                filter.value === dataType && filter.subcategory === subcategory
            );
            
            if (!matchesDataType) {
                shouldDisplay = false;
            }
        }
        
        // Update row visibility
        row.style.display = shouldDisplay ? '' : 'none';
        
        if (shouldDisplay) {
            visibleRowCount++;
        }
    });
    
    // Update section visibility
    document.querySelectorAll('.resource-type-section').forEach(section => {
        const visibleRows = section.querySelectorAll('.data-row:not([style*="display: none"])').length;
        section.style.display = visibleRows > 0 ? '' : 'none';
    });
    
    // Update count display
    document.getElementById('results-count').textContent = visibleRowCount;
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

// Add display active filters function
function displayActiveFilters(selectedCategories) {
    const activeFiltersContainer = document.getElementById('active-filter-tags');
    activeFiltersContainer.innerHTML = '';
    
    let hasFilters = false;
    
    // Add filters for countries
    if (selectedCategories.countries && selectedCategories.countries.length > 0) {
        selectedCategories.countries.forEach(country => {
            addActiveFilter('country', country);
        });
        hasFilters = true;
    }
    
    // Add filters for domains
    if (selectedCategories.domains && selectedCategories.domains.length > 0) {
        selectedCategories.domains.forEach(domain => {
            addActiveFilter('domain', domain);
        });
        hasFilters = true;
    }
    
    // Add filters for resource types
    if (selectedCategories.resourceTypes && selectedCategories.resourceTypes.length > 0) {
        selectedCategories.resourceTypes.forEach(type => {
            addActiveFilter('resource_type', type);
        });
        hasFilters = true;
    }
    
    // Show/hide container
    document.querySelector('.active-filters').style.display = hasFilters ? 'flex' : 'none';
}

// Function to initialize the tree based on container ID
function initializeTree(containerId) {
    const container = document.getElementById(containerId);
    
    switch(containerId) {
        case 'country-tree-container':
            fetchAndBuildCountryTree(container);
            break;
        case 'domain-tree-container':
            fetchAndBuildDomainTree(container);
            break;
        case 'type-tree-container':
            fetchAndBuildTypeTree(container);
            break;
    }
}

// Fetch country data and build tree
function fetchAndBuildCountryTree(container) {
    // First get the main categories
    fetch('/api/main-categories')
        .then(response => response.json())
        .then(data => {
            const countries = data.Country;
            
            // Create a resource tree element
            const treeElement = document.createElement('div');
            treeElement.className = 'resource-tree';
            
            // Add each country as a top-level node
            countries.forEach(country => {
                const countryNode = createTreeNode(country, 'country');
                
                // Fetch resources for this country and add sub-categories
                fetch('/api/filter-resources', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ countries: [country] })
                })
                .then(response => response.json())
                .then(resources => {
                    // Create domain sub-nodes
                    const domains = [...new Set(resources.map(r => r.domain))];
                    
                    // Update the count badge
                    countryNode.querySelector('.node-count').textContent = resources.length;
                    
                    // If there are resources, make the node expandable
                    if (resources.length > 0) {
                        const childContainer = document.createElement('div');
                        childContainer.className = 'child-nodes';
                        
                        domains.forEach(domain => {
                            const domainResources = resources.filter(r => r.domain === domain);
                            const domainNode = createTreeNode(domain, 'domain', domainResources.length);
                            
                            // Add resource type level
                            const resourceTypes = [...new Set(domainResources.map(r => r.resource_type))];
                            const typeContainer = document.createElement('div');
                            typeContainer.className = 'child-nodes';
                            
                            resourceTypes.forEach(type => {
                                const typeResources = domainResources.filter(r => r.resource_type === type);
                                const typeNode = createTreeNode(type, 'resource-type', typeResources.length);
                                
                                // Make the type node link to filtered results
                                typeNode.querySelector('.node-content').addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    filterAndShowResults([country], [domain], [type]);
                                });
                                
                                typeContainer.appendChild(typeNode);
                            });
                            
                            domainNode.appendChild(typeContainer);
                            domainNode.querySelector('.node-content').addEventListener('click', function(e) {
                                e.stopPropagation();
                                toggleNode(this.parentNode);
                            });
                            
                            childContainer.appendChild(domainNode);
                        });
                        
                        countryNode.appendChild(childContainer);
                        countryNode.querySelector('.node-content').addEventListener('click', function() {
                            toggleNode(this.parentNode);
                        });
                    }
                });
                
                treeElement.appendChild(countryNode);
            });
            
            container.appendChild(treeElement);
        });
}

// Fetch domain data and build tree
function fetchAndBuildDomainTree(container) {
    fetch('/api/main-categories')
        .then(response => response.json())
        .then(data => {
            const domains = data.Domain;
            
            const treeElement = document.createElement('div');
            treeElement.className = 'resource-tree';
            
            domains.forEach(domain => {
                const domainNode = createTreeNode(domain, 'domain');
                
                fetch('/api/filter-resources', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ domains: [domain] })
                })
                .then(response => response.json())
                .then(resources => {
                    // Update count
                    domainNode.querySelector('.node-count').textContent = resources.length;
                    
                    if (resources.length > 0) {
                        const childContainer = document.createElement('div');
                        childContainer.className = 'child-nodes';
                        
                        // Group by resource type
                        const resourceTypes = [...new Set(resources.map(r => r.resource_type))];
                        
                        resourceTypes.forEach(type => {
                            const typeResources = resources.filter(r => r.resource_type === type);
                            const typeNode = createTreeNode(type, 'resource-type', typeResources.length);
                            
                            // Add categories
                            const categories = [...new Set(typeResources.map(r => r.category))];
                            const categoryContainer = document.createElement('div');
                            categoryContainer.className = 'child-nodes';
                            
                            categories.forEach(category => {
                                const catResources = typeResources.filter(r => r.category === category);
                                const catNode = createTreeNode(category, 'category', catResources.length);
                                
                                catNode.querySelector('.node-content').addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    filterAndShowResults(null, [domain], [type], category);
                                });
                                
                                categoryContainer.appendChild(catNode);
                            });
                            
                            typeNode.appendChild(categoryContainer);
                            typeNode.querySelector('.node-content').addEventListener('click', function(e) {
                                e.stopPropagation();
                                toggleNode(this.parentNode);
                            });
                            
                            childContainer.appendChild(typeNode);
                        });
                        
                        domainNode.appendChild(childContainer);
                        domainNode.querySelector('.node-content').addEventListener('click', function() {
                            toggleNode(this.parentNode);
                        });
                    }
                });
                
                treeElement.appendChild(domainNode);
            });
            
            container.appendChild(treeElement);
        });
}

// Build the resource type tree using the hierarchy data
function fetchAndBuildTypeTree(container) {
    fetch('/api/resource-hierarchy')
        .then(response => response.json())
        .then(hierarchy => {
            const treeElement = document.createElement('div');
            treeElement.className = 'resource-tree';
            
            // For each top level resource type
            Object.keys(hierarchy).forEach(resourceType => {
                const typeNode = createTreeNode(resourceType, 'resource-type');
                
                // Fetch resources for this type
                fetch('/api/filter-resources', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ resourceTypes: [resourceType] })
                })
                .then(response => response.json())
                .then(resources => {
                    // Update count
                    typeNode.querySelector('.node-count').textContent = resources.length;
                    
                    if (resources.length > 0 && hierarchy[resourceType].sub_categories) {
                        const childContainer = document.createElement('div');
                        childContainer.className = 'child-nodes';
                        
                        // Add categories from the hierarchy
                        Object.keys(hierarchy[resourceType].sub_categories).forEach(category => {
                            const catResources = resources.filter(r => r.category === category);
                            const catNode = createTreeNode(formatCategoryName(category), 'category', catResources.length);
                            
                            // Add subcategories if available
                            const subCategories = hierarchy[resourceType].sub_categories[category];
                            if (subCategories && Array.isArray(subCategories) && subCategories.length > 0) {
                                const subContainer = document.createElement('div');
                                subContainer.className = 'child-nodes';
                                
                                // Process subcategories (might be strings or objects)
                                subCategories.forEach(subCat => {
                                    if (typeof subCat === 'string') {
                                        // Simple string subcategory
                                        const subResources = catResources.filter(r => r.subcategory === subCat);
                                        const subNode = createTreeNode(formatCategoryName(subCat), 'subcategory', subResources.length);
                                        
                                        subNode.querySelector('.node-content').addEventListener('click', function(e) {
                                            e.stopPropagation();
                                            filterAndShowResults(null, null, [resourceType], category, subCat);
                                        });
                                        
                                        subContainer.appendChild(subNode);
                                    } else {
                                        // Object with nested subcategories
                                        Object.keys(subCat).forEach(nestedSubCat => {
                                            const nestedResources = catResources.filter(r => r.subcategory === nestedSubCat);
                                            const nestedNode = createTreeNode(formatCategoryName(nestedSubCat), 'subcategory', nestedResources.length);
                                            
                                            nestedNode.querySelector('.node-content').addEventListener('click', function(e) {
                                                e.stopPropagation();
                                                filterAndShowResults(null, null, [resourceType], category, nestedSubCat);
                                            });
                                            
                                            subContainer.appendChild(nestedNode);
                                        });
                                    }
                                });
                                
                                catNode.appendChild(subContainer);
                                catNode.querySelector('.node-content').addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    toggleNode(this.parentNode);
                                });
                            } else {
                                // If no subcategories, just make it clickable for filtering
                                catNode.querySelector('.node-content').addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    filterAndShowResults(null, null, [resourceType], category);
                                });
                            }
                                
                            childContainer.appendChild(catNode);
                        });
                        
                        typeNode.appendChild(childContainer);
                        typeNode.querySelector('.node-content').addEventListener('click', function() {
                            toggleNode(this.parentNode);
                        });
                    }
                });
                
                treeElement.appendChild(typeNode);
            });
            
            container.appendChild(treeElement);
        });
}

// Helper function to create a tree node
function createTreeNode(name, cssClass, count = 0) {
    const node = document.createElement('div');
    node.className = `tree-node ${cssClass}-node`;
    
    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-content';
    
    const nodeToggle = document.createElement('span');
    nodeToggle.className = 'node-toggle';
    
    const nodeName = document.createElement('span');
    nodeName.className = 'node-name';
    nodeName.textContent = name;
    
    const nodeCount = document.createElement('span');
    nodeCount.className = 'node-count';
    nodeCount.textContent = count;
    
    nodeContent.appendChild(nodeToggle);
    nodeContent.appendChild(nodeName);
    nodeContent.appendChild(nodeCount);
    
    node.appendChild(nodeContent);
    
    return node;
}

// Toggle node expansion
function toggleNode(node) {
    node.classList.toggle('node-expanded');
}

// Format category names for display (replace underscores with spaces)
function formatCategoryName(name) {
    return name.replace(/_/g, ' ');
}

// Apply filters and scroll to results section
function filterAndShowResults(countries, domains, resourceTypes, category = null, subcategory = null) {
    // This function will apply filters and show results
    console.log('Filtering by:', { countries, domains, resourceTypes, category, subcategory });
    
    // Update the filter checkboxes in the browse section
    if (countries) {
        countries.forEach(country => {
            document.querySelector(`input[data-category="country"][value="${country}"]`).checked = true;
        });
    }
    
    if (domains) {
        domains.forEach(domain => {
            document.querySelector(`input[data-category="domain"][value="${domain}"]`).checked = true;
        });
    }
    
    if (resourceTypes) {
        resourceTypes.forEach(type => {
            document.querySelector(`input[data-category="resource-type"][value="${type}"]`).checked = true;
        });
    }
    
    // Trigger the change event to update the display
    document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
        checkbox.dispatchEvent(new Event('change'));
    });
    
    // Scroll to the browse section
    document.getElementById('browse-section').scrollIntoView({ behavior: 'smooth' });
}