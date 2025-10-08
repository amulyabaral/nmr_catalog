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
    setupExpandAIChatButton(); // New function call
    
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
    setupAIFormListener();
    setupAIChatInterface();
});

function setupBrowseTabs() {
    const tabs = document.querySelectorAll('.browse-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabs.length === 0 || tabContents.length === 0) {
        // console.log("Browse tab elements not found on this page. Skipping setupBrowseTabs.");
        return;
    }
    
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
    // console.log('Setting up checkboxes:', checkboxes.length); // Already logged at the top
    if (checkboxes.length === 0) {
        // console.log("No category checkboxes found on this page. Skipping setupCategoryCheckboxes.");
        return;
    }
    
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
    if (!exploreButton) return; // Add safety check - already present, good.
    
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
    const clearFiltersButton = document.getElementById('clear-filters');

    if (!exploreButton || !clearFiltersButton) {
        // console.log("Explore button or clear filters button not found on this page. Skipping setupExploreButton.");
        return;
    }
    
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
    clearFiltersButton.addEventListener('click', clearAllFilters);
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

    if (!modal || !closeBtn) {
        // console.log("Modal elements not found on this page. Skipping setupModal.");
        return;
    }
    
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

    // Sort resource types to show "Systems" first, then alphabetically
    const sortedResourceTypes = Object.entries(groupedData).sort((a, b) => {
        const [typeA] = a;
        const [typeB] = b;
        
        // Check if either is "Systems" (case-insensitive)
        const isSystemsA = typeA.toLowerCase().includes('system');
        const isSystemsB = typeB.toLowerCase().includes('system');
        
        if (isSystemsA && !isSystemsB) return -1; // Systems first
        if (!isSystemsA && isSystemsB) return 1;  // Systems first
        return typeA.localeCompare(typeB); // Otherwise alphabetical
    });

    // Create sections for each resource type with improved display
    for (const [resourceType, resources] of sortedResourceTypes) {
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
                        </tr>
                    </thead>
                    <tbody>
                        ${resources.map(resource => {
                            // Parse metadata for additional info
                            let metadata = {};
                            try {
                                metadata = typeof resource.metadata === 'string' ? JSON.parse(resource.metadata) : resource.metadata || {};
                            } catch(e) {
                                console.error('Failed to parse metadata:', e);
                            }

                            // --- UPDATED: Access countries_list and domains_list ---
                            const countriesDisplay = Array.isArray(resource.countries_list) ? resource.countries_list.join(', ') : 'N/A';
                            const domainsDisplay = Array.isArray(resource.domains_list) ? resource.domains_list.join(', ') : 'N/A';
                            // --- END UPDATE ---

                            return `
                                <tr class="data-row" data-id="${resource.data_source_id}"
                                    data-category="${resource.category || ''}"
                                    data-subcategory="${resource.subcategory || ''}"
                                    data-data-type="${resource.data_type || ''}">
                                    <td>
                                        <a href="${resource.repository_url}" class="resource-link" target="_blank">
                                            ${metadata.title || resource.data_source_id}
                                        </a>
                                        <div class="resource-metadata">
                                            ${resource.category ? `<span class="metadata-item">${resource.category.replace(/_/g, ' ')}</span>` : ''}
                                            ${resource.subcategory ? `<span class="metadata-item">${resource.subcategory.replace(/_/g, ' ')}</span>` : ''}
                                            ${resource.data_type ? `<span class="metadata-item">${resource.data_type.replace(/_/g, ' ')}</span>` : ''}
                                            ${resource.level5 ? `<span class="metadata-item">${resource.level5.replace(/_/g, ' ')}</span>` : ''}
                                        </div>
                                    </td>
                                    <td>${countriesDisplay}</td>
                                    <td>${domainsDisplay}</td>
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
    const modal = document.getElementById('resource-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetailsContainer = document.getElementById('modal-details'); // Corrected ID
    const resourceLink = document.getElementById('resource-link');

    if (!modal || !modalTitle || !modalDetailsContainer || !resourceLink) {
        console.error('Modal elements not found for showResourceDetails! Ensure modal HTML is on the page and IDs are correct (modal-details).');
        return;
    }

    // Show loading state in modal
    modalTitle.textContent = 'Loading...';
    modalDetailsContainer.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div>';
    resourceLink.style.display = 'none';
    modal.style.display = 'block';

    fetch(`/api/resource/${resourceId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok for resource ${resourceId}. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data) {
                modalTitle.textContent = 'Error';
                modalDetailsContainer.innerHTML = '<p>Resource details not found.</p>';
                return;
            }

            modalTitle.textContent = data.metadata?.title || data.data_source_id || 'Resource Details';
            
            let detailsHtml = '<div class="detail-grid">';

            // Section 1: General Info
            detailsHtml += '<div class="detail-section"><h3>General Information</h3>';
            detailsHtml += `<div class="detail-row"><span class="detail-label">ID:</span> <span class="detail-value">${data.data_source_id}</span></div>`;
            
            const description = data.metadata?.description || data.data_description;
            if (description) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Description:</span> <span class="detail-value detail-description">${description}</span></div>`;
            }
            if (data.year_start || data.year_end) { // Show even if one is present
                detailsHtml += `<div class="detail-row"><span class="detail-label">Year Range:</span> <span class="detail-value">${data.year_start || 'N/A'} - ${data.year_end || 'N/A'}</span></div>`;
            }
            const contact = data.metadata?.contact_info || data.contact_information;
            if (contact) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Contact:</span> <span class="detail-value detail-contact">${contact}</span></div>`;
            }
            if (data.metadata?.license) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">License:</span> <span class="detail-value">${data.metadata.license}</span></div>`;
            }
            detailsHtml += '</div>'; 

            // Section 2: Classification & Tags
            detailsHtml += '<div class="detail-section"><h3>Classification & Tags</h3>';
            const hierarchyPath = [
                data.resource_type, data.category, data.subcategory, data.data_type, data.level5
            ].filter(Boolean).map(s => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' > ');
            if (hierarchyPath) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Primary Path:</span> <span class="detail-value">${hierarchyPath}</span></div>`;
            }

            if (data.countries_list && data.countries_list.length > 0) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Countries:</span> <span class="detail-value detail-tags">${data.countries_list.map(c => `<span class="detail-tag country">${c}</span>`).join('')}</span></div>`;
            }
            if (data.domains_list && data.domains_list.length > 0) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Domains:</span> <span class="detail-value detail-tags">${data.domains_list.map(d => `<span class="detail-tag domain">${d}</span>`).join('')}</span></div>`;
            }
            if (data.keywords) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Keywords:</span> <span class="detail-value keyword-tags">${data.keywords.split(',').map(k => k.trim()).filter(Boolean).map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}</span></div>`;
            }
            if (data.related_metadata_list && data.related_metadata_list.length > 0) {
                 detailsHtml += `<div class="detail-row"><span class="detail-label">Related Meta:</span> <span class="detail-value detail-tags">${data.related_metadata_list.map(m => `<span class="detail-tag subcategory">${m.split(' > ').pop()}</span>`).join('')}</span></div>`;
            }
             if (data.related_resources_list && data.related_resources_list.length > 0) {
                detailsHtml += `<div class="detail-row"><span class="detail-label">Related Resources:</span> <span class="detail-value detail-tags">${data.related_resources_list.map(id => `<span class="keyword-tag">${id}</span>`).join('')}</span></div>`;
            }
            detailsHtml += '</div>'; 
            
            detailsHtml += '</div>'; // End detail-grid
            modalDetailsContainer.innerHTML = detailsHtml;

            if (data.repository_url) {
                resourceLink.href = data.repository_url;
                resourceLink.style.display = 'inline-block';
            } else {
                resourceLink.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching resource details for modal:', error);
            modalTitle.textContent = 'Error';
            modalDetailsContainer.innerHTML = `<p>Could not load resource details: ${error.message}</p>`;
        });
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
                const resourcesInType = data.filter(r => r.resource_type === resourceType).length;
                const hasChildren = details.sub_categories && Object.keys(details.sub_categories).length > 0;

                // Skip if no resources AND no subcategories defined (unless it's a top-level type we always want to show)
                // Let's keep all Level 1 types visible initially, even if empty for structure.
                // if (resourcesInType === 0 && !hasChildren) continue;

                const nodeLevel = details.level || 1;
                const node = createTreeNode(resourceType, `level-${nodeLevel}`, resourcesInType, hasChildren); // Pass hasChildren
                node.className = `hierarchy-node level-${nodeLevel}-node`;
                node.dataset.level = nodeLevel;
                node.dataset.type = 'resource_type';
                node.dataset.value = resourceType;

                // Add child container (initially hidden)
                const childrenDiv = document.createElement('div');
                childrenDiv.className = 'node-children';
                childrenDiv.style.display = 'none'; // Start collapsed
                node.appendChild(childrenDiv);

                hierarchyTree.appendChild(node);

                // Add subcategories if they exist
                if (hasChildren) {
                    const initialPath = { resource_type: resourceType };
                    addSubcategories(node, details.sub_categories, data, initialPath, nodeLevel);
                }
            }

            // Add click handlers for hierarchy filtering AND toggling
            setupHierarchyFilteringAndToggle(hierarchyTree); // Use updated function name

            // REMOVE code that expanded all nodes by default
            /*
            document.querySelectorAll('.hierarchy-node, .hierarchy-subnode, .hierarchy-deepnode').forEach(node => {
                 // ... expansion code removed ...
            });
            document.querySelectorAll('.node-toggle').forEach(toggle => {
                 // ... toggle update code removed ...
            });
            */
        })
        .catch(error => console.error('Error building resource hierarchy:', error));
}

function addSubcategories(parentNode, hierarchyNodeData, data, currentPath, parentLevel) {
    const nodeChildren = parentNode.querySelector('.node-children');
    if (!nodeChildren) return;

    const processNode = (key, details, currentLevel) => {
        if (currentLevel > 5) return;

        const nodeLevel = details.level || currentLevel;
        if (nodeLevel > 5) return;

        const displayName = details.title || key.replace(/_/g, ' ');
        // Determine if this node itself has children (sub_categories or items)
        const hasChildren = (details.sub_categories && Object.keys(details.sub_categories).length > 0) || (details.items && details.items.length > 0);
        const nodeClass = hasChildren ? 'hierarchy-deepnode' : 'hierarchy-leafnode';

        let nodeDataType;
        if (nodeLevel === 2) nodeDataType = 'category';
        else if (nodeLevel === 3) nodeDataType = 'subcategory';
        else if (nodeLevel === 4) nodeDataType = 'data_type';
        else nodeDataType = `level_${nodeLevel}_item`;

        // --- Resource Counting Logic (Simplified) ---
        let resourcesCount = 0;
        const countPath = { ...currentPath, [nodeDataType]: key };
         resourcesCount = data.filter(r => {
             let match = true;
             for(const pathKey in countPath) {
                 const resourceKey = pathKey === 'resource_type' ? 'resource_type' :
                                   pathKey === 'category' ? 'category' :
                                   pathKey === 'subcategory' ? 'subcategory' :
                                   pathKey === 'data_type' ? 'data_type' : null;

                 if (resourceKey && r[resourceKey] !== countPath[pathKey]) {
                     match = false;
                     break;
                 }
             }
             return match;
         }).length;
        // --- End Resource Counting Logic ---

        const node = document.createElement('div');
        node.className = `${nodeClass} level-${nodeLevel}-node`;
        node.dataset.level = nodeLevel;
        node.dataset.type = nodeDataType;
        node.dataset.value = key;

        Object.keys(currentPath).forEach(pathKey => {
            const datasetKey = pathKey.replace(/_/g, '');
            node.dataset[datasetKey] = currentPath[pathKey];
        });

        const headerClass = nodeClass === 'hierarchy-leafnode' ? 'leafnode-header' : 'deepnode-header'; // Use specific header class

        // Add toggle icon only if it has children
        const toggleIcon = hasChildren ? '<span class="node-toggle">▶</span>' : '<span class="node-toggle-placeholder"></span>';

        node.innerHTML = `
            <div class="${headerClass}" data-type="${node.dataset.type}" data-value="${key}">
                ${toggleIcon} ${displayName} <span class="count">(${resourcesCount})</span>
            </div>
            ${hasChildren ? '<div class="node-children" style="display: none;"></div>' : ''}
        `; // Children div starts hidden

        nodeChildren.appendChild(node);

        // Recursively process sub_categories if they exist
        if (details.sub_categories && Object.keys(details.sub_categories).length > 0) {
            const newPath = { ...currentPath, [nodeDataType]: key };
            addSubcategories(node, details.sub_categories, data, newPath, nodeLevel);
        }

        // Process items array (leaf nodes for this category/subcategory)
        if (details.items && Array.isArray(details.items) && details.items.length > 0) {
            const itemLevel = nodeLevel + 1;
            if (itemLevel <= 5) {
                const itemContainer = node.querySelector('.node-children');
                if (itemContainer) {
                     details.items.forEach(item => {
                        let itemName, itemValue;
                        if (typeof item === 'string') {
                            itemName = item; itemValue = item;
                        } else if (typeof item === 'object' && item !== null && item.name) {
                            itemName = item.name; itemValue = item.name;
                        } else { return; }

                        // --- Determine the data type/field for this item level ---
                        let itemDataType;
                        if (itemLevel === 2) itemDataType = 'category';
                        else if (itemLevel === 3) itemDataType = 'subcategory';
                        else if (itemLevel === 4) itemDataType = 'data_type';
                        else if (itemLevel === 5) itemDataType = 'level5'; // Map level 5 to 'level5' field
                        else itemDataType = `level_${itemLevel}_item`; // Fallback, might need adjustment

                        // --- Calculate Resource Count for this specific item ---
                        let itemResourcesCount = 0;
                        const itemPath = { ...currentPath, [nodeDataType]: key, [itemDataType]: itemValue }; // Path includes parent AND item
                        itemResourcesCount = data.filter(r => {
                            let match = true;
                            for(const pathKey in itemPath) {
                                // Map pathKey to the actual resource data field name
                                const resourceKey = pathKey === 'resource_type' ? 'resource_type' :
                                                  pathKey === 'category' ? 'category' :
                                                  pathKey === 'subcategory' ? 'subcategory' :
                                                  pathKey === 'data_type' ? 'data_type' :
                                                  pathKey === 'level5' ? 'level5' : // Check level5 field
                                                  null; // Add more mappings if hierarchy goes deeper or uses different fields

                                // If we have a valid mapping and the resource field doesn't match the path value
                                if (resourceKey && r[resourceKey] !== itemPath[pathKey]) {
                                    match = false;
                                    break;
                                }
                                // Handle cases where the pathKey doesn't map directly (e.g., 'level_3_item') - this might need refinement
                                // For now, we rely on direct field mappings (resource_type, category, etc.)
                            }
                            return match;
                        }).length;
                        // --- End Item Resource Counting Logic ---


                        const leafNode = document.createElement('div');
                        leafNode.className = `hierarchy-leafnode level-${itemLevel}-node`;
                        leafNode.dataset.level = itemLevel;
                        leafNode.dataset.type = itemDataType; // Use the determined type (e.g., 'subcategory', 'data_type')
                        leafNode.dataset.value = itemValue;

                        // Add parent context to dataset
                        Object.keys(currentPath).forEach(pathKey => {
                            const datasetKey = pathKey.replace(/_/g, '');
                            leafNode.dataset[datasetKey] = currentPath[pathKey];
                         });
                         // Add the parent node's key/value to the dataset as well
                         leafNode.dataset[nodeDataType.replace(/_/g, '')] = key;

                        leafNode.innerHTML = `
                            <div class="leafnode-header" data-type="${leafNode.dataset.type}" data-value="${itemValue}">
                                <span class="node-toggle-placeholder"></span> ${itemName.replace(/_/g, ' ')} <span class="count">(${itemResourcesCount})</span>
                            </div>
                        `; // Leaf nodes get placeholder
                        itemContainer.appendChild(leafNode);
                    });
                }
            }
        }
    };

    if (typeof hierarchyNodeData === 'object' && !Array.isArray(hierarchyNodeData) && hierarchyNodeData !== null) {
        for (const [key, details] of Object.entries(hierarchyNodeData)) {
            if (key === 'level' || key === 'title') continue;
            if (typeof details === 'object' && details !== null) {
                 processNode(key, details, parentLevel + 1);
            }
        }
    }
}

// Updated function to create tree node with optional toggle
function createTreeNode(name, cssClass, count = 0, hasChildren = false) {
    const node = document.createElement('div');
    node.className = `tree-node ${cssClass}-node`; // Base class + specific level/type class

    const levelMatch = cssClass.match(/level-(\d+)/);
    const level = levelMatch ? parseInt(levelMatch[1]) : 1;
    node.setAttribute('data-level', level);

    // Indentation is handled by CSS margin/padding on .node-children now

    const nodeContent = document.createElement('div');
    // Use specific header class based on level/type for targeting clicks
    let headerClass = 'node-header'; // Default
    if (cssClass.includes('level-1')) headerClass = 'node-header'; // Top level
    else if (cssClass.includes('leafnode')) headerClass = 'leafnode-header';
    else headerClass = 'deepnode-header'; // Default for intermediate nodes

    nodeContent.className = headerClass; // Use the determined header class
    nodeContent.dataset.type = node.dataset.type || cssClass; // Store type info
    nodeContent.dataset.value = name; // Store value info

    // Add toggle icon only if it has children, otherwise placeholder for alignment
    const toggleIcon = hasChildren ? '<span class="node-toggle">▶</span>' : '<span class="node-toggle-placeholder"></span>';

    const nodeName = document.createElement('span');
    nodeName.className = 'node-name';
    nodeName.textContent = name.replace(/_/g, ' '); // Format name for display

    const nodeCount = document.createElement('span');
    nodeCount.className = 'count'; // Use 'count' class consistent with subcategories
    nodeCount.textContent = `(${count})`;

    // Assemble the header content
    nodeContent.innerHTML = `${toggleIcon} ${nodeName.outerHTML} ${nodeCount.outerHTML}`;

    node.appendChild(nodeContent);

    // Child nodes div will be added by the calling function if needed

    return node;
}

// Renamed function to clarify it handles toggle too
function setupHierarchyFilteringAndToggle(hierarchyTree) {
    // Get all clickable header elements in the hierarchy
    const headerElements = hierarchyTree.querySelectorAll('.node-header, .deepnode-header, .leafnode-header'); // Target specific header classes

    headerElements.forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const parentElement = this.parentElement; // The node div (e.g., hierarchy-node, hierarchy-deepnode)
            const filterType = this.getAttribute('data-type');
            const filterValue = this.getAttribute('data-value');

            // --- Toggle Expansion Logic ---
            const childrenContainer = parentElement.querySelector(':scope > .node-children'); // Direct child
            const toggleIcon = this.querySelector('.node-toggle');

            if (childrenContainer && toggleIcon) { // Only toggle if it has children and a toggle icon
                const isExpanded = parentElement.classList.contains('node-expanded');
                if (isExpanded) {
                    childrenContainer.style.display = 'none';
                    parentElement.classList.remove('node-expanded');
                    toggleIcon.textContent = '▶'; // Update icon
                } else {
                    childrenContainer.style.display = 'block';
                    parentElement.classList.add('node-expanded');
                    toggleIcon.textContent = '▼'; // Update icon
                }
            }
            // --- End Toggle Expansion Logic ---


            // --- Filtering Logic (Apply selection to the clicked header's node) ---
            const isSelected = parentElement.classList.contains('selected');

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
            // --- End Filtering Logic ---
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
                    h.querySelector('.sort-icon').textContent = '↓'; // Reset icon
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
                    
                    // --- Updated Sorting Logic ---
                    if (sortKey === 'year-end') { // Sort by year-end
                        aValue = parseInt(a.querySelector(`td[data-year-end]`)?.getAttribute('data-year-end') || '0');
                        bValue = parseInt(b.querySelector(`td[data-year-end]`)?.getAttribute('data-year-end') || '0');
                    } else {
                        // Get cell index for other columns
                        const cellIndex = Array.from(this.parentNode.children).indexOf(this);
                        if (cellIndex !== -1) {
                            aValue = a.cells[cellIndex]?.textContent.trim().toLowerCase() || '';
                            bValue = b.cells[cellIndex]?.textContent.trim().toLowerCase() || '';
                        } else {
                            return 0; // Should not happen
                        }
                    }
                    // --- End Updated Sorting Logic ---

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

// --- Helper function to parse color string (hex, rgb, rgba) into {r, g, b, a} ---
function parseColor(colorString) {
    if (!colorString) return { r: 200, g: 200, b: 200, a: 1 }; // Default grey if no color

    // RGBA
    let match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] !== undefined ? parseFloat(match[4]) : 1
        };
    }

    // Hex short (#rgb)
    match = colorString.match(/^#([a-f\d])([a-f\d])([a-f\d])$/i);
    if (match) {
        return {
            r: parseInt(match[1] + match[1], 16),
            g: parseInt(match[2] + match[2], 16),
            b: parseInt(match[3] + match[3], 16),
            a: 1
        };
    }

    // Hex long (#rrggbb)
    match = colorString.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (match) {
        return {
            r: parseInt(match[1], 16),
            g: parseInt(match[2], 16),
            b: parseInt(match[3], 16),
            a: 1
        };
    }

    // TODO: Handle named colors if necessary, otherwise default
    console.warn("Could not parse color:", colorString, "Defaulting to grey.");
    return { r: 200, g: 200, b: 200, a: 1 }; // Default grey
}

// --- Helper function to set opacity on a color string ---
function setOpacity(colorString, opacity) {
    const color = parseColor(colorString);
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
}

// --- Helper function to update opacity for a node/edge color property (string or object) ---
function updateColorOpacity(colorProperty, opacity) {
    if (!colorProperty) return colorProperty; // Return null/undefined as is

    if (typeof colorProperty === 'string') {
        return setOpacity(colorProperty, opacity);
    } else if (typeof colorProperty === 'object') {
        const newColor = {};
        if (colorProperty.color) newColor.color = setOpacity(colorProperty.color, opacity);
        if (colorProperty.background) newColor.background = setOpacity(colorProperty.background, opacity);
        if (colorProperty.border) newColor.border = setOpacity(colorProperty.border, opacity);

        // Handle highlight and hover states if they exist
        if (colorProperty.highlight) {
            newColor.highlight = updateColorOpacity(colorProperty.highlight, opacity); // Recurse for nested objects
        }
        if (colorProperty.hover) {
            newColor.hover = updateColorOpacity(colorProperty.hover, opacity); // Recurse for nested objects
        }
        return newColor;
    }
    return colorProperty; // Return original if type is unexpected
}


// --- Updated Function for Physics-Based Network Graph ---
function setupNetworkGraph() {
    const container = document.getElementById('network-graph-container');
    
    if (!container) {
        // console.log("Network graph container not found on this page. Skipping setupNetworkGraph.");
        return;
    }
    const loadingIndicator = container.querySelector('.loading-indicator');

    // Check for vis library
    if (typeof vis === 'undefined' || !container) {
        console.error("Vis.js library or graph container not found.");
        if(loadingIndicator) loadingIndicator.textContent = "Error loading graph library.";
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
                    borderWidth: 0.5,
                    borderWidthSelected: 2,
                    size: 15, // Smaller default node size
                    font: {
                        size: 11, // Smaller font like Obsidian
                        face: 'Inter',
                        color: '#555555',
                        strokeWidth: 0
                    },
                    shapeProperties: {
                        interpolation: true
                    },
                    shadow: {
                        enabled: true,
                        color: 'rgba(0,0,0,0.1)',
                        size: 4,
                        x: 0,
                        y: 1
                    }
                },
                edges: {
                    width: 0.5, // Thinner edges like Obsidian
                    color: {
                        inherit: false,
                        color: '#d0d0d0', // Lighter edge color
                        highlight: '#999999',
                        hover: '#b0b0b0'
                    },
                    smooth: {
                        enabled: true,
                        type: "continuous",
                        roundness: 0.5
                    },
                    hoverWidth: 0.5,
                    selectionWidth: 1
                },
                physics: {
                    enabled: true,
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: {
                        gravitationalConstant: -80,
                        centralGravity: 0.005,
                        springLength: 95,
                        springConstant: 0.12,
                        damping: 0.3,
                        avoidOverlap: 0.8
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 300,
                        updateInterval: 20,
                        onlyDynamicEdges: false,
                        fit: true
                    },
                    maxVelocity: 35,
                    minVelocity: 0.5,
                    timestep: 0.35,
                    adaptiveTimestep: true
                },
                interaction: {
                    hover: true,
                    hoverConnectedEdges: true,
                    selectConnectedEdges: false,
                    tooltipDelay: 100,
                    navigationButtons: false,
                    keyboard: true,
                    dragNodes: true,
                    dragView: true,
                    zoomView: true,
                    zoomSpeed: 0.8
                },
                // layout: { hierarchical: { ... } } // << REMOVED HIERARCHICAL LAYOUT
            };

            const networkData = { nodes: nodes, edges: edges };
            const network = new vis.Network(container, networkData, options);

            // Store original colors for reset (optional, but safer)
            // We'll try resetting without storing originals first by recalculating rgba with alpha=1

            // --- Event listener for SINGLE clicking nodes (Highlighting) ---
            network.on("click", function (params) {
                const allNodes = nodes.get({ returnType: "Object" });
                const allEdges = edges.get({ returnType: "Object" });
                const nodeUpdates = [];
                const edgeUpdates = [];
                const lowNodeOpacity = 0.2;
                const lowEdgeOpacity = 0.1;

                if (params.nodes.length > 0) {
                    const clickedNodeId = params.nodes[0];
                    // const nodeData = nodes.get(clickedNodeId); // No longer needed here for modal

                    // Get IDs of connected nodes and edges
                    const connectedNodes = network.getConnectedNodes(clickedNodeId);
                    const allNodesToSelect = new Set([clickedNodeId, ...connectedNodes]);
                    const connectedEdges = new Set(network.getConnectedEdges(clickedNodeId));

                    // Update nodes opacity
                    for (const nodeId in allNodes) {
                        const node = allNodes[nodeId];
                        const targetOpacity = allNodesToSelect.has(nodeId) ? 1.0 : lowNodeOpacity;
                        const newColor = updateColorOpacity(node.color, targetOpacity);
                        const newFont = { ...(node.font || {}), color: setOpacity((node.font && node.font.color) || '#333333', targetOpacity) };
                        nodeUpdates.push({ id: nodeId, color: newColor, font: newFont });
                    }

                    // Update edges opacity
                    for (const edgeId in allEdges) {
                        const edge = allEdges[edgeId];
                        const targetOpacity = connectedEdges.has(edgeId) ? 1.0 : lowEdgeOpacity;
                        const newColor = updateColorOpacity(edge.color, targetOpacity);
                        edgeUpdates.push({ id: edgeId, color: newColor });
                    }

                    // Apply updates
                    nodes.update(nodeUpdates);
                    edges.update(edgeUpdates);

                    // Keep selection for border highlight
                    network.setSelection({
                        nodes: Array.from(allNodesToSelect),
                        edges: Array.from(connectedEdges)
                    });

                    // --- REMOVED modal opening logic from single click ---
                    // if (nodeData && nodeData.group === 'data_point' && nodeData.dataSourceId) { ... }

                } else {
                    // Clicked on empty space, reset all opacities
                    for (const nodeId in allNodes) {
                        const node = allNodes[nodeId];
                        const newColor = updateColorOpacity(node.color, 1.0);
                        const newFont = { ...(node.font || {}), color: setOpacity((node.font && node.font.color) || '#333333', 1.0) };
                        nodeUpdates.push({ id: nodeId, color: newColor, font: newFont });
                    }
                    for (const edgeId in allEdges) {
                        const edge = allEdges[edgeId];
                        const newColor = updateColorOpacity(edge.color, 1.0);
                        edgeUpdates.push({ id: edgeId, color: newColor });
                    }

                    // Apply updates
                    nodes.update(nodeUpdates);
                    edges.update(edgeUpdates);

                    // Clear selection
                    network.unselectAll();
                }
            });

            // --- NEW Event listener for DOUBLE clicking nodes (Open Modal) ---
            network.on("doubleClick", function (params) {
                if (params.nodes.length > 0) {
                    const clickedNodeId = params.nodes[0];
                    const nodeData = nodes.get(clickedNodeId); // Get data for the double-clicked node

                    // Check if it's a data point node and has the necessary ID
                    if (nodeData && nodeData.group === 'data_point' && nodeData.dataSourceId) {
                        if (typeof showResourceDetails === 'function') {
                            console.log("Network node double-clicked. Attempting to show details for data_source_id:", nodeData.dataSourceId);
                            showResourceDetails(nodeData.dataSourceId); // Pass the data_source_id
                        } else {
                            console.error("showResourceDetails function not found");
                        }
                    }
                }
                // No action needed if double-clicking empty space or non-data point node
            });
            // --- END NEW Double Click Listener ---


            // --- Optional: Stop physics after stabilization ---
            network.on("stabilizationIterationsDone", function () {
                network.setOptions( { physics: false } );
                console.log("Network stabilized, physics turned off.");
            });

        })
        .catch(error => {
            console.error('Error fetching or processing network data:', error);
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            container.innerHTML = `<p>Error loading network graph: ${error.message}. Please try again later.</p>`;
        });
}

$(document).ready(function() {
    // Initialize Select2 for multi-selects (including countries/domains)
    $('.multi-select-tags').select2({
         placeholder: "Select one or more...",
         allowClear: true,
         tags: false // Prevent creation of new tags
    });
    // ... rest of the JS ...
});

// <<< NEW FUNCTION for AI Form Spinner and Logs >>>
function setupAIFormListener() {
    const aiForm = document.getElementById('ai-input-form');
    if (!aiForm) {
        // console.log("AI Form not found, spinner not set up."); // Debug
        return;
    }

    const aiStatusContainer = document.getElementById('ai-status-container');
    const aiStatusMessage = document.getElementById('ai-status-message');
    const aiButtons = aiForm.querySelectorAll('button[type="submit"]');
    const aiUrlInput = document.getElementById('ai_url');
    const aiFileInput = document.getElementById('ai_file');

    aiForm.addEventListener('submit', function(event) {
        console.log("AI form submitted."); // Debug

        // Basic client-side validation
        if (!aiUrlInput.value.trim() && (!aiFileInput.files || aiFileInput.files.length === 0)) {
            if (aiStatusContainer) aiStatusContainer.style.display = 'block';
            if (aiStatusMessage) aiStatusMessage.textContent = 'Please provide a URL or upload a file.';
            if (aiStatusContainer) {
                const spinner = aiStatusContainer.querySelector('.spinner');
                if(spinner) spinner.style.display = 'none';
            }
            console.log("AI form validation failed: No URL or file."); // Debug
            event.preventDefault(); 
            return;
        }

        if (aiStatusContainer) {
            aiStatusContainer.style.display = 'block';
            const spinner = aiStatusContainer.querySelector('.spinner');
            if(spinner) {
                spinner.style.display = 'inline-block'; 
                console.log("Spinner and status container should be visible now."); // Debug
            } else {
                console.log("Spinner element not found in container."); // Debug
            }
        } else {
            console.log("AI status container not found."); // Debug
        }

        if (aiStatusMessage) {
            if (aiFileInput.files && aiFileInput.files.length > 0) {
                aiStatusMessage.textContent = 'Uploading and processing file... This may take a moment.';
            } else if (aiUrlInput.value.trim()) {
                aiStatusMessage.textContent = 'Processing URL... This may take a moment.';
            } else {
                aiStatusMessage.textContent = 'Preparing for AI processing...';
            }
            console.log("AI Status message set:", aiStatusMessage.textContent); // Debug
        }
        aiButtons.forEach(button => button.disabled = true);
        console.log("AI form buttons disabled. Submitting..."); // Debug
        // The form will now submit
    });
}
// <<< END NEW FUNCTION >>>

// <<< UPDATED FUNCTION for AI Chat Interface >>>
function setupAIChatInterface() {
    // Adjusted for dedicated page: ai-chat-modal is now the main page container for chat.
    // No modal show/hide logic needed here if it's a full page.
    const chatInterfaceContainer = document.querySelector('.ai-chat-container'); // Main container on the AI explorer page
    
    // If these elements are not on the current page, the function will exit early.
    // This allows main.js to be included on all pages without error.
    const sendButton = document.getElementById('ai-chat-send-btn');
    const messageInput = document.getElementById('ai-chat-input');
    const messagesContainer = document.querySelector('.ai-chat-messages');
    const resourceSelect = $('#ai-chat-resource-select'); // jQuery selector for Select2
    const loadingIndicator = document.getElementById('ai-chat-loading');

    // Check if essential chat elements are present on the page
    if (!chatInterfaceContainer || !sendButton || !messageInput || !messagesContainer || !resourceSelect.length) {
        console.log('AI Chat interface elements not found or incomplete on this page. Skipping setup. Ensure all IDs like "ai-chat-send-btn", "ai-chat-input" etc. are correct in your HTML.');
        return;
    }
    console.log('Setting up AI Chat Interface: All essential elements found.');


    let selectedResourceIdsForAIChat = [];

    // Initialize Select2 for resource selection
    // Check if Select2 is already initialized to prevent re-initialization issues
    if (!resourceSelect.data('select2')) {
        console.log('Initializing Select2 for AI Chat resource selection.');
        resourceSelect.select2({
            placeholder: 'Search and select resources by name or ID...',
            minimumInputLength: 2,
            allowClear: true,
            dropdownParent: $('.ai-chat-context-selection'), // Ensures dropdown is positioned correctly relative to its parent
            ajax: {
                url: '/api/search-resources',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return { q: params.term };
                },
                processResults: function (data) {
                    return { results: data }; // API returns {id, text}
                },
                cache: true
            }
        });
    } else {
        console.log('Select2 already initialized for AI Chat resource selection.');
    }

    resourceSelect.on('change', function() {
        selectedResourceIdsForAIChat = $(this).val() || [];
        console.log('AI Chat - Selected resource IDs:', selectedResourceIdsForAIChat);
    });

    sendButton.addEventListener('click', function() {
        console.log("Send button clicked!"); // Log when the button is clicked
        sendMessageToAI();
    });

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            console.log("Enter key pressed in chat input!"); // Log enter key press
            sendMessageToAI();
        }
    });

    function sendMessageToAI() {
        console.log("sendMessageToAI function called."); // Log when this function starts
        const userQuery = messageInput.value.trim();
        if (!userQuery) {
            console.log("User query is empty, not sending.");
            return;
        }

        appendMessage(userQuery, 'user-message', messagesContainer);
        messageInput.value = '';
        if(loadingIndicator) loadingIndicator.style.display = 'flex';
        sendButton.disabled = true;
        console.log("Send button disabled, preparing to fetch AI response.");

        fetch('/api/ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: userQuery,
                selected_resource_ids: selectedResourceIdsForAIChat
            })
        })
        .then(response => {
            console.log("Received response from /api/ai-chat");
            if (!response.ok) {
                return response.json().then(err => { 
                    console.error("AI Chat API error response:", err);
                    throw new Error(err.error || 'Network response was not ok'); 
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("AI response data:", data);
            appendMessage(data.reply, 'ai-message', messagesContainer);
        })
        .catch(error => {
            console.error('AI Chat Error during fetch or processing:', error);
            appendMessage(`Sorry, I encountered an error: ${error.message}`, 'ai-message', messagesContainer);
        })
        .finally(() => {
            if(loadingIndicator) loadingIndicator.style.display = 'none';
            sendButton.disabled = false;
            messageInput.focus();
            console.log("Send button re-enabled in finally block.");
        });
    }
}

// UPDATED appendMessage to handle clickable resource links
function appendMessage(text, type, messagesContainerElement) {
    if (!messagesContainerElement) {
        console.error("Messages container not found for appending message.");
        return;
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(type);
    
    if (type === 'ai-message') {
        // Use marked to parse Markdown content from AI
        // Ensure marked is loaded before this function is called.
        let htmlContent = "";
        if (typeof marked !== 'undefined') {
            htmlContent = marked.parse(text);
        } else {
            console.warn("marked.js library not found. AI responses will not be rendered as Markdown.");
            // Fallback to plain text, escaping HTML
            const tempDiv = document.createElement('div');
            tempDiv.textContent = text;
            htmlContent = tempDiv.innerHTML.replace(/\n/g, '<br>');
        }
        messageDiv.innerHTML = htmlContent;

        // Find and process resource_click:// links
        const resourceLinks = messageDiv.querySelectorAll('a[href^="resource_click://"]');
        resourceLinks.forEach(link => {
            const href = link.getAttribute('href');
            const resourceId = href.substring("resource_click://".length);
            if (resourceId) {
                link.href = '#'; // Prevent default navigation
                link.style.cursor = 'pointer';
                // link.style.textDecoration = 'underline'; // Markdown usually handles this
                // link.style.color = 'var(--secondary-color)'; // Markdown might style this
                link.classList.add('ai-resource-link'); // Add a class for potential specific styling

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`AI Resource link clicked: ${resourceId}`);
                    showResourceDetails(resourceId); 
                });
            }
        });

    } else { // user-message
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
    }
    
    messagesContainerElement.appendChild(messageDiv);
    messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight; // Scroll to bottom
}

// Ensure setupAIChatInterface is called on DOMContentLoaded,
// it will check for necessary elements before proceeding.
// The main DOMContentLoaded listener in main.js already calls setupAIChatInterface.

function setupExpandAIChatButton() {
    const expandBtn = document.getElementById('expand-ai-chat-btn');
    const aiChatModal = document.getElementById('ai-chat-modal');
    const closeBtn = aiChatModal.querySelector('.ai-chat-close-btn');

    if (expandBtn && aiChatModal && closeBtn) {
        expandBtn.addEventListener('click', () => {
            aiChatModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            aiChatModal.style.display = 'none';
        });
    }
}