// Tag filtering
document.addEventListener('DOMContentLoaded', function() {
    // Get all data rows once
    const dataRows = document.querySelectorAll('.data-table tbody tr');
    
    // Active filters state
    const activeFilters = {
        country: 'all',
        dataType: 'all',
        tags: []
    };
    
    // Apply all filters function
    function applyFilters() {
        dataRows.forEach(row => {
            // Get row data
            const rowMetadata = JSON.parse(row.getAttribute('data-metadata') || '{}');
            const rowCountry = rowMetadata.geographic_coverage || '';
            const rowCategory = row.getAttribute('data-category') || '';
            const rowTags = (row.getAttribute('data-tags') || '').split(',').map(tag => tag.trim());
            
            // Check if row passes all active filters
            const passesCountryFilter = activeFilters.country === 'all' || 
                                       rowCountry.includes(activeFilters.country);
            
            const passesTypeFilter = activeFilters.dataType === 'all' || 
                                    rowCategory === activeFilters.dataType;
            
            const passesTagFilter = activeFilters.tags.length === 0 || 
                                   activeFilters.tags.some(tag => rowTags.includes(tag));
            
            // Show/hide row based on combined filter result
            row.style.display = (passesCountryFilter && passesTypeFilter && passesTagFilter) ? '' : 'none';
        });
    }
    
    // Country filter functionality
    const countryButtons = document.querySelectorAll('.country-btn');
    
    countryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            countryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter state
            activeFilters.country = this.getAttribute('data-country');
            
            // Apply all filters
            applyFilters();
        });
    });
    
    // Data type filter functionality
    const dataTypeButtons = document.querySelectorAll('.data-type-btn');
    
    dataTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            dataTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter state
            activeFilters.dataType = this.getAttribute('data-type');
            
            // Apply all filters
            applyFilters();
        });
    });
    
    // Tag filter functionality
    const tagButtons = document.querySelectorAll('.tag-btn');
    
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.dataset.tag;
            this.classList.toggle('active');
            
            // Update filter state
            if (this.classList.contains('active')) {
                activeFilters.tags.push(tag);
            } else {
                activeFilters.tags = activeFilters.tags.filter(t => t !== tag);
            }
            
            // Apply all filters
            applyFilters();
        });
    });
    
    // View button functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dataId = this.getAttribute('data-id');
            // Show a modal with detailed information
            // This would be implemented based on your UI design
            console.log(`View details for data point ${dataId}`);
        });
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 