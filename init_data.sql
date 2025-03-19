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
'{"title": "Stockholm Wastewater AMR Study", "creator": "Karolinska Institute", "institution": "KI", "geographic_coverage": "Stockholm, Sweden", "license": "CC BY-NC 4.0", "version": "2.1", "documentation_link": "https://ki.se/amr-data", "research_area": "Environmental Surveillance"}'),

('DKAMR2023', 'genomic', 'wgs', 'read_quality_reports', 'FASTQ', 'high_resolution', 'ENA',
'https://www.ebi.ac.uk/ena/browser/view/PRJEB54321', 'WGS data from Danish clinical isolates showing multi-drug resistance',
'genomic, MDR, Denmark, clinical isolates, WGS', '2023-12-15', 'genomics@ssi.dk',
'{"title": "Danish MDR Genomic Survey 2023", "creator": "Statens Serum Institut", "institution": "SSI", "geographic_coverage": "Denmark", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://ssi.dk/data", "research_area": "Clinical Genomics"}'),

('FINAMR2023', 'amr_specific', 'phenotypic', 'mic_data', 'XLSX', 'comprehensive', 'Local Database',
'https://thl.fi/amr/2023', 'National antimicrobial susceptibility data from Finnish hospitals',
'Finland, MIC, surveillance, clinical', '2023-11-30', 'finres@thl.fi',
'{"title": "FINRES 2023 Data", "creator": "Finnish Institute for Health and Welfare", "institution": "THL", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "2023.1", "documentation_link": "https://thl.fi/finres", "research_area": "AMR Surveillance"}'),

('SEMET2023', 'environmental', 'soil', 'resistome_data', 'FASTA', 'high_resolution', 'MG-RAST',
'https://www.mg-rast.org/SE2023', 'Soil resistome analysis from Swedish agricultural sites',
'soil, agriculture, resistome, Sweden', '2023-10-20', 'soil.amr@slu.se',
'{"title": "Swedish Agricultural Resistome Project", "creator": "Swedish University of Agricultural Sciences", "institution": "SLU", "geographic_coverage": "Sweden", "license": "CC BY-SA 4.0", "version": "1.2", "documentation_link": "https://slu.se/amr", "research_area": "Environmental AMR"}'),

('NORCLIN23', 'clinical', 'phenotypic', 'resistance_profiles', 'JSON', 'comprehensive', 'NCBI',
'https://www.ncbi.nlm.nih.gov/bioproject/PRJNA987654', 'Nordic collaborative clinical AMR surveillance data',
'Nordic, clinical, surveillance, resistance profiles', '2023-12-20', 'nordic.amr@norden.org',
'{"title": "Nordic Clinical AMR Network Data 2023", "creator": "Nordic AMR Network", "institution": "Nordic Council", "geographic_coverage": "Nordic Countries", "license": "CC BY 4.0", "version": "2.0", "documentation_link": "https://nordic-amr.org", "research_area": "Clinical Surveillance"}'),

('DKWW2023', 'environmental', 'water', 'resistance_monitoring', 'CSV', 'high_resolution', 'Institutional Repository',
'https://data.ku.dk/amr/ww2023', 'Copenhagen wastewater AMR monitoring program',
'wastewater, Denmark, surveillance, urban', '2023-11-01', 'ww.amr@ku.dk',
'{"title": "Copenhagen Wastewater AMR Survey", "creator": "University of Copenhagen", "institution": "KU", "geographic_coverage": "Copenhagen, Denmark", "license": "CC BY 4.0", "version": "1.1", "documentation_link": "https://ku.dk/amr-data", "research_area": "Environmental Surveillance"}'),

('FIGEN2023', 'genomic', 'metagenomic', 'taxonomic_profiles', 'TSV', 'high_resolution', 'ENA',
'https://www.ebi.ac.uk/ena/browser/view/PRJEB55555', 'Finnish hospital environmental metagenomics study',
'metagenomics, hospital environment, Finland', '2023-09-15', 'meta@helsinki.fi',
'{"title": "Finnish Hospital Microbiome Project", "creator": "University of Helsinki", "institution": "UH", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://helsinki.fi/meta", "research_area": "Environmental Genomics"}'),

('NOPOP2023', 'population', 'epidemiological', 'outbreak_data', 'JSON', 'comprehensive', 'PATRIC',
'https://www.patricbrc.org/NO2023', 'Norwegian AMR outbreak surveillance data',
'epidemiology, outbreaks, Norway, surveillance', '2023-12-01', 'outbreak@fhi.no',
'{"title": "Norwegian AMR Outbreak Database", "creator": "Norwegian Institute of Public Health", "institution": "FHI", "geographic_coverage": "Norway", "license": "CC BY 4.0", "version": "3.0", "documentation_link": "https://fhi.no/amr", "research_area": "Epidemiology"}'),

('SEPROF23', 'amr_specific', 'phenotypic', 'resistance_profiles', 'CSV', 'comprehensive', 'Svebar',
'https://www.folkhalsomyndigheten.se/svebar/data/2023', 'Swedish national AMR profiling database',
'resistance profiles, Sweden, surveillance, Svebar', '2023-11-25', 'profiles@folkhalsomyndigheten.se',
'{"title": "Swedish AMR Profile Database", "creator": "Public Health Agency of Sweden", "institution": "FOHM", "geographic_coverage": "Sweden", "license": "CC BY-NC 4.0", "version": "2.1", "documentation_link": "https://folkhalsomyndigheten.se/svebar", "research_area": "Clinical Surveillance"}'),

('DKVET2023', 'amr_specific', 'phenotypic', 'mic_data', 'XLSX', 'comprehensive', 'Local Database',
'https://www.food.dtu.dk/amr/vet2023', 'Danish veterinary AMR surveillance data',
'veterinary, MIC, Denmark, animals', '2023-10-30', 'vet.amr@food.dtu.dk',
'{"title": "DANMAP Veterinary Data 2023", "creator": "Technical University of Denmark", "institution": "DTU", "geographic_coverage": "Denmark", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://www.danmap.org", "research_area": "Veterinary Surveillance"}'),

('FIPROT23', 'proteomic', 'mass_spec', 'protein_quant', 'mzML', 'high_resolution', 'PATRIC',
'https://www.patricbrc.org/FI2023', 'Proteomic analysis of AMR mechanisms in Finnish clinical isolates',
'proteomics, mass spec, Finland, resistance mechanisms', '2023-08-15', 'proteomics@utu.fi',
'{"title": "Finnish AMR Proteome Project", "creator": "University of Turku", "institution": "UTU", "geographic_coverage": "Finland", "license": "CC BY 4.0", "version": "1.0", "documentation_link": "https://utu.fi/amr", "research_area": "Molecular Research"}'); 