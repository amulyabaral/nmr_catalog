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
    metadata,
    country,
    domain,
    resource_type
) VALUES 
('NOAMR2023', 'omics_data', 'genomic', 'clinical_isolates', 'FASTQ', 'high_resolution', 'Local Database', 
'https://niph.no/amr/dataset/2023', 'Comprehensive collection of clinical AMR data from Norwegian hospitals',
'AMR, clinical, surveillance, Norway, WGS', '2023-12-31', 'amr@niph.no',
'{"title": "Norwegian AMR Surveillance Data 2023", "creator": "Norwegian Institute of Public Health", "institution": "NIPH", "geographic_coverage": "Norway", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://www.niph.no/en/amr-data", "research_area": "Clinical Surveillance"}',
'Norway', 'Human', 'Data'),

('SWWAMR2023', 'environmental_data', 'wastewater_infrastructure', 'chemical_monitoring_data', 'JSON', 'comprehensive', 'Institutional Repository',
'https://ki.se/amr/ww2023', 'Wastewater AMR monitoring data from Stockholm region',
'wastewater, environmental, AMR, Stockholm', '2023-11-15', 'amr.data@ki.se',
'{"title": "Stockholm Wastewater AMR Study", "creator": "Karolinska Institute", "institution": "KI", "geographic_coverage": "Stockholm, Sweden", "license": "CC BY-NC 4.0", "version": "2.1", "documentation_link": "https://ki.se/amr-data", "research_area": "Environmental Surveillance"}',
'Sweden', 'Environment', 'Data'),

('DKAMR2023', 'omics_data', 'genomic', 'whole_genome_sequencing', 'FASTQ', 'high_resolution', 'ENA',
'https://www.ebi.ac.uk/ena/browser/view/PRJEB54321', 'WGS data from Danish clinical isolates showing multi-drug resistance',
'genomic, MDR, Denmark, clinical isolates, WGS', '2023-12-15', 'genomics@ssi.dk',
'{"title": "Danish MDR Genomic Survey 2023", "creator": "Statens Serum Institut", "institution": "SSI", "geographic_coverage": "Denmark", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://ssi.dk/data", "research_area": "Clinical Genomics"}',
'Denmark', 'Human', 'Data'),

('FINAMR2023', 'population_data', 'antimicrobial_consumption', 'consumption_metrics', 'XLSX', 'comprehensive', 'Local Database',
'https://thl.fi/amr/2023', 'National antimicrobial susceptibility data from Finnish hospitals',
'Finland, consumption, surveillance, clinical', '2023-11-30', 'finres@thl.fi',
'{"title": "FINRES 2023 Data", "creator": "Finnish Institute for Health and Welfare", "institution": "THL", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "2023.1", "documentation_link": "https://thl.fi/finres", "research_area": "AMR Surveillance"}',
'Finland', 'Human', 'Data'),

('SEMET2023', 'environmental_data', 'climatological', 'temperature_anomalies', 'CSV', 'high_resolution', 'MG-RAST',
'https://www.mg-rast.org/SE2023', 'Environmental factors affecting AMR in Swedish agricultural sites',
'soil, agriculture, climate, Sweden', '2023-10-20', 'soil.amr@slu.se',
'{"title": "Swedish Agricultural Environmental Factors", "creator": "Swedish University of Agricultural Sciences", "institution": "SLU", "geographic_coverage": "Sweden", "license": "CC BY-SA 4.0", "version": "1.2", "documentation_link": "https://slu.se/amr", "research_area": "Environmental AMR"}',
'Sweden', 'Environment', 'Data'),

('NORCLIN23', 'omics_data', 'genomic', 'bacterial_genomes', 'FASTA', 'comprehensive', 'NCBI',
'https://www.ncbi.nlm.nih.gov/bioproject/PRJNA987654', 'Nordic collaborative clinical AMR surveillance data',
'Nordic, clinical, surveillance, bacterial genomes', '2023-12-20', 'nordic.amr@norden.org',
'{"title": "Nordic Clinical AMR Network Data 2023", "creator": "Nordic AMR Network", "institution": "Nordic Council", "geographic_coverage": "Nordic Countries", "license": "CC BY 4.0", "version": "2.0", "documentation_link": "https://nordic-amr.org", "research_area": "Clinical Surveillance"}',
'Norway', 'Human', 'Data'),

('DKWW2023', 'omics_data', 'metagenomic', 'wastewater_metagenomes', 'FASTQ', 'high_resolution', 'Institutional Repository',
'https://data.ku.dk/amr/ww2023', 'Copenhagen wastewater AMR monitoring program',
'wastewater, Denmark, surveillance, metagenomics', '2023-11-01', 'ww.amr@ku.dk',
'{"title": "Copenhagen Wastewater AMR Survey", "creator": "University of Copenhagen", "institution": "KU", "geographic_coverage": "Copenhagen, Denmark", "license": "CC BY 4.0", "version": "1.1", "documentation_link": "https://ku.dk/amr-data", "research_area": "Environmental Surveillance"}',
'Denmark', 'Environment', 'Data'),

('FIGEN2023', 'omics_data', 'metagenomic', 'environmental_metagenomes', 'FASTQ', 'high_resolution', 'ENA',
'https://www.ebi.ac.uk/ena/browser/view/PRJEB55555', 'Finnish hospital environmental metagenomics study',
'metagenomics, hospital environment, Finland', '2023-09-15', 'meta@helsinki.fi',
'{"title": "Finnish Hospital Microbiome Project", "creator": "University of Helsinki", "institution": "UH", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://helsinki.fi/meta", "research_area": "Environmental Genomics"}',
'Finland', 'Environment', 'Data'),

('NOPOP2023', 'population_data', 'disease_incidence', 'vector-borne', 'JSON', 'comprehensive', 'PATRIC',
'https://www.patricbrc.org/NO2023', 'Norwegian AMR outbreak surveillance data',
'epidemiology, outbreaks, Norway, surveillance', '2023-12-01', 'outbreak@fhi.no',
'{"title": "Norwegian AMR Outbreak Database", "creator": "Norwegian Institute of Public Health", "institution": "FHI", "geographic_coverage": "Norway", "license": "CC BY 4.0", "version": "3.0", "documentation_link": "https://fhi.no/amr", "research_area": "Epidemiology"}',
'Norway', 'Human', 'Systems'),

('SEPROF23', 'population_data', 'antimicrobial_consumption', 'consumption_metrics', 'CSV', 'comprehensive', 'Svebar',
'https://www.folkhalsomyndigheten.se/svebar/data/2023', 'Swedish national AMR profiling database',
'consumption, Sweden, surveillance, Svebar', '2023-11-25', 'profiles@folkhalsomyndigheten.se',
'{"title": "Swedish AMR Profile Database", "creator": "Public Health Agency of Sweden", "institution": "FOHM", "geographic_coverage": "Sweden", "license": "CC BY-NC 4.0", "version": "2.1", "documentation_link": "https://folkhalsomyndigheten.se/svebar", "research_area": "Clinical Surveillance"}',
'Sweden', 'Human', 'Data'),

('DKVET2023', 'omics_data', 'genomic', 'bacterial_genomes', 'FASTA', 'comprehensive', 'Local Database',
'https://www.food.dtu.dk/amr/vet2023', 'Danish veterinary AMR surveillance data',
'veterinary, genomic, Denmark, animals', '2023-10-30', 'vet.amr@food.dtu.dk',
'{"title": "DANMAP Veterinary Data 2023", "creator": "Technical University of Denmark", "institution": "DTU", "geographic_coverage": "Denmark", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://www.danmap.org", "research_area": "Veterinary Surveillance"}',
'Denmark', 'Animal', 'Data'),

('FIPROT23', 'omics_data', 'transcriptomic', 'host_response_profiling', 'TSV', 'high_resolution', 'PATRIC',
'https://www.patricbrc.org/FI2023', 'Transcriptomic analysis of AMR mechanisms in Finnish clinical isolates',
'transcriptomics, host response, Finland, resistance mechanisms', '2023-08-15', 'transcriptomics@utu.fi',
'{"title": "Finnish AMR Transcriptome Project", "creator": "University of Turku", "institution": "UTU", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://utu.fi/amr", "research_area": "Molecular Research"}',
'Finland', 'Human', 'Data'); 

-- Update the metadata JSON for each entry to ensure geographic_coverage is properly set

-- For Norwegian entries
UPDATE data_points 
SET metadata = json_set(metadata, '$.geographic_coverage', 'Norway') 
WHERE data_source_id LIKE 'NO%' OR data_source_id LIKE 'NOR%';

-- For Swedish entries
UPDATE data_points 
SET metadata = json_set(metadata, '$.geographic_coverage', 'Sweden') 
WHERE data_source_id LIKE 'SW%' OR data_source_id LIKE 'SE%';

-- For Danish entries
UPDATE data_points 
SET metadata = json_set(metadata, '$.geographic_coverage', 'Denmark') 
WHERE data_source_id LIKE 'DK%';

-- For Finnish entries
UPDATE data_points 
SET metadata = json_set(metadata, '$.geographic_coverage', 'Finland') 
WHERE data_source_id LIKE 'FI%'; 