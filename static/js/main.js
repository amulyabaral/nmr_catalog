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
    setupNetworkGraph();
    
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

                if (resourcesInType === 0 && !Object.keys(details.sub_categories || {}).length) continue; // Skip if no resources AND no subcategories defined

                const nodeLevel = details.level || 1; // Get level from YAML or default to 1
                const node = createTreeNode(resourceType, `level-${nodeLevel}`, resourcesInType); // Use level for styling
                node.className = `hierarchy-node level-${nodeLevel}-node`; // Ensure correct base class and level class
                node.dataset.level = nodeLevel;
                node.dataset.type = 'resource_type';
                node.dataset.value = resourceType;

                // Add child container
                const childrenDiv = document.createElement('div');
                childrenDiv.className = 'node-children';
                node.appendChild(childrenDiv);

                hierarchyTree.appendChild(node);

                // Add subcategories if they exist
                if (details.sub_categories) {
                    const initialPath = { resource_type: resourceType }; // Start path
                    addSubcategories(node, details.sub_categories, data, initialPath, nodeLevel); // Pass level
                }
            }

            // Add click handlers for hierarchy filtering
            setupHierarchyFiltering(hierarchyTree);

            // Expand all nodes by default to show full hierarchy
            document.querySelectorAll('.hierarchy-node, .hierarchy-subnode, .hierarchy-deepnode').forEach(node => {
                 const children = node.querySelector('.node-children');
                 if (children && children.children.length > 0) {
                     children.style.display = 'block';
                     // Optionally add an expanded class if needed for styling toggles etc.
                     // node.classList.add('node-expanded');
                 }
            });
             // Ensure toggle icons reflect expanded state if used (though expansion is default)
             document.querySelectorAll('.node-toggle').forEach(toggle => {
                 const parentNode = toggle.closest('.hierarchy-node, .hierarchy-subnode, .hierarchy-deepnode');
                 const children = parentNode?.querySelector('.node-children');
                 if (children && children.style.display === 'block') {
                     // Update toggle icon style if necessary, e.g., rotate
                     // toggle.style.transform = 'rotate(90deg)';
                 }
             });
        })
        .catch(error => console.error('Error building resource hierarchy:', error));
}

function addSubcategories(parentNode, hierarchyNodeData, data, currentPath, parentLevel) {
    const nodeChildren = parentNode.querySelector('.node-children');
    if (!nodeChildren) return; // Safety check

    const processNode = (key, details, currentLevel) => {
        if (currentLevel > 5) return; // Stop recursion at level 5

        const nodeLevel = details.level || currentLevel; // Use YAML level or inferred level
        if (nodeLevel > 5) return; // Stop if YAML level exceeds 5

        const displayName = details.title || key.replace(/_/g, ' ');
        const hasChildren = details.sub_categories || (details.items && details.items.length > 0);
        const nodeClass = hasChildren ? 'hierarchy-deepnode' : 'hierarchy-leafnode'; // Use deepnode if it has children, otherwise leafnode

        // Determine data-type based on level
        let nodeDataType;
        if (nodeLevel === 2) nodeDataType = 'category';
        else if (nodeLevel === 3) nodeDataType = 'subcategory';
        else if (nodeLevel === 4) nodeDataType = 'data_type'; // Assuming level 4 maps to data_type
        else nodeDataType = `level_${nodeLevel}_item`; // Generic for level 5 or others if structure changes

        // --- Resource Counting Logic (Simplified - needs refinement based on DB structure) ---
        let resourcesCount = 0;
        const countPath = { ...currentPath, [nodeDataType]: key };
         resourcesCount = data.filter(r => {
             let match = true;
             // Check if resource matches the full path constructed so far
             for(const pathKey in countPath) {
                 const resourceKey = pathKey === 'resource_type' ? 'resource_type' : // Map path keys to DB fields
                                   pathKey === 'category' ? 'category' :
                                   pathKey === 'subcategory' ? 'subcategory' :
                                   pathKey === 'data_type' ? 'data_type' : null; // How to match level 5?

                 if (resourceKey && r[resourceKey] !== countPath[pathKey]) {
                     match = false;
                     break;
                 }
                 // If resourceKey is null (e.g. for level 5), we can't directly filter yet
                 // unless there's a corresponding DB field.
             }
             return match;
         }).length;
        // --- End Resource Counting Logic ---


        // Create the node element
        const node = document.createElement('div');
        node.className = `${nodeClass} level-${nodeLevel}-node`; // Add level class for styling
        node.dataset.level = nodeLevel;
        node.dataset.type = nodeDataType;
        node.dataset.value = key;

        // Add parent path data attributes for context during filtering
        Object.keys(currentPath).forEach(pathKey => {
            // Sanitize keys for dataset attributes if necessary (e.g., replace underscores)
            const datasetKey = pathKey.replace(/_/g, ''); // Example: resource_type -> resourcetype
            node.dataset[datasetKey] = currentPath[pathKey];
        });

        // Determine header class based on whether it's a leaf or not
        const headerClass = nodeClass === 'hierarchy-leafnode' ? 'leafnode-header' : 'deepnode-header';

        node.innerHTML = `
            <div class="${headerClass}" data-type="${node.dataset.type}" data-value="${key}">
                ${displayName} <span class="count">(${resourcesCount})</span>
            </div>
            ${hasChildren ? '<div class="node-children" style="display: block;"></div>' : ''}
        `; // Add children div only if needed, default to display: block

        nodeChildren.appendChild(node);

        // Recursively process sub_categories
        if (details.sub_categories) {
            const newPath = { ...currentPath, [nodeDataType]: key };
            addSubcategories(node, details.sub_categories, data, newPath, nodeLevel);
        }

        // Process items array (leaf nodes for this category/subcategory)
        if (details.items && Array.isArray(details.items)) {
            const itemLevel = nodeLevel + 1;
            if (itemLevel <= 5) {
                const itemContainer = node.querySelector('.node-children'); // Items go inside the current node's children
                if (itemContainer) {
                     details.items.forEach(item => {
                        let itemName, itemValue;
                        if (typeof item === 'string') {
                            itemName = item;
                            itemValue = item;
                        } else if (typeof item === 'object' && item !== null && item.name) {
                            itemName = item.name;
                            itemValue = item.name; // Assuming name is the value
                        } else {
                            return; // Skip invalid items
                        }

                        const itemDataType = `level_${itemLevel}_item`; // e.g., level_5_item

                        // --- Item Resource Counting (Simplified) ---
                        let itemResourcesCount = 0;
                        // This count is difficult without knowing how level 5 items map to DB fields.
                        // For now, inheriting parent count or setting to 0.
                        // itemResourcesCount = resourcesCount; // Or 0
                        // --- End Item Counting ---

                        const leafNode = document.createElement('div');
                        leafNode.className = `hierarchy-leafnode level-${itemLevel}-node`; // Item is a leaf
                        leafNode.dataset.level = itemLevel;
                        leafNode.dataset.type = itemDataType;
                        leafNode.dataset.value = itemValue;

                        // Add parent path data attributes
                         Object.keys(currentPath).forEach(pathKey => {
                            const datasetKey = pathKey.replace(/_/g, '');
                            leafNode.dataset[datasetKey] = currentPath[pathKey];
                         });
                         // Add immediate parent's value (e.g., the data_type for a level 5 item)
                         leafNode.dataset[nodeDataType.replace(/_/g, '')] = key;


                        leafNode.innerHTML = `
                            <div class="leafnode-header" data-type="${itemDataType}" data-value="${itemValue}">
                                ${itemName.replace(/_/g, ' ')} <span class="count">(${itemResourcesCount})</span>
                            </div>
                        `;
                        itemContainer.appendChild(leafNode);
                    });
                }
            }
        }
    };

    // Iterate through the keys in the current hierarchy level data
    if (typeof hierarchyNodeData === 'object' && !Array.isArray(hierarchyNodeData) && hierarchyNodeData !== null) {
        for (const [key, details] of Object.entries(hierarchyNodeData)) {
            // Skip metadata keys like 'level' or 'title' when iterating categories
            if (key === 'level' || key === 'title') continue;

            // Assume 'details' is an object describing the node (category/subcategory)
            if (typeof details === 'object' && details !== null) {
                 processNode(key, details, parentLevel + 1);
            }
        }
    }
    // Note: This rewrite assumes hierarchyNodeData is an object containing category/subcategory keys,
    // and each key maps to an object ('details') containing 'level', 'title', 'sub_categories', 'items'.
    // It does not explicitly handle the case where hierarchyNodeData might be an array directly.
}

function createTreeNode(name, cssClass, count = 0) {
    const node = document.createElement('div');
    // Keep base class 'tree-node' for potential general styling, add specific type class
    node.className = `tree-node ${cssClass}-node`; // e.g., tree-node level-1-node

    // Extract level from cssClass if it's a level class (e.g., "level-3-node")
    const levelMatch = cssClass.match(/level-(\d+)/);
    const level = levelMatch ? parseInt(levelMatch[1]) : 1; // Default to 1 if no level class found
    node.setAttribute('data-level', level);

    // Add visual indentation based on level using padding
    node.style.paddingLeft = `${(level -1) * 15}px`; // Adjust multiplier for desired indent

    // Add level-specific styling class if needed beyond padding
    node.classList.add(`level-${level}`);


    const nodeContent = document.createElement('div');
    nodeContent.className = 'node-content'; // Keep node-content wrapper

    // Remove the level indicator span
    // const levelIndicator = document.createElement('span');
    // levelIndicator.className = 'level-indicator';
    // levelIndicator.textContent = `L${level}: `;
    // nodeContent.appendChild(levelIndicator);

    // Keep toggle span if interactive expansion/collapse is desired later, hide if not needed
    const nodeToggle = document.createElement('span');
    nodeToggle.className = 'node-toggle';
    nodeToggle.innerHTML = '▶'; // Use CSS to hide if tree is always expanded
    nodeToggle.style.visibility = 'hidden'; // Hide toggle as it's always expanded now

    const nodeName = document.createElement('span');
    nodeName.className = 'node-name';
    nodeName.textContent = name; // Name already has underscores replaced

    const nodeCount = document.createElement('span');
    nodeCount.className = 'node-count';
    nodeCount.textContent = count;

    nodeContent.appendChild(nodeToggle); // Keep in DOM for structure, but hidden
    nodeContent.appendChild(nodeName);
    nodeContent.appendChild(nodeCount);

    node.appendChild(nodeContent);

    // Child nodes div will be added by the calling function (buildResourceHierarchy/addSubcategories) if needed

    return node;
}

function setupHierarchyFiltering(hierarchyTree) {
    // Get all clickable header elements in the hierarchy
    const headerElements = hierarchyTree.querySelectorAll('.node-header, .subnode-header, .deepnode-header, .leafnode-header');

    headerElements.forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent clicks bubbling up the tree

            const filterType = this.getAttribute('data-type');
            const filterValue = this.getAttribute('data-value');
            const parentElement = this.parentElement; // The node div (e.g., hierarchy-node, hierarchy-leafnode)

            // Toggle selection state
            const isSelected = parentElement.classList.contains('selected');

            // --- Clear Selection Logic (Needs careful review based on desired behavior) ---
            // Option 1: Clear all other selections at any level
             // document.querySelectorAll('.hierarchy-node.selected, .hierarchy-subnode.selected, .hierarchy-deepnode.selected, .hierarchy-leafnode.selected').forEach(node => {
             //     if (node !== parentElement) node.classList.remove('selected');
             // });

            // Option 2: Clear only siblings at the same level (more complex to implement)
            // Example for category level:
            // if (filterType === 'category') {
            //     const siblings = parentElement.parentElement.querySelectorAll('.hierarchy-subnode');
            //     siblings.forEach(sib => {
            //         if (sib !== parentElement) sib.classList.remove('selected');
            //     });
            // }
            // --- End Clear Selection Logic ---

             // Simple toggle: Remove selection if clicking again, add if not selected
            if (isSelected) {
                 parentElement.classList.remove('selected');
                 removeActiveFilter(filterType, filterValue); // Remove from top display
            } else {
                 // Clear previous selections before adding a new one (single selection mode)
                 document.querySelectorAll('.hierarchy-node.selected, .hierarchy-subnode.selected, .hierarchy-deepnode.selected, .hierarchy-leafnode.selected').forEach(node => {
                     node.classList.remove('selected');
                     // Also remove corresponding active filter tags
                     removeActiveFilter(node.dataset.type, node.dataset.value);
                 });

                 parentElement.classList.add('selected');
                 // Add to active filters display - pass context
                 const filterContext = { ...parentElement.dataset }; // Pass all data attributes
                 addActiveFilter(filterType, filterValue, null, filterContext);
            }


            // Apply filtering based on all currently selected nodes
            const selectedFilters = getSelectedHierarchyFilters();
            filterDisplayedResults(selectedFilters);
        });
    });
}

function getSelectedHierarchyFilters() {
    const selectedFilters = []; // Store filters as objects with full path

    document.querySelectorAll('.hierarchy-node.selected, .hierarchy-subnode.selected, .hierarchy-deepnode.selected, .hierarchy-leafnode.selected').forEach(node => {
        const filter = {
            type: node.dataset.type,
            value: node.dataset.value,
            level: node.dataset.level,
            // Capture parent context from data attributes
            resource_type: node.dataset.resourcetype, // Note: dataset keys are lowercased
            category: node.dataset.category,
            subcategory: node.dataset.subcategory,
            data_type: node.dataset.datatype // Assuming level 4 maps to this
            // Add more levels if needed and available in dataset
        };
        // Clean up undefined properties
        Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);
        selectedFilters.push(filter);
    });

    return selectedFilters;
}

function filterDisplayedResults(selectedFilters) {
    const dataRows = document.querySelectorAll('.data-row');
    let visibleRowCount = 0;

    if (selectedFilters.length === 0) {
        // No filters selected, show all rows within the initially fetched results
        dataRows.forEach(row => {
            row.style.display = '';
            visibleRowCount++;
        });
    } else {
        // Apply the selected filters (currently supports single selection)
        const filter = selectedFilters[0]; // Assuming single selection for simplicity

        dataRows.forEach(row => {
            let shouldDisplay = true;

            // Check against the filter's path properties
            if (filter.resource_type && row.closest('.resource-type-section').querySelector('h3').textContent !== filter.resource_type) {
                shouldDisplay = false;
            }
            if (shouldDisplay && filter.category && row.dataset.category !== filter.category) {
                shouldDisplay = false;
            }
            if (shouldDisplay && filter.subcategory && row.dataset.subcategory !== filter.subcategory) {
                shouldDisplay = false;
            }
            if (shouldDisplay && filter.data_type && row.dataset.dataType !== filter.data_type) { // Check data-data-type attribute on row
                shouldDisplay = false;
            }
            // How to filter based on level 5 items? Requires a corresponding field in the row's data attributes.
            // Example: if (shouldDisplay && filter.type === 'level_5_item' && row.dataset.level5Item !== filter.value) { shouldDisplay = false; }


            // Final check: ensure the row's own type matches the filter type if it's a leaf filter
            // This logic might be too restrictive depending on desired behavior.
            // Example: If filtering by 'category', only show rows matching that category.
            // If filtering by 'level_5_item', only show rows matching that specific item *and* its parents.
            // The path check above handles the parent matching.

            row.style.display = shouldDisplay ? '' : 'none';
            if (shouldDisplay) {
                visibleRowCount++;
            }
        });
    }

    // Update section visibility
    document.querySelectorAll('.resource-type-section').forEach(section => {
        const visibleRows = section.querySelectorAll('.data-row:not([style*="display: none"])').length;
        section.style.display = visibleRows > 0 ? '' : 'none';
    });

    // Update count display
    document.getElementById('results-count').textContent = visibleRowCount;
}

function addActiveFilter(filterType, filterValue, displayValue = null, filterInfo = null) {
    const activeFiltersContainer = document.getElementById('active-filter-tags');

    // Use a unique key combining type and value for checking existence
    const filterKey = `${filterType}-${filterValue}`;
    if (document.querySelector(`.filter-tag[data-filter-key="${filterKey}"]`)) {
        return;
    }

    const displayType = formatFilterType(filterType);
    // Use context to create a more descriptive display value if needed
    let valueToShow = displayValue || formatFilterValue(filterValue);
    // Example: if (filterInfo && filterInfo.category) { valueToShow += ` (in ${formatFilterValue(filterInfo.category)})`; }

    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.dataset.filterKey = filterKey; // Use unique key
    tag.dataset.type = filterType;
    tag.dataset.value = filterValue;

    // Store context in data attributes if provided
    if (filterInfo) {
        Object.keys(filterInfo).forEach(key => {
            // Avoid storing large objects or redundant info like 'type', 'value', 'level' if already present
            if (key !== 'type' && key !== 'value' && key !== 'level' && filterInfo[key]) {
                 tag.dataset[key] = filterInfo[key];
            }
        });
    }


    tag.innerHTML = `
        <span class="filter-type">${displayType}:</span>
        <span class="filter-value">${valueToShow}</span>
        <span class="remove-filter" data-type="${filterType}" data-value="${filterValue}">&times;</span>
    `;

    activeFiltersContainer.appendChild(tag);
    document.querySelector('.active-filters').style.display = 'flex';

    tag.querySelector('.remove-filter').addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        const value = this.getAttribute('data-value');

        // Deselect the corresponding item in hierarchy
        // Find the specific node using context if possible, otherwise just type/value
        let selector = `.hierarchy-node[data-type="${type}"][data-value="${value}"],
                       .hierarchy-subnode[data-type="${type}"][data-value="${value}"],
                       .hierarchy-deepnode[data-type="${type}"][data-value="${value}"],
                       .hierarchy-leafnode[data-type="${type}"][data-value="${value}"]`;
        // Refine selector using context if needed, e.g., find node with matching parent data attributes

        const hierarchyItem = document.querySelector(selector); // Might select wrong one if values repeat
        if (hierarchyItem) {
            hierarchyItem.classList.remove('selected');
        }

        removeActiveFilter(type, value); // Remove the tag itself

        // Re-apply filtering (which will now be empty or based on other selections)
        const selectedFilters = getSelectedHierarchyFilters();
        filterDisplayedResults(selectedFilters);
    });
}

function removeActiveFilter(filterType, filterValue) {
    const filterKey = `${filterType}-${filterValue}`;
    const tag = document.querySelector(`.filter-tag[data-filter-key="${filterKey}"]`);
    if (tag) {
        tag.remove();
    }

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
        'data_type': 'Data Type', // Level 4
        'level_5_item': 'Detail', // Level 5
        // Add mappings for other level_X_item types if needed
    };

    // Basic formatting for unmapped types like 'level_4_item'
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatFilterValue(value) {
    // Replace underscores with spaces and capitalize words
    return value.replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
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

// --- New Function for Network Graph ---
function setupNetworkGraph() {
    const container = document.getElementById('network-graph-container');
    const loadingIndicator = container.querySelector('.loading-indicator');

    if (!vis || !container) {
        console.error("Vis.js library or graph container not found.");
        if(loadingIndicator) loadingIndicator.textContent = "Error loading graph.";
        return;
    }

    fetch('/api/network-data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (loadingIndicator) loadingIndicator.style.display = 'none'; // Hide loading indicator

            if (!data || !data.nodes || !data.edges) {
                 console.error('Invalid data received for network graph:', data);
                 container.innerHTML = '<p>Error: Could not load network data.</p>';
                 return;
            }

            const nodes = new vis.DataSet(data.nodes);
            const edges = new vis.DataSet(data.edges);

            const options = {
                nodes: {
                    borderWidth: 1,
                    borderWidthSelected: 2,
                    font: {
                        size: 12,
                        face: 'Inter',
                        color: '#333'
                    },
                    shapeProperties: {
                        interpolation: false // 'true' for smooth node shapes
                    }
                },
                edges: {
                    width: 0.5,
                    color: { inherit: 'from' },
                    smooth: {
                        type: 'continuous' // Makes edges smoother
                    }
                },
                physics: {
                    enabled: true,
                    solver: 'barnesHut', // Good general-purpose solver
                    barnesHut: {
                        gravitationalConstant: -8000, // Adjust for spread/tightness
                        centralGravity: 0.1, // Pulls nodes towards center
                        springLength: 120, // Default edge length
                        springConstant: 0.05,
                        damping: 0.09,
                        avoidOverlap: 0.1 // Helps prevent node overlap
                    },
                    stabilization: { // Speed up initial stabilization
                        iterations: 1000,
                        fit: true
                    }
                },
                interaction: {
                    hover: true, // Show hover effects
                    tooltipDelay: 200, // Delay before tooltip appears
                    navigationButtons: true, // Add zoom/fit buttons
                    keyboard: true // Enable keyboard navigation
                },
                layout: {
                    // hierarchical: { // Alternative layout
                    //     enabled: false,
                    //     direction: 'UD', // Up-Down
                    //     sortMethod: 'hubsize' // 'directed' or 'hubsize'
                    // }
                }
                // Groups can be defined here if needed, but we set color/shape directly on nodes
                // groups: {
                //     data_point: { color: { background: '#97C2FC', border: '#2B7CE9' }, shape: 'dot' },
                //     country_node: { color: { background: '#FFFF00', border: '#FFA500' }, shape: 'hexagon' },
                //     domain_node: { color: { background: '#FB7E81', border: '#FA0000' }, shape: 'square' },
                //     // ... other groups
                // }
            };

            const networkData = { nodes: nodes, edges: edges };
            const network = new vis.Network(container, networkData, options);

            // Optional: Add event listeners
            network.on("click", function (params) {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    console.log('Clicked node:', nodeId);
                    // You could potentially open the resource modal if a data point node is clicked
                    if (nodeId.startsWith('dp_')) {
                        const resourceId = nodeId.substring(3); // Extract ID
                        // Check if showResourceDetails exists and is callable
                        if (typeof showResourceDetails === 'function') {
                             // showResourceDetails(resourceId); // This might need adjustment if showResourceDetails expects the DB primary key (integer) instead of data_source_id
                             console.log("Attempting to show details for:", resourceId);
                             // You might need to fetch the integer ID based on data_source_id first
                        }
                    }
                }
            });

             network.on("stabilizationIterationsDone", function () {
                network.setOptions( { physics: false } ); // Turn off physics after stabilization
            });


        })
        .catch(error => {
            console.error('Error fetching or processing network data:', error);
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            container.innerHTML = `<p>Error loading network graph: ${error.message}. Please try again later.</p>`;
        });
}