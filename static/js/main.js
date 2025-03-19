// Tag filtering
document.addEventListener('DOMContentLoaded', function() {
    const tagButtons = document.querySelectorAll('.tag-btn');
    const dataRows = document.querySelectorAll('.data-table tbody tr');
    
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.dataset.tag;
            this.classList.toggle('active');
            
            // Get all active tags
            const activeTags = Array.from(document.querySelectorAll('.tag-btn.active'))
                                  .map(btn => btn.dataset.tag);
            
            // Filter table rows
            dataRows.forEach(row => {
                if (activeTags.length === 0) {
                    row.style.display = '';
                } else {
                    const rowTags = row.dataset.tags.split(',');
                    const hasTag = activeTags.some(tag => rowTags.includes(tag));
                    row.style.display = hasTag ? '' : 'none';
                }
            });
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