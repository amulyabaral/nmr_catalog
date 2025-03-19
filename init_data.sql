INSERT INTO data_points (
    data_source_id,
    category,
    subcategory,
    data_type,
    data_format,
    data_resolution,
    repository,
    repository_url,
    data_description,
    keywords,
    last_updated,
    contact_information,
    metadata
) VALUES 
('NOAMR2023', 'clinical', 'phenotypic', 'mic_data', 'CSV', 'high_resolution', 'Local Database', 
'https://niph.no/amr/dataset/2023', 'Comprehensive collection of clinical AMR data from Norwegian hospitals',
'AMR, clinical, surveillance, Norway, MIC', '2023-12-31', 'amr@niph.no',
'{"title": "Norwegian AMR Surveillance Data 2023", "creator": "Norwegian Institute of Public Health", "institution": "NIPH", "geographic_coverage": "Norway", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://www.niph.no/en/amr-data", "research_area": "Clinical Surveillance"}'),

('SWWAMR2023', 'environmental', 'water', 'resistance_monitoring', 'JSON', 'comprehensive', 'Institutional Repository',
'https://ki.se/amr/ww2023', 'Wastewater AMR monitoring data from Stockholm region',
'wastewater, environmental, AMR, Stockholm', '2023-11-15', 'amr.data@ki.se',
'{"title": "Stockholm Wastewater AMR Study", "creator": "Karolinska Institute", "institution": "KI", "geographic_coverage": "Stockholm, Sweden", "license": "CC BY-NC 4.0", "version": "2.1", "documentation_link": "https://ki.se/amr-data", "research_area": "Environmental Surveillance"}'); 