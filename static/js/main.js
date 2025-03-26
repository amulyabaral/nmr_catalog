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
    
    // Add the hierarchy level styles
    addHierarchyStyles();
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
    
    // Enhanced handling for different types of subcategory structures
    if (Array.isArray(subcategories)) {
        subcategories.forEach(item => {
            if (typeof item === 'string') {
                // Simple string subcategory
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
                        matches = matches && r.data_type === item;
                    }
                    
                    return matches;
                }).length;
                
                // Always create leaf nodes regardless of resource count to show full hierarchy
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
                // Handle complex nested structures
                for (const [subcat, details] of Object.entries(item)) {
                    // Handle objects with title property
                    const displayName = details.title || subcat.replace(/_/g, ' ');
                    
                    // Count resources with this subcategory
                    const resourcesInSubcategory = data.filter(r => {
                        return r.resource_type === resourceType && 
                               r.category === category && 
                               r.subcategory === subcat;
                    }).length;
                    
                    // Always show subcategories from the hierarchy, even if they have no data
                    // This helps users see the complete structure
                    
                    const deepNode = document.createElement('div');
                    deepNode.className = 'hierarchy-deepnode';
                    deepNode.dataset.type = 'subcategory';
                    deepNode.dataset.value = subcat;
                    deepNode.dataset.category = category;
                    deepNode.dataset.resourceType = resourceType;
                    
                    deepNode.innerHTML = `
                        <div class="deepnode-header" data-type="subcategory" data-value="${subcat}">
                            ${displayName} <span class="count">(${resourcesInSubcategory})</span>
                        </div>
                        <div class="node-children"></div>
                    `;
                    
                    nodeChildren.appendChild(deepNode);
                    
                    // Recursively process deeper items
                    if (Array.isArray(details)) {
                        // If details is an array, process it
                        const newPath = {
                            ...currentPath,
                            subcategory: subcat
                        };
                        addSubcategories(deepNode, details, data, resourceType, category, newPath);
                    } else if (typeof details === 'object') {
                        // Handle non-array objects (might have nested items or just title)
                        // Skip the title property when processing
                        const nestedItems = Object.entries(details)
                            .filter(([key]) => key !== 'title')
                            .reduce((obj, [key, val]) => {
                                obj[key] = val;
                                return obj;
                            }, {});

                        if (Object.keys(nestedItems).length > 0) {
                            // Process nested items
                            for (const [deepKey, deepValue] of Object.entries(nestedItems)) {
                                // Handle items as arrays
                                if (Array.isArray(deepValue)) {
                                    const newPath = {
                                        ...currentPath,
                                        subcategory: subcat
                                    };
                                    addSubcategories(deepNode, deepValue, data, resourceType, category, newPath);
                                } else if (typeof deepValue === 'object') {
                                    // Creating a node for this deeper subcategory
                                    const displayDeepName = deepValue.title || deepKey.replace(/_/g, ' ');
                                    
                                    const resourcesInDeepCategory = data.filter(r => 
                                        r.resource_type === resourceType && 
                                        r.category === category && 
                                        r.subcategory === subcat &&
                                        r.data_type === deepKey
                                    ).length;
                                    
                                    const deepestNode = document.createElement('div');
                                    deepestNode.className = 'hierarchy-deepestnode';
                                    deepestNode.dataset.type = 'data_type';
                                    deepestNode.dataset.value = deepKey;
                                    deepestNode.dataset.subcategory = subcat;
                                    deepestNode.dataset.category = category;
                                    deepestNode.dataset.resourceType = resourceType;
                                    
                                    deepestNode.innerHTML = `
                                        <div class="deepestnode-header" data-type="data_type" data-value="${deepKey}">
                                            ${displayDeepName} <span class="count">(${resourcesInDeepCategory})</span>
                                        </div>
                                        <div class="node-children"></div>
                                    `;
                                    
                                    deepNode.querySelector('.node-children').appendChild(deepestNode);
                                    
                                    // Process even deeper levels
                                    // Filter out title and process the rest
                                    const evenDeeperItems = Object.entries(deepValue)
                                        .filter(([key]) => key !== 'title')
                                        .reduce((obj, [key, val]) => {
                                            obj[key] = val;
                                            return obj;
                                        }, {});
                                    
                                    if (Object.keys(evenDeeperItems).length > 0) {
                                        const deeperPath = {
                                            ...currentPath,
                                            subcategory: subcat,
                                            data_type: deepKey
                                        };
                                        
                                        // For each deeper item, recursively process
                                        for (const [deepestKey, deepestValue] of Object.entries(evenDeeperItems)) {
                                            if (Array.isArray(deepestValue)) {
                                                addSubcategories(deepestNode, deepestValue, data, resourceType, category, deeperPath);
                                            }
                                        }
                                    }
                                }
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
function initializeTree(targetId) {
    const container = document.getElementById(targetId);
    if (targetId === 'country-tree-container') {
        fetchAndBuildCountryTree(container);
    } else if (targetId === 'domain-tree-container') {
        fetchAndBuildDomainTree(container);
    } else if (targetId === 'type-tree-container') {
        fetchAndBuildTypeTree(container);
        
        // Auto-expand the first few levels after a short delay
        setTimeout(() => {
            // Expand all level 1 and 2 nodes
            container.querySelectorAll('.level-1-node, .level-2-node').forEach(node => {
                if (node.querySelector('.child-nodes')) {
                    node.classList.add('node-expanded');
                }
            });
        }, 500);
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
                    
                    // Always build the hierarchy even if no resources
                    if (hierarchy[resourceType].sub_categories) {
                        const childContainer = document.createElement('div');
                        childContainer.className = 'child-nodes';
                        
                        // Add categories from the hierarchy
                        Object.keys(hierarchy[resourceType].sub_categories).forEach(category => {
                            const catResources = resources.filter(r => r.category === category);
                            const catNode = createTreeNode(formatCategoryName(category), 'category', catResources.length);
                            
                            // Add subcategories if available - always show them regardless of resources
                            const subCategories = hierarchy[resourceType].sub_categories[category];
                            
                            // Process this category's subcategories recursively
                            processDeepHierarchy(subCategories, catNode, resourceType, category, resources);
                            
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

// Update the processDeepHierarchy function to properly show all levels of the hierarchy
function processDeepHierarchy(hierarchyNode, parentDomNode, resourceType, category, resources, path = {}) {
    if (!hierarchyNode) return;
    
    const childContainer = document.createElement('div');
    childContainer.className = 'child-nodes';
    
    // Process arrays (leaf nodes or collections of items)
    if (Array.isArray(hierarchyNode)) {
        hierarchyNode.forEach(item => {
            if (typeof item === 'string') {
                // Simple string item
                const itemNode = createTreeNode(formatCategoryName(item), 'subcategory', 0);
                childContainer.appendChild(itemNode);
                
                itemNode.querySelector('.node-content').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const type = path.subcategory ? 'data_type' : 'subcategory';
                    selectInHierarchy(type, item, path);
                });
            } else if (typeof item === 'object') {
                // Object with name and level properties
                const itemName = item.name || 'unnamed';
                const itemLevel = item.level || 0;
                
                const itemNode = createTreeNode(formatCategoryName(itemName), `level-${itemLevel}`, 0);
                childContainer.appendChild(itemNode);
                
                // Add specific data attributes for filtering
                itemNode.dataset.type = 'level-item';
                itemNode.dataset.value = itemName;
                itemNode.dataset.level = itemLevel;
                
                // Make clickable for filtering
                itemNode.querySelector('.node-content').addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectInHierarchy('level-item', itemName, {...path, level: itemLevel});
                });
            }
        });
    } 
    // Process items array directly
    else if (hierarchyNode.items && Array.isArray(hierarchyNode.items)) {
        // Process the items array
        processDeepHierarchy(hierarchyNode.items, parentDomNode, resourceType, category, resources, path);
    }
    // Process level property and sub_categories
    else if (typeof hierarchyNode === 'object') {
        // Get the level if it exists
        const nodeLevel = hierarchyNode.level || 0;
        
        // Process sub_categories if they exist
        if (hierarchyNode.sub_categories) {
            // For each subcategory
            for (const [subCatKey, subCatValue] of Object.entries(hierarchyNode.sub_categories)) {
                // Create a node with the proper level
                const subCatLevel = subCatValue.level || nodeLevel + 1;
                const subNode = createTreeNode(formatCategoryName(subCatKey), `level-${subCatLevel}`, 0);
                
                // Add specific data attributes for filtering
                subNode.dataset.type = 'category-item';
                subNode.dataset.value = subCatKey;
                subNode.dataset.level = subCatLevel;
                
                // Recursively process this subcategory
                const newPath = {...path};
                if (subCatLevel === 2) {
                    newPath.category = subCatKey;
                } else if (subCatLevel === 3) {
                    newPath.subcategory = subCatKey;
                } else if (subCatLevel === 4) {
                    newPath.data_type = subCatKey;
                }
                
                processDeepHierarchy(subCatValue, subNode, resourceType, category, resources, newPath);
                
                // Add click handler for expansion
                subNode.querySelector('.node-content').addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleNode(this.parentNode);
                });
                
                childContainer.appendChild(subNode);
            }
        }
        
        // Process items if they exist (typically at leaf nodes)
        if (hierarchyNode.items && Array.isArray(hierarchyNode.items)) {
            processDeepHierarchy(hierarchyNode.items, parentDomNode, resourceType, category, resources, path);
        }
    }
    
    // Only append if we have children
    if (childContainer.children.length > 0) {
        parentDomNode.appendChild(childContainer);
    }
}

// Update the createTreeNode function to better handle level-specific styling
function createTreeNode(name, cssClass, count = 0) {
    const node = document.createElement('div');
    node.className = `tree-node ${cssClass}-node`;
    
    // Extract level from cssClass if it's a level class
    if (cssClass.startsWith('level-')) {
        const level = parseInt(cssClass.split('-')[1]);
        node.setAttribute('data-level', level);
        
        // Add visual indentation based on level
        node.style.paddingLeft = `${level * 12}px`;
        
        // Add level-specific styling class
        node.classList.add('hierarchy-level');
        node.classList.add(`level-${level}`);
    }
    
    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-content';
    
    const nodeToggle = document.createElement('span');
    nodeToggle.className = 'node-toggle';
    nodeToggle.innerHTML = '▶';
    
    // Add level indicator before the name for clarity
    if (cssClass.startsWith('level-')) {
        const level = parseInt(cssClass.split('-')[1]);
        const levelIndicator = document.createElement('span');
        levelIndicator.className = 'level-indicator';
        levelIndicator.textContent = `L${level}: `;
        nodeContent.appendChild(levelIndicator);
    }
    
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

// Add CSS styles for the hierarchy levels
function addHierarchyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Hierarchy level styling */
        .hierarchy-level {
            border-left: 2px solid transparent;
            transition: all 0.2s ease;
            margin-bottom: 4px;
        }
        
        .level-1-node {
            font-weight: bold;
            font-size: 1.1em;
            border-left-color: #4a90e2;
            margin-top: 8px;
        }
        
        .level-2-node {
            font-weight: 600;
            border-left-color: #50e3c2;
        }
        
        .level-3-node {
            font-weight: 500;
            border-left-color: #b8e986;
        }
        
        .level-4-node {
            border-left-color: #f8e71c;
        }
        
        .level-5-node {
            border-left-color: #f5a623;
            font-style: italic;
        }
        
        .level-indicator {
            font-size: 0.8em;
            color: #666;
            margin-right: 4px;
            font-weight: normal;
            opacity: 0.8;
        }
        
        /* Improve toggle buttons */
        .node-toggle {
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-right: 5px;
            text-align: center;
            line-height: 16px;
            cursor: pointer;
            transition: transform 0.2s ease;
            color: #777;
            font-size: 10px;
        }
        
        .node-expanded > .node-content .node-toggle {
            transform: rotate(90deg);
        }
        
        /* Enhanced tree hierarchy appearance */
        .child-nodes {
            margin-left: 8px;
            border-left: 1px dotted #ccc;
            padding-left: 8px;
            display: none;
        }
        
        .node-expanded > .child-nodes {
            display: block;
        }
        
        /* Style for the category path */
        .node-path {
            font-size: 0.75em;
            color: #777;
            margin-left: 20px;
            margin-top: -2px;
        }
        
        /* Highlight selected nodes */
        .tree-node.selected > .node-content {
            background-color: rgba(74, 144, 226, 0.1);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

// Update selectInHierarchy function to better handle the hierarchy filtering
function selectInHierarchy(type, value, path) {
    // Create full filter path based on the hierarchy level
    let filterInfo = {
        type: type,
        value: value
    };
    
    // Add parent category info
    if (path.category) filterInfo.category = path.category;
    if (path.subcategory) filterInfo.subcategory = path.subcategory;
    if (path.data_type) filterInfo.data_type = path.data_type;
    if (path.level) filterInfo.level = path.level;
    
    // Add to active filters with more detailed info
    const displayValue = path.level ? `${formatFilterValue(value)} (L${path.level})` : formatFilterValue(value);
    addActiveFilter(type, value, displayValue, filterInfo);
    
    // Apply filtering with the complete path info
    const selectedFilters = getSelectedHierarchyFilters();
    filterDisplayedResults(selectedFilters);
}

// Modify addActiveFilter to include more contextual information
function addActiveFilter(filterType, filterValue, displayValue = null, filterInfo = null) {
    const activeFiltersContainer = document.getElementById('active-filter-tags');
    
    // Check if filter already exists
    if (document.querySelector(`.filter-tag[data-type="${filterType}"][data-value="${filterValue}"]`)) {
        return;
    }
    
    // Format display names
    const displayType = formatFilterType(filterType);
    const valueToShow = displayValue || formatFilterValue(filterValue);
    
    // Create filter tag
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.dataset.type = filterType;
    tag.dataset.value = filterValue;
    
    // Store additional context if provided
    if (filterInfo) {
        if (filterInfo.category) tag.dataset.category = filterInfo.category;
        if (filterInfo.subcategory) tag.dataset.subcategory = filterInfo.subcategory;
        if (filterInfo.data_type) tag.dataset.dataType = filterInfo.data_type;
        if (filterInfo.level) tag.dataset.level = filterInfo.level;
    }
    
    tag.innerHTML = `
        <span class="filter-type">${displayType}:</span>
        <span class="filter-value">${valueToShow}</span>
        <span class="remove-filter" data-type="${filterType}" data-value="${filterValue}">&times;</span>
    `;
    
    activeFiltersContainer.appendChild(tag);
    
    // Show active filters container
    document.querySelector('.active-filters').style.display = 'flex';
    
    // Add remove handler
    tag.querySelector('.remove-filter').addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        const value = this.getAttribute('data-value');
        
        // Deselect corresponding hierarchy item
        deselectHierarchyItem(type, value, filterInfo);
        
        // Remove this filter tag
        tag.remove();
        
        // Hide container if empty
        if (activeFiltersContainer.children.length === 0) {
            document.querySelector('.active-filters').style.display = 'none';
        }
        
        // Apply filtering
        const selectedFilters = getSelectedHierarchyFilters();
        filterDisplayedResults(selectedFilters);
    });
}

// Helper function to deselect items in the hierarchy
function deselectHierarchyItem(type, value, filterInfo) {
    // Build selector based on available info
    let selector = `.tree-node[data-type="${type}"][data-value="${value}"]`;
    
    // Add level to selector if available
    if (filterInfo && filterInfo.level) {
        selector += `[data-level="${filterInfo.level}"]`;
    }
    
    // Add parent category constraints if available
    if (filterInfo && filterInfo.category) {
        // We need more complex logic to find nodes within a specific category
        document.querySelectorAll(selector).forEach(node => {
            let parent = node.parentNode;
            while (parent && !parent.matches(`.tree-node[data-value="${filterInfo.category}"]`)) {
                parent = parent.parentNode;
            }
            
            if (parent) {
                node.classList.remove('selected');
            }
        });
    } else {
        // Simple case - just deselect all matching nodes
        document.querySelectorAll(selector).forEach(node => {
            node.classList.remove('selected');
        });
    }
}